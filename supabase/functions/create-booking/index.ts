import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BookingRequest {
  pickup_location: string;
  dropoff_location: string;
  pickup_date: string;
  pickup_time: string;
  vehicle_id: string;
  passenger_count: number;
  passenger_name: string;
  passenger_phone: string;
  special_requests?: string;
  is_shared_ride?: boolean;
  join_shared_ride_id?: string;
  payment_method?: string;
  estimated_distance?: number;
  segment_distance?: number; // Actual km for this passenger's segment
}

// Helper to get distance between two locations from routes table
async function getRouteDistance(supabase: any, from: string, to: string): Promise<number | null> {
  const { data: route } = await supabase
    .from('routes')
    .select('distance_km')
    .or(`and(from_location.eq.${from},to_location.eq.${to}),and(from_location.eq.${to},to_location.eq.${from})`)
    .single();
  
  return route?.distance_km || null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const bookingData: BookingRequest = await req.json();
    console.log('Creating booking for user:', user.id, bookingData);

    // Get vehicle pricing
    const { data: vehicle, error: vehicleError } = await supabase
      .from('vehicles')
      .select('price_per_km, capacity')
      .eq('id', bookingData.vehicle_id)
      .single();

    if (vehicleError || !vehicle) {
      throw new Error('Vehicle not found');
    }

    // Handle joining an existing shared ride
    // SHARED RIDE DISCOUNT - 30% off for all shared ride passengers
    const SHARED_RIDE_DISCOUNT = 0.30; // 30% discount

    if (bookingData.join_shared_ride_id) {
      console.log('Joining shared ride:', bookingData.join_shared_ride_id);

      // Get the primary booking
      const { data: primaryBooking, error: primaryError } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', bookingData.join_shared_ride_id)
        .eq('is_primary_booking', true)
        .eq('is_shared_ride', true)
        .single();

      if (primaryError || !primaryBooking) {
        throw new Error('Shared ride not found or not available');
      }

      // Check if there are available seats
      const { data: participants } = await supabase
        .from('shared_ride_participants')
        .select('*')
        .eq('primary_booking_id', primaryBooking.id);

      const occupiedSeats = (participants?.length || 0) + primaryBooking.passenger_count;
      
      if (occupiedSeats + bookingData.passenger_count > vehicle.capacity) {
        throw new Error('Not enough seats available');
      }

      // Calculate ACTUAL segment distance for this passenger
      // Priority: 1) provided segment_distance, 2) calculated from routes, 3) provided estimated_distance
      let segmentDistance = bookingData.segment_distance;
      
      if (!segmentDistance) {
        // Try to get distance from routes table for this passenger's specific segment
        const routeDistance = await getRouteDistance(
          supabase, 
          bookingData.pickup_location, 
          bookingData.dropoff_location
        );
        segmentDistance = routeDistance || bookingData.estimated_distance || 50;
      }

      console.log('Segment distance for joining passenger:', segmentDistance, 'km');
      
      // Calculate fare based on ACTUAL kilometers traveled with 30% SHARED RIDE DISCOUNT
      const baseFare = Number(segmentDistance) * Number(vehicle.price_per_km);
      const discountAmount = baseFare * SHARED_RIDE_DISCOUNT;
      const segmentFare = baseFare - discountAmount;
      const farePerPerson = segmentFare / bookingData.passenger_count;

      console.log('Calculated fare with 30% shared ride discount:', {
        segmentDistance,
        pricePerKm: vehicle.price_per_km,
        baseFare,
        discountAmount,
        discountedFare: segmentFare,
        farePerPerson,
        passengerCount: bookingData.passenger_count
      });

      // Create participant booking
      const { data: participantBooking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          user_id: user.id,
          vehicle_id: bookingData.vehicle_id,
          pickup_location: bookingData.pickup_location,
          dropoff_location: bookingData.dropoff_location,
          pickup_date: primaryBooking.pickup_date,
          pickup_time: primaryBooking.pickup_time,
          passenger_count: bookingData.passenger_count,
          passenger_name: bookingData.passenger_name,
          passenger_phone: bookingData.passenger_phone,
          special_requests: bookingData.special_requests,
          estimated_distance: segmentDistance,
          estimated_fare: segmentFare,
          status: 'confirmed',
          is_shared_ride: true,
          is_primary_booking: false,
          parent_booking_id: primaryBooking.id,
          fare_per_person: farePerPerson,
          route_segment_start: bookingData.pickup_location,
          route_segment_end: bookingData.dropoff_location
        })
        .select()
        .single();

      if (bookingError) {
        console.error('Participant booking creation error:', bookingError);
        throw bookingError;
      }

      // Add to shared ride participants with their segment fare
      const { error: participantError } = await supabase
        .from('shared_ride_participants')
        .insert({
          primary_booking_id: primaryBooking.id,
          participant_booking_id: participantBooking.id,
          pickup_location: bookingData.pickup_location,
          dropoff_location: bookingData.dropoff_location,
          fare_amount: segmentFare
        });

      if (participantError) {
        console.error('Participant entry error:', participantError);
      }

      // Update primary booking available seats
      await supabase
        .from('bookings')
        .update({ 
          available_seats: vehicle.capacity - (occupiedSeats + bookingData.passenger_count)
        })
        .eq('id', primaryBooking.id);

      // Create payment record with the segment-based fare
      const { data: payment } = await supabase
        .from('payments')
        .insert({
          booking_id: participantBooking.id,
          user_id: user.id,
          amount: segmentFare,
          payment_method: bookingData.payment_method || 'cash',
          status: 'pending'
        })
        .select()
        .single();

      console.log('Joined shared ride successfully:', participantBooking.id, 'Fare:', segmentFare);

      return new Response(
        JSON.stringify({ 
          booking: participantBooking, 
          payment,
          message: `Successfully joined shared ride. You pay ₹${segmentFare.toFixed(0)} for ${segmentDistance} km`,
          is_shared: true,
          segment_distance: segmentDistance,
          segment_fare: segmentFare
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create a new booking (potentially shared)
    // Calculate distance from routes table or use estimate
    const { data: route } = await supabase
      .from('routes')
      .select('distance_km')
      .or(`and(from_location.eq.${bookingData.pickup_location},to_location.eq.${bookingData.dropoff_location}),and(from_location.eq.${bookingData.dropoff_location},to_location.eq.${bookingData.pickup_location})`)
      .single();

    const distance = bookingData.estimated_distance || route?.distance_km || 100;
    const baseFare = Number(distance) * Number(vehicle.price_per_km);

    const availableSeats = bookingData.is_shared_ride 
      ? vehicle.capacity - bookingData.passenger_count 
      : 0;

    // SHARED RIDE: 30% discount for all passengers
    // REGULAR RIDE: Full fare
    let farePerPerson: number;
    let creatorFare: number;
    let discountApplied = 0;

    if (bookingData.is_shared_ride) {
      // Apply 30% discount for shared rides
      const discountedTotalFare = baseFare * (1 - SHARED_RIDE_DISCOUNT);
      discountApplied = baseFare * SHARED_RIDE_DISCOUNT;
      farePerPerson = discountedTotalFare / vehicle.capacity;
      creatorFare = farePerPerson * bookingData.passenger_count;
      
      console.log('Shared ride fare calculation:', {
        distance,
        baseFare,
        discountApplied,
        discountedTotalFare,
        farePerPerson,
        creatorFare
      });
    } else {
      // Regular ride - full fare
      farePerPerson = baseFare / bookingData.passenger_count;
      creatorFare = baseFare;
    }

    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        user_id: user.id,
        vehicle_id: bookingData.vehicle_id,
        pickup_location: bookingData.pickup_location,
        dropoff_location: bookingData.dropoff_location,
        pickup_date: bookingData.pickup_date,
        pickup_time: bookingData.pickup_time,
        passenger_count: bookingData.passenger_count,
        passenger_name: bookingData.passenger_name,
        passenger_phone: bookingData.passenger_phone,
        special_requests: bookingData.special_requests,
        estimated_distance: distance,
        estimated_fare: creatorFare,
        status: 'confirmed',
        is_shared_ride: bookingData.is_shared_ride || false,
        is_primary_booking: true,
        available_seats: availableSeats,
        fare_per_person: farePerPerson,
        route_segment_start: bookingData.pickup_location,
        route_segment_end: bookingData.dropoff_location
      })
      .select()
      .single();

    if (bookingError) {
      console.error('Booking creation error:', bookingError);
      throw bookingError;
    }

    // Create payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        booking_id: booking.id,
        user_id: user.id,
        amount: creatorFare,
        payment_method: bookingData.payment_method || 'cash',
        status: 'pending'
      })
      .select()
      .single();

    if (paymentError) {
      console.error('Payment creation error:', paymentError);
    }

    console.log('Booking created successfully:', booking.id, 'Fare:', creatorFare);

    return new Response(
      JSON.stringify({ 
        booking, 
        payment,
        message: bookingData.is_shared_ride 
          ? `Shared ride created. You pay ₹${creatorFare.toFixed(0)} for ${distance} km` 
          : 'Booking created successfully',
        is_shared: bookingData.is_shared_ride
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

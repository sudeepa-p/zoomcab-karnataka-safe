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
      .select('price_per_km')
      .eq('id', bookingData.vehicle_id)
      .single();

    if (vehicleError || !vehicle) {
      throw new Error('Vehicle not found');
    }

    // Calculate distance from routes table or use estimate
    const { data: route } = await supabase
      .from('routes')
      .select('distance_km')
      .or(`and(from_location.eq.${bookingData.pickup_location},to_location.eq.${bookingData.dropoff_location}),and(from_location.eq.${bookingData.dropoff_location},to_location.eq.${bookingData.pickup_location})`)
      .single();

    const distance = route?.distance_km || 100; // Default 100km if route not found
    const estimatedFare = Number(distance) * Number(vehicle.price_per_km);

    console.log('Calculated fare:', { distance, pricePerKm: vehicle.price_per_km, estimatedFare });

    // Create booking
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
        estimated_fare: estimatedFare,
        status: 'pending'
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
        amount: estimatedFare,
        payment_method: 'cash', // Default to cash
        status: 'pending'
      })
      .select()
      .single();

    if (paymentError) {
      console.error('Payment creation error:', paymentError);
    }

    console.log('Booking created successfully:', booking.id);

    return new Response(
      JSON.stringify({ 
        booking, 
        payment,
        message: 'Booking created successfully' 
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

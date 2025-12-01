import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Car, Clock, CheckCircle, Truck, Navigation, MapPinned, User, Phone, Share2, Users, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Booking {
  id: string;
  pickup_location: string;
  dropoff_location: string;
  pickup_date: string;
  pickup_time: string;
  status: string;
  estimated_distance: number;
  estimated_fare: number;
  passenger_name: string;
  passenger_phone: string;
  passenger_count: number;
  created_at: string;
  driver_name: string | null;
  driver_phone: string | null;
  driver_vehicle_number: string | null;
  is_shared_ride: boolean;
  is_primary_booking: boolean;
  parent_booking_id: string | null;
  available_seats: number;
  fare_per_person: number | null;
  vehicles: {
    name: string;
    vehicle_type: string;
  };
  payments: Array<{
    amount: number;
    status: string;
    payment_method: string;
  }>;
  participants?: Array<{
    id: string;
    pickup_location: string;
    dropoff_location: string;
    fare_amount: number;
    bookings: {
      passenger_name: string;
      passenger_count: number;
      pickup_location: string;
      dropoff_location: string;
    };
  }>;
  primary_booking?: {
    pickup_location: string;
    dropoff_location: string;
    passenger_name: string;
  };
}

const Bookings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    loadBookings();

    // Subscribe to booking updates for both primary and shared bookings
    const channel = supabase
      .channel('bookings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          loadBookings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, navigate]);

  const loadBookings = async () => {
    setLoading(true);
    
    // Load user's own bookings
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        vehicles(name, vehicle_type),
        payments(amount, status, payment_method)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load bookings');
      console.error(error);
      setLoading(false);
      return;
    }

    // For each booking, check if it's a shared ride and load participants
    const bookingsWithParticipants = await Promise.all(
      (data || []).map(async (booking) => {
        if (booking.is_shared_ride && booking.is_primary_booking) {
          const { data: participants } = await supabase
            .from('shared_ride_participants')
            .select(`
              id,
              pickup_location,
              dropoff_location,
              fare_amount,
              bookings!shared_ride_participants_participant_booking_id_fkey(
                passenger_name,
                passenger_count,
                pickup_location,
                dropoff_location
              )
            `)
            .eq('primary_booking_id', booking.id);
          
          return { ...booking, participants: participants || [] };
        }
        
        // If this is a participant booking, get the primary booking info
        if (booking.parent_booking_id) {
          const { data: primaryBooking } = await supabase
            .from('bookings')
            .select('pickup_location, dropoff_location, passenger_name')
            .eq('id', booking.parent_booking_id)
            .single();
          
          return { ...booking, primary_booking: primaryBooking };
        }
        
        return { ...booking, participants: [] };
      })
    );

    setBookings(bookingsWithParticipants);
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-500",
      confirmed: "bg-blue-500",
      driver_assigned: "bg-indigo-500",
      on_the_way: "bg-purple-500",
      picked_up: "bg-orange-500",
      in_transit: "bg-green-500",
      completed: "bg-emerald-600",
      cancelled: "bg-red-500"
    };
    return colors[status] || "bg-gray-500";
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, any> = {
      pending: Clock,
      confirmed: CheckCircle,
      driver_assigned: Car,
      on_the_way: Navigation,
      picked_up: MapPinned,
      in_transit: Truck,
      completed: CheckCircle,
      cancelled: Clock
    };
    const Icon = icons[status] || Clock;
    return <Icon className="h-4 w-4" />;
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const handleDeleteBooking = async (bookingId: string) => {
    setDeletingId(bookingId);
    try {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', bookingId);

      if (error) throw error;

      toast.success('Booking deleted successfully');
      loadBookings();
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error(error.message || 'Failed to delete booking');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading bookings...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95 py-12 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">My Bookings</h1>
          <Button onClick={() => navigate('/booking')}>
            New Booking
          </Button>
        </div>

        {bookings.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">No bookings yet</p>
              <Button onClick={() => navigate('/booking')}>
                Make Your First Booking
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <Card key={booking.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusIcon(booking.status)}
                        <Badge className={getStatusColor(booking.status)}>
                          {formatStatus(booking.status)}
                        </Badge>
                        {booking.is_shared_ride && (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Share2 className="h-3 w-3" />
                            {booking.is_primary_booking ? 'Shared Ride (Host)' : 'Shared Ride'}
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-xl mb-2">
                        {booking.pickup_location} → {booking.dropoff_location}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Car className="h-4 w-4" />
                        <span>{booking.vehicles.name}</span>
                      </div>
                    </div>
                    
                    {/* Delete Button */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          disabled={deletingId === booking.id}
                        >
                          {deletingId === booking.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Booking?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this booking? This action cannot be undone.
                            {booking.status === 'confirmed' || booking.status === 'driver_assigned' ? (
                              <span className="block mt-2 text-destructive font-medium">
                                ⚠️ This booking is active. Please consider canceling with the driver first.
                              </span>
                            ) : null}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteBooking(booking.id)}
                            className="bg-destructive hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{new Date(booking.pickup_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{booking.pickup_time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{booking.estimated_distance} km</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{booking.passenger_count} passenger(s)</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{booking.passenger_name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{booking.passenger_phone}</span>
                      </div>

                      {/* Show shared ride participants if this is a primary booking */}
                      {booking.is_shared_ride && booking.is_primary_booking && booking.participants && booking.participants.length > 0 && (
                        <div className="mt-3 p-3 bg-primary/5 rounded-lg">
                          <p className="font-semibold mb-2 flex items-center gap-2 text-sm">
                            <Share2 className="h-4 w-4" />
                            Co-Passengers ({booking.participants.length}):
                          </p>
                          {booking.participants.map((p: any, idx: number) => (
                            <div key={idx} className="text-xs ml-6 mb-1">
                              • {p.bookings?.passenger_name} ({p.bookings?.passenger_count}) - {p.bookings?.pickup_location} to {p.bookings?.dropoff_location}
                            </div>
                          ))}
                          <div className="text-xs text-muted-foreground mt-2">
                            Available seats: {booking.available_seats}
                          </div>
                        </div>
                      )}

                      {/* Show primary booking info if this is a participant */}
                      {booking.parent_booking_id && booking.primary_booking && (
                        <div className="mt-3 p-3 bg-secondary/50 rounded-lg">
                          <p className="font-semibold mb-1 flex items-center gap-2 text-xs">
                            <Share2 className="h-3 w-3" />
                            Ride hosted by: {booking.primary_booking.passenger_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Full route: {booking.primary_booking.pickup_location} → {booking.primary_booking.dropoff_location}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      {booking.driver_name && (
                        <div className="p-4 bg-primary/5 rounded-lg space-y-2">
                          <p className="text-sm font-semibold text-primary">Driver Information</p>
                          <div className="flex items-center gap-2 text-sm">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span>{booking.driver_name}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span>{booking.driver_phone}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Car className="h-4 w-4 text-muted-foreground" />
                            <span>{booking.driver_vehicle_number}</span>
                          </div>
                          {/* Contact Captain Button */}
                          {booking.driver_phone && (booking.status === 'confirmed' || booking.status === 'driver_assigned') && (
                            <Button 
                              className="w-full mt-3"
                              size="sm"
                              onClick={() => {
                                window.location.href = `tel:${booking.driver_phone}`;
                                toast.success('Opening phone dialer...');
                              }}
                            >
                              <Phone className="h-4 w-4 mr-2" />
                              Contact Captain
                            </Button>
                          )}
                        </div>
                      )}
                      
                      <div className="pt-4 border-t">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            {booking.is_shared_ride ? 'Your Share' : 'Total Fare'}
                          </span>
                          <span className="text-3xl font-bold text-primary">
                            ₹{Number(booking.estimated_fare).toFixed(0)}
                          </span>
                        </div>
                        {booking.is_shared_ride && booking.fare_per_person && (
                          <p className="text-xs text-muted-foreground mt-1 text-right">
                            ₹{Number(booking.fare_per_person).toFixed(0)}/person
                          </p>
                        )}
                        {booking.payments[0] && (
                          <Badge variant="outline" className="mt-2">
                            Payment: {booking.payments[0].status}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Bookings;

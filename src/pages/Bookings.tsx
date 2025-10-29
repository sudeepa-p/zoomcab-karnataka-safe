import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Car, CreditCard, Clock, CheckCircle, Truck, Navigation, MapPinned, User, Phone } from "lucide-react";
import { toast } from "sonner";

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
  created_at: string;
  driver_name: string | null;
  driver_phone: string | null;
  driver_vehicle_number: string | null;
  vehicles: {
    name: string;
    vehicle_type: string;
  };
  payments: Array<{
    amount: number;
    status: string;
    payment_method: string;
  }>;
}

const Bookings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    loadBookings();
  }, [user, navigate]);

  const loadBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          vehicles (name, vehicle_type),
          payments (amount, status, payment_method)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
      
      // Set up real-time subscription for status updates
      const channel = supabase
        .channel('bookings-realtime')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'bookings',
            filter: `user_id=eq.${user?.id}`
          },
          (payload) => {
            setBookings(prev => 
              prev.map(booking => 
                booking.id === payload.new.id 
                  ? { ...booking, ...payload.new }
                  : booking
              )
            );
            toast.success('Booking status updated!');
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch (error: any) {
      console.error('Error loading bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
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
                    <div>
                      <CardTitle className="text-xl mb-2">
                        {booking.pickup_location} → {booking.dropoff_location}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Car className="h-4 w-4" />
                        <span>{booking.vehicles.name}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(booking.status)}
                      <Badge className={getStatusColor(booking.status)}>
                        {formatStatus(booking.status)}
                      </Badge>
                    </div>
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
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{booking.passenger_name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{booking.passenger_phone}</span>
                      </div>
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
                        </div>
                      )}
                      
                      <div className="pt-4 border-t">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Total Fare</span>
                          <span className="text-3xl font-bold text-primary">
                            ₹{Number(booking.estimated_fare).toFixed(0)}
                          </span>
                        </div>
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

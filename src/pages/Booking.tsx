import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { MapPin, Calendar, Clock, Users, Phone, User } from "lucide-react";

interface Vehicle {
  id: string;
  name: string;
  vehicle_type: string;
  capacity: number;
  price_per_km: number;
}

interface Route {
  from_location: string;
  to_location: string;
  distance_km: number;
}

const Booking = () => {
  const { user, session } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  
  const [formData, setFormData] = useState({
    pickup_location: "",
    dropoff_location: "",
    pickup_date: "",
    pickup_time: "",
    vehicle_id: "",
    passenger_count: 1,
    passenger_name: "",
    passenger_phone: "",
    special_requests: ""
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    loadVehiclesAndRoutes();
  }, [user, navigate]);

  const loadVehiclesAndRoutes = async () => {
    const { data: vehiclesData } = await supabase
      .from('vehicles')
      .select('*')
      .order('price_per_km');
    
    const { data: routesData } = await supabase
      .from('routes')
      .select('*')
      .order('from_location');

    if (vehiclesData) setVehicles(vehiclesData);
    if (routesData) setRoutes(routesData);
  };

  const getUniqueLocations = () => {
    const locations = new Set<string>();
    routes.forEach(route => {
      locations.add(route.from_location);
      locations.add(route.to_location);
    });
    return Array.from(locations).sort();
  };

  const calculateEstimate = () => {
    if (!formData.pickup_location || !formData.dropoff_location || !formData.vehicle_id) {
      return null;
    }

    const route = routes.find(r => 
      (r.from_location === formData.pickup_location && r.to_location === formData.dropoff_location) ||
      (r.from_location === formData.dropoff_location && r.to_location === formData.pickup_location)
    );

    const vehicle = vehicles.find(v => v.id === formData.vehicle_id);
    
    if (route && vehicle) {
      const fare = Number(route.distance_km) * Number(vehicle.price_per_km);
      return { distance: route.distance_km, fare };
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session) {
      toast.error('Please sign in to continue');
      navigate('/auth');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-booking', {
        body: formData,
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) throw error;

      toast.success('🎉 Booking Confirmed! Your ride is being arranged. Check My Bookings for updates.', {
        duration: 5000,
      });
      navigate('/bookings');
    } catch (error: any) {
      console.error('Booking error:', error);
      toast.error(error.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  const locations = getUniqueLocations();
  const estimate = calculateEstimate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95 py-12 px-4">
      <div className="container mx-auto max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Book Your Cab</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Locations */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pickup_location">Pickup Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Select
                      value={formData.pickup_location}
                      onValueChange={(value) => setFormData({...formData, pickup_location: value})}
                      required
                    >
                      <SelectTrigger className="pl-10">
                        <SelectValue placeholder="Select pickup" />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.map(loc => (
                          <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="dropoff_location">Drop Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Select
                      value={formData.dropoff_location}
                      onValueChange={(value) => setFormData({...formData, dropoff_location: value})}
                      required
                    >
                      <SelectTrigger className="pl-10">
                        <SelectValue placeholder="Select drop" />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.map(loc => (
                          <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pickup_date">Pickup Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="pickup_date"
                      type="date"
                      className="pl-10"
                      value={formData.pickup_date}
                      onChange={(e) => setFormData({...formData, pickup_date: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="pickup_time">Pickup Time</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="pickup_time"
                      type="time"
                      className="pl-10"
                      value={formData.pickup_time}
                      onChange={(e) => setFormData({...formData, pickup_time: e.target.value})}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Vehicle Selection */}
              <div>
                <Label htmlFor="vehicle_id">Select Vehicle</Label>
                <Select
                  value={formData.vehicle_id}
                  onValueChange={(value) => setFormData({...formData, vehicle_id: value})}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose vehicle type" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles.map(vehicle => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        {vehicle.name} - ₹{vehicle.price_per_km}/km ({vehicle.capacity} seats)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Passenger Details */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="passenger_name">Passenger Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="passenger_name"
                      className="pl-10"
                      value={formData.passenger_name}
                      onChange={(e) => setFormData({...formData, passenger_name: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="passenger_phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="passenger_phone"
                      type="tel"
                      className="pl-10"
                      value={formData.passenger_phone}
                      onChange={(e) => setFormData({...formData, passenger_phone: e.target.value})}
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="passenger_count">Number of Passengers</Label>
                <div className="relative">
                  <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="passenger_count"
                    type="number"
                    min="1"
                    className="pl-10"
                    value={formData.passenger_count}
                    onChange={(e) => setFormData({...formData, passenger_count: parseInt(e.target.value)})}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="special_requests">Special Requests (Optional)</Label>
                <Textarea
                  id="special_requests"
                  value={formData.special_requests}
                  onChange={(e) => setFormData({...formData, special_requests: e.target.value})}
                  placeholder="Any special requirements..."
                />
              </div>

              {/* Fare Estimate */}
              {estimate && (
                <Card className="bg-primary/5">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-muted-foreground">Distance</p>
                        <p className="text-2xl font-bold">{estimate.distance} km</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Estimated Fare</p>
                        <p className="text-3xl font-bold text-primary">₹{estimate.fare.toFixed(0)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? 'Creating Booking...' : 'Confirm Booking'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Booking;

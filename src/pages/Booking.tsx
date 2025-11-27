import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Calendar, Clock, Users, Phone, User, Share2, Car, Route } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PopularRoutes } from "@/components/booking/PopularRoutes";
import { RouteMap } from "@/components/booking/RouteMap";
import { CityAutocomplete } from "@/components/booking/CityAutocomplete";

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

interface SharedRide {
  id: string;
  pickup_location: string;
  dropoff_location: string;
  pickup_date: string;
  pickup_time: string;
  available_seats: number;
  passenger_count: number;
  fare_per_person: number;
  vehicle_id: string;
  vehicles: {
    name: string;
    capacity: number;
  };
}

const Booking = () => {
  const { user, session } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [sharedRides, setSharedRides] = useState<SharedRide[]>([]);
  const [showSharedRides, setShowSharedRides] = useState(false);
  
  const [formData, setFormData] = useState({
    pickup_location: "",
    dropoff_location: "",
    pickup_date: "",
    pickup_time: "",
    vehicle_id: "",
    passenger_count: "1",
    passenger_name: "",
    passenger_phone: "",
    special_requests: "",
    is_shared_ride: false,
    join_shared_ride_id: ""
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    loadVehiclesAndRoutes();
  }, [user, navigate]);

  useEffect(() => {
    if (formData.pickup_location && formData.dropoff_location && formData.pickup_date) {
      loadAvailableSharedRides();
    }
  }, [formData.pickup_location, formData.dropoff_location, formData.pickup_date]);

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

  const loadAvailableSharedRides = async () => {
    const { data, error } = await supabase
      .from('bookings')
      .select('*, vehicles(name, capacity)')
      .eq('is_shared_ride', true)
      .eq('is_primary_booking', true)
      .eq('pickup_date', formData.pickup_date)
      .eq('status', 'confirmed')
      .gt('available_seats', 0);

    if (error) {
      console.error('Error loading shared rides:', error);
      return;
    }

    // Filter rides that match route or are on the same path
    const matchingRides = data?.filter(ride => {
      const matchesRoute = 
        (ride.pickup_location === formData.pickup_location && ride.dropoff_location === formData.dropoff_location) ||
        isOnRoute(formData.pickup_location, formData.dropoff_location, ride.pickup_location, ride.dropoff_location);
      
      return matchesRoute && ride.available_seats >= parseInt(formData.passenger_count);
    }) || [];

    setSharedRides(matchingRides as SharedRide[]);
  };

  const isOnRoute = (userPickup: string, userDrop: string, ridePickup: string, rideDrop: string) => {
    // Check if user's pickup/drop is between the ride's route
    const locations = [ridePickup, rideDrop, userPickup, userDrop];
    // Simple heuristic: if all locations are in routes, it's likely on the same path
    return locations.every(loc => routes.some(r => 
      r.from_location === loc || r.to_location === loc
    ));
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
      const fullFare = Number(route.distance_km) * Number(vehicle.price_per_km);
      const passengerCount = parseInt(formData.passenger_count) || 1;
      
      let fare = fullFare;
      if (formData.is_shared_ride) {
        // Estimate based on vehicle capacity sharing
        fare = (fullFare / vehicle.capacity) * passengerCount;
      }
      
      return { distance: route.distance_km, fare, fullFare };
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
        body: {
          ...formData,
          passenger_count: parseInt(formData.passenger_count) || 1
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) throw error;

      const message = formData.join_shared_ride_id 
        ? '🎉 You joined a shared ride! Check My Bookings for updates.'
        : formData.is_shared_ride
        ? '🎉 Shared ride created! Others can now join your ride.'
        : '🎉 Booking Confirmed! Your ride is being arranged.';
      
      toast.success(message, { duration: 5000 });
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

  const handleSelectPopularRoute = (from: string, to: string) => {
    setFormData({
      ...formData,
      pickup_location: from,
      dropoff_location: to,
    });
    toast.success(`Route selected: ${from} → ${to}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95 py-12 px-4">
      <div className="container mx-auto max-w-6xl space-y-6">
        {/* Page Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold flex items-center justify-center gap-2">
            <Route className="h-8 w-8 text-primary" />
            Book Your Journey
          </h1>
          <p className="text-muted-foreground">All-India cab booking with real-time tracking</p>
        </div>

        {/* Popular Routes Section */}
        <PopularRoutes routes={routes} onSelectRoute={handleSelectPopularRoute} />
        {/* Available Shared Rides */}
        {sharedRides.length > 0 && (
          <Card className="border-primary/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Share2 className="h-5 w-5 text-primary" />
                    Available Shared Rides
                  </CardTitle>
                  <CardDescription>
                    Join an existing ride and save money!
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSharedRides(!showSharedRides)}
                >
                  {showSharedRides ? 'Hide' : 'Show'} ({sharedRides.length})
                </Button>
              </div>
            </CardHeader>
            {showSharedRides && (
              <CardContent className="space-y-3">
                {sharedRides.map((ride) => (
                  <Card key={ride.id} className="bg-primary/5">
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <Car className="h-4 w-4" />
                            <span className="font-semibold">{ride.vehicles.name}</span>
                            <Badge variant="secondary">
                              {ride.available_seats} seats available
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            <div>{ride.pickup_location} → {ride.dropoff_location}</div>
                            <div>{ride.pickup_date} at {ride.pickup_time}</div>
                          </div>
                          <div className="text-lg font-bold text-primary">
                            ₹{Math.round(ride.fare_per_person * parseInt(formData.passenger_count))}/person
                          </div>
                        </div>
                        <Button
                          onClick={() => {
                            setFormData({
                              ...formData,
                              join_shared_ride_id: ride.id,
                              vehicle_id: ride.vehicle_id,
                              pickup_date: ride.pickup_date,
                              pickup_time: ride.pickup_time
                            });
                            toast.info('Form updated to join this ride');
                          }}
                          size="sm"
                        >
                          Join Ride
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            )}
          </Card>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Booking Form */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-3xl">
                {formData.join_shared_ride_id ? 'Join Shared Ride' : 'Book Your Cab'}
              </CardTitle>
              {estimate && (
                <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2">
                  <div className="flex items-center gap-2">
                    <Route className="h-4 w-4" />
                    <span className="font-semibold text-primary">{estimate.distance} km</span>
                  </div>
                  <div className="text-lg font-bold text-primary">
                    ₹{Math.round(estimate.fare)}
                  </div>
                  {formData.is_shared_ride && (
                    <Badge variant="secondary">Your Share</Badge>
                  )}
                </div>
              )}
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Locations with Autocomplete */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="pickup_location">Pickup Location</Label>
                    <CityAutocomplete
                      locations={locations}
                      value={formData.pickup_location}
                      onValueChange={(value) => setFormData({...formData, pickup_location: value})}
                      placeholder="Select pickup city"
                      disabled={false}
                    />
                  </div>

                  <div>
                    <Label htmlFor="dropoff_location">Drop Location</Label>
                    <CityAutocomplete
                      locations={locations}
                      value={formData.dropoff_location}
                      onValueChange={(value) => setFormData({...formData, dropoff_location: value})}
                      placeholder="Select drop city"
                      disabled={false}
                    />
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
                      disabled={!!formData.join_shared_ride_id}
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
                      disabled={!!formData.join_shared_ride_id}
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
                  disabled={!!formData.join_shared_ride_id}
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

              {/* Share Ride Option */}
              {!formData.join_shared_ride_id && (
                <div className="flex items-center space-x-2 p-4 bg-primary/5 rounded-lg">
                  <Switch
                    id="is_shared_ride"
                    checked={formData.is_shared_ride}
                    onCheckedChange={(checked) => setFormData({...formData, is_shared_ride: checked})}
                  />
                  <div className="flex-1">
                    <Label htmlFor="is_shared_ride" className="cursor-pointer">
                      <div className="flex items-center gap-2">
                        <Share2 className="h-4 w-4" />
                        <span className="font-semibold">Enable Ride Sharing</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Allow others to join your ride and split costs
                      </p>
                    </Label>
                  </div>
                </div>
              )}

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
                    onChange={(e) => setFormData({...formData, passenger_count: e.target.value})}
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

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? 'Processing...' : formData.join_shared_ride_id ? 'Join Shared Ride' : 'Confirm Booking'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Route Map Visualization */}
        <div className="lg:col-span-1">
          <RouteMap 
            pickupLocation={formData.pickup_location}
            dropoffLocation={formData.dropoff_location}
            distance={estimate?.distance}
          />
        </div>
      </div>
      </div>
    </div>
  );
};

export default Booking;

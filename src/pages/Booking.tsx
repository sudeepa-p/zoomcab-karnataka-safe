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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { Calendar, Clock, Users, Phone, User, Share2, Car, Route, Smartphone, Banknote, CreditCard, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PopularRoutes } from "@/components/booking/PopularRoutes";
import { RouteMap } from "@/components/booking/RouteMap";
import { CityAutocomplete } from "@/components/booking/CityAutocomplete";
import { AvailableSharedRides } from "@/components/booking/AvailableSharedRides";
import { FareComparison } from "@/components/booking/FareComparison";
import { IntelligentRideMatching } from "@/components/booking/IntelligentRideMatching";
import { karnatakaLocations } from "@/data/karnatakaLocations";

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
  estimated_distance: number;
  vehicle_id: string;
  driver_name?: string;
  driver_phone?: string;
  vehicles: {
    name: string;
    capacity: number;
  };
  matchScore: number;
  isExactMatch: boolean;
  isOnTheWay: boolean;
  intermediatePoint?: string;
}

const Booking = () => {
  const { user, session } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [calculatingDistance, setCalculatingDistance] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [sharedRides, setSharedRides] = useState<SharedRide[]>([]);
  const [showSharedRides, setShowSharedRides] = useState(false);
  const [calculatedDistance, setCalculatedDistance] = useState<number | null>(null);
  
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
    join_shared_ride_id: "",
    payment_method: "cash"
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

  // Auto calculate distance when locations change
  useEffect(() => {
    if (formData.pickup_location && formData.dropoff_location && 
        formData.pickup_location !== formData.dropoff_location) {
      calculateRealTimeDistance();
    } else {
      setCalculatedDistance(null);
    }
  }, [formData.pickup_location, formData.dropoff_location]);

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

  const calculateRealTimeDistance = async () => {
    setCalculatingDistance(true);
    try {
      // Try Google Maps Distance Matrix API first
      if (typeof (window as any).google !== 'undefined' && (window as any).google.maps) {
        const google = (window as any).google;
        const service = new google.maps.DistanceMatrixService();
        const response = await service.getDistanceMatrix({
          origins: [formData.pickup_location],
          destinations: [formData.dropoff_location],
          travelMode: google.maps.TravelMode.DRIVING,
          unitSystem: google.maps.UnitSystem.METRIC,
        });

        if (response.rows[0]?.elements[0]?.status === "OK") {
          const distanceInMeters = response.rows[0].elements[0].distance.value;
          const distanceInKm = Math.round((distanceInMeters / 1000) * 10) / 10;
          setCalculatedDistance(distanceInKm);
          toast.success(`Distance calculated: ${distanceInKm} km`);
          return;
        }
      }
      
      // Fallback to database route
      await calculateDistanceFromDatabase();
    } catch (error) {
      console.error("Distance calculation error:", error);
      // Fallback to database
      await calculateDistanceFromDatabase();
    } finally {
      setCalculatingDistance(false);
    }
  };

  const calculateDistanceFromDatabase = async () => {
    const route = routes.find(r => 
      (r.from_location === formData.pickup_location && r.to_location === formData.dropoff_location) ||
      (r.from_location === formData.dropoff_location && r.to_location === formData.pickup_location)
    );

    if (route) {
      setCalculatedDistance(route.distance_km);
      toast.info(`Using stored distance: ${route.distance_km} km`);
    } else {
      toast.warning("Distance not available for this route");
      setCalculatedDistance(null);
    }
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

    // Intelligent matching algorithm (like Ola's on-the-way system)
    const matchingRides = data?.map(ride => {
      let matchScore = 0;
      let isExactMatch = false;
      let isOnTheWay = false;
      let intermediatePoint = undefined;

      // Perfect match: same pickup and dropoff
      if (ride.pickup_location === formData.pickup_location && 
          ride.dropoff_location === formData.dropoff_location) {
        matchScore = 100;
        isExactMatch = true;
      }
      // On-the-way match: user's pickup/dropoff is between ride's route
      else if (isPointOnRoute(formData.pickup_location, formData.dropoff_location, 
                              ride.pickup_location, ride.dropoff_location)) {
        matchScore = 85;
        isOnTheWay = true;
        intermediatePoint = formData.pickup_location !== ride.pickup_location 
          ? formData.pickup_location 
          : formData.dropoff_location;
      }
      // Partial match: at least one location matches
      else if (ride.pickup_location === formData.pickup_location || 
               ride.dropoff_location === formData.dropoff_location) {
        matchScore = 60;
        isOnTheWay = true;
      }

      return {
        ...ride,
        matchScore,
        isExactMatch,
        isOnTheWay,
        intermediatePoint
      } as SharedRide;
    }).filter(ride => 
      ride.matchScore > 0 && 
      ride.available_seats >= parseInt(formData.passenger_count)
    ) || [];

    setSharedRides(matchingRides);
  };

  const isPointOnRoute = (userPickup: string, userDrop: string, ridePickup: string, rideDrop: string) => {
    // Intelligent route matching for Karnataka locations
    // Check if user's journey is part of the ride's main route
    
    // Example: Ride from Bengaluru to Hubballi, user wants Bengaluru to Dharwad
    // Dharwad is on the way to Hubballi
    const commonRouteClusters = [
      ['Bengaluru', 'Tumakuru', 'Chitradurga', 'Davangere', 'Hubballi', 'Dharwad'],
      ['Bengaluru', 'Mysuru', 'Chamarajanagar', 'Gundlupet'],
      ['Bengaluru', 'Hassan', 'Shivamogga', 'Shimoga'],
      ['Mysuru', 'Hassan', 'Mangaluru', 'Udupi'],
      ['Hubballi', 'Gadag', 'Bagalkot', 'Bijapur', 'Vijayapura'],
      ['Bengaluru', 'Kolar', 'Mulbagal', 'Anantapur'],
    ];

    // Check if all four points are in a common route cluster
    for (const cluster of commonRouteClusters) {
      const allInCluster = [ridePickup, rideDrop, userPickup, userDrop].every(loc =>
        cluster.some(city => loc.toLowerCase().includes(city.toLowerCase()))
      );
      
      if (allInCluster) {
        // Check if user's segment is within the ride's segment
        const ridePickupIndex = cluster.findIndex(c => ridePickup.toLowerCase().includes(c.toLowerCase()));
        const rideDropIndex = cluster.findIndex(c => rideDrop.toLowerCase().includes(c.toLowerCase()));
        const userPickupIndex = cluster.findIndex(c => userPickup.toLowerCase().includes(c.toLowerCase()));
        const userDropIndex = cluster.findIndex(c => userDrop.toLowerCase().includes(c.toLowerCase()));

        if (ridePickupIndex !== -1 && rideDropIndex !== -1 && 
            userPickupIndex !== -1 && userDropIndex !== -1) {
          // User's route should be within ride's route
          return (userPickupIndex >= Math.min(ridePickupIndex, rideDropIndex) &&
                  userDropIndex <= Math.max(ridePickupIndex, rideDropIndex));
        }
      }
    }

    return false;
  };

  const getUniqueLocations = () => {
    // Use Karnataka locations only
    return karnatakaLocations;
  };

  const calculateEstimate = () => {
    if (!formData.pickup_location || !formData.dropoff_location || !formData.vehicle_id) {
      return null;
    }

    const distance = calculatedDistance || routes.find(r => 
      (r.from_location === formData.pickup_location && r.to_location === formData.dropoff_location) ||
      (r.from_location === formData.dropoff_location && r.to_location === formData.pickup_location)
    )?.distance_km;

    const vehicle = vehicles.find(v => v.id === formData.vehicle_id);
    
    if (distance && vehicle) {
      const fullFare = Number(distance) * Number(vehicle.price_per_km);
      const passengerCount = parseInt(formData.passenger_count) || 1;
      
      let fare = fullFare;
      if (formData.is_shared_ride) {
        // Estimate based on vehicle capacity sharing
        fare = (fullFare / vehicle.capacity) * passengerCount;
      }
      
      return { distance, fare, fullFare };
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

    if (!calculatedDistance && !formData.join_shared_ride_id) {
      toast.error('Please wait for distance calculation or select a valid route');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-booking', {
        body: {
          ...formData,
          passenger_count: parseInt(formData.passenger_count) || 1,
          estimated_distance: calculatedDistance
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
          <p className="text-muted-foreground">Karnataka Outstation Cabs with Intelligent Ride Sharing</p>
        </div>

        {/* Popular Routes Section */}
        <PopularRoutes routes={routes} onSelectRoute={handleSelectPopularRoute} />
        
        {/* Available Shared Rides on Same Route */}
        {formData.pickup_location && formData.dropoff_location && sharedRides.length > 0 && (
          <AvailableSharedRides 
            rides={sharedRides.map(ride => ({
              id: ride.id,
              pickup_location: ride.pickup_location,
              dropoff_location: ride.dropoff_location,
              pickup_date: ride.pickup_date,
              pickup_time: ride.pickup_time,
              available_seats: ride.available_seats,
              fare_per_person: ride.fare_per_person,
              driver_name: ride.driver_name,
              driver_phone: ride.driver_phone,
              vehicle_name: ride.vehicles.name
            }))}
            onJoinRide={(rideId) => {
              const ride = sharedRides.find(r => r.id === rideId);
              if (ride) {
                setFormData({
                  ...formData,
                  join_shared_ride_id: rideId,
                  vehicle_id: ride.vehicle_id,
                  pickup_date: ride.pickup_date,
                  pickup_time: ride.pickup_time
                });
                toast.success("Joined shared ride!");
              }
            }}
          />
        )}
        
        {/* Intelligent Ride Matching */}
        {formData.pickup_location && formData.dropoff_location && formData.pickup_date && (
          <IntelligentRideMatching
            userPickup={formData.pickup_location}
            userDropoff={formData.dropoff_location}
            matchedRides={sharedRides}
            onJoinRide={(rideId, vehicleId, pickupDate, pickupTime) => {
              setFormData({
                ...formData,
                join_shared_ride_id: rideId,
                vehicle_id: vehicleId,
                pickup_date: pickupDate,
                pickup_time: pickupTime
              });
            }}
            passengerCount={parseInt(formData.passenger_count)}
          />
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
                    {calculatingDistance ? (
                      <div className="flex items-center gap-1">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        <span>Calculating...</span>
                      </div>
                    ) : (
                      <span className="font-semibold text-primary">{estimate.distance} km</span>
                    )}
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

                {/* Real-time Fare Comparison */}
                {estimate && formData.vehicle_id && (
                  <div className="my-6 p-6 bg-gradient-to-br from-primary/5 via-primary/3 to-background rounded-xl border-2 border-primary/20">
                    <div className="flex items-center gap-2 mb-4">
                      <Car className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold text-lg">Live Fare Calculation</h3>
                      {calculatingDistance && (
                        <Loader2 className="h-4 w-4 animate-spin text-primary ml-2" />
                      )}
                    </div>
                    <FareComparison
                      distance={estimate.distance}
                      vehicleName={vehicles.find(v => v.id === formData.vehicle_id)?.name || ""}
                      vehicleCapacity={vehicles.find(v => v.id === formData.vehicle_id)?.capacity || 4}
                      pricePerKm={vehicles.find(v => v.id === formData.vehicle_id)?.price_per_km || 0}
                      passengerCount={parseInt(formData.passenger_count) || 1}
                      isSharedRide={formData.is_shared_ride}
                    />
                  </div>
                )}

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

                {/* Payment Method Selection */}
                <div className="space-y-3">
                  <Label>Payment Method</Label>
                  <RadioGroup 
                    value={formData.payment_method} 
                    onValueChange={(value) => setFormData({...formData, payment_method: value})}
                  >
                    <div className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-accent cursor-pointer transition-colors">
                      <RadioGroupItem value="cash" id="cash" />
                      <Label htmlFor="cash" className="flex items-center gap-2 cursor-pointer flex-1">
                        <Banknote className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-medium">Cash</p>
                          <p className="text-sm text-muted-foreground">Pay the driver directly</p>
                        </div>
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-accent cursor-pointer transition-colors">
                      <RadioGroupItem value="phone_pay" id="phone_pay" />
                      <Label htmlFor="phone_pay" className="flex items-center gap-2 cursor-pointer flex-1">
                        <Smartphone className="h-5 w-5 text-purple-600" />
                        <div>
                          <p className="font-medium">PhonePe</p>
                          <p className="text-sm text-muted-foreground">Pay via PhonePe UPI</p>
                        </div>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-accent cursor-pointer transition-colors">
                      <RadioGroupItem value="google_pay" id="google_pay" />
                      <Label htmlFor="google_pay" className="flex items-center gap-2 cursor-pointer flex-1">
                        <Smartphone className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium">Google Pay</p>
                          <p className="text-sm text-muted-foreground">Pay via Google Pay UPI</p>
                        </div>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-accent cursor-pointer transition-colors">
                      <RadioGroupItem value="upi" id="upi" />
                      <Label htmlFor="upi" className="flex items-center gap-2 cursor-pointer flex-1">
                        <CreditCard className="h-5 w-5 text-orange-600" />
                        <div>
                          <p className="font-medium">UPI</p>
                          <p className="text-sm text-muted-foreground">Pay via any UPI app</p>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={loading || calculatingDistance}>
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
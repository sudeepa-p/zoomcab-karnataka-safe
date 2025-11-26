import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDriverAuth } from "@/contexts/DriverAuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Car, DollarSign, MapPin, Navigation, Settings, LogOut, Clock } from "lucide-react";
import { toast } from "sonner";

const DriverDashboard = () => {
  const navigate = useNavigate();
  const { user, isDriver, driverProfile, signOut } = useDriverAuth();
  const [isAvailable, setIsAvailable] = useState(false);
  const [bookings, setBookings] = useState<any[]>([]);
  const [earnings, setEarnings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !isDriver) {
      navigate("/driver/auth");
      return;
    }

    loadDashboardData();
  }, [user, isDriver, navigate]);

  const loadDashboardData = async () => {
    try {
      if (!driverProfile) return;

      setIsAvailable(driverProfile.is_available || false);

      const { data: bookingsData } = await supabase
        .from("bookings")
        .select("*")
        .eq("driver_id", driverProfile.id)
        .in("status", ["confirmed", "driver_assigned", "on_the_way", "picked_up", "in_transit"])
        .order("pickup_date", { ascending: true });

      setBookings(bookingsData || []);

      const { data: earningsData } = await supabase
        .from("driver_earnings")
        .select("net_amount")
        .eq("driver_id", driverProfile.id);

      const totalEarnings = earningsData?.reduce((sum, e) => sum + Number(e.net_amount), 0) || 0;
      setEarnings({ total: totalEarnings, pending: 0 });

    } catch (error) {
      console.error("Error loading dashboard:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleAvailabilityToggle = async (checked: boolean) => {
    try {
      if (!driverProfile) return;

      const { error } = await supabase
        .from("driver_profiles")
        .update({ is_available: checked })
        .eq("id", driverProfile.id);

      if (error) throw error;

      setIsAvailable(checked);
      toast.success(checked ? "You are now available for rides" : "You are now offline");
    } catch (error) {
      console.error("Error updating availability:", error);
      toast.error("Failed to update availability");
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'confirmed': 'bg-blue-500',
      'driver_assigned': 'bg-purple-500',
      'on_the_way': 'bg-orange-500',
      'picked_up': 'bg-cyan-500',
      'in_transit': 'bg-green-500',
    };
    return colors[status] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-background border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Driver Dashboard</h1>
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate("/")}>
                <MapPin className="h-4 w-4 mr-2" />
                Home
              </Button>
              <Button variant="outline" onClick={signOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                Availability
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Label htmlFor="availability" className="text-base">
                  {isAvailable ? "Online" : "Offline"}
                </Label>
                <Switch
                  id="availability"
                  checked={isAvailable}
                  onCheckedChange={handleAvailabilityToggle}
                />
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Toggle to {isAvailable ? "go offline" : "accept ride requests"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Total Earnings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">₹{earnings?.total.toFixed(2) || "0.00"}</p>
              <Button 
                variant="link" 
                className="p-0 h-auto mt-2"
                onClick={() => navigate("/driver/earnings")}
              >
                View Details →
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Navigation className="h-5 w-5" />
                Total Rides
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{driverProfile?.total_rides || 0}</p>
              <p className="text-sm text-muted-foreground mt-2">
                Rating: {driverProfile?.rating || "5.0"} ⭐
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Active Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            {bookings.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No active bookings</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {isAvailable ? "Waiting for ride requests..." : "Go online to receive bookings"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <Card key={booking.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{booking.passenger_name}</h3>
                            <Badge className={getStatusColor(booking.status)}>
                              {booking.status.replace('_', ' ').toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{booking.passenger_phone}</p>
                        </div>
                        <p className="text-lg font-bold">₹{booking.estimated_fare}</p>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-green-500 mt-0.5" />
                          <div>
                            <span className="font-medium">Pickup:</span> {booking.pickup_location}
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-red-500 mt-0.5" />
                          <div>
                            <span className="font-medium">Drop:</span> {booking.dropoff_location}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{booking.pickup_date} at {booking.pickup_time}</span>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-4">
                        <Button className="flex-1" onClick={() => navigate(`/driver/ride/${booking.id}`)}>
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <Button 
            variant="outline" 
            size="lg" 
            className="h-20"
            onClick={() => navigate("/driver/vehicle")}
          >
            <Car className="h-6 w-6 mr-3" />
            <div className="text-left">
              <div className="font-semibold">Vehicle Management</div>
              <div className="text-sm text-muted-foreground">Manage your vehicle details</div>
            </div>
          </Button>

          <Button 
            variant="outline" 
            size="lg" 
            className="h-20"
            onClick={() => navigate("/driver/preferences")}
          >
            <Settings className="h-6 w-6 mr-3" />
            <div className="text-left">
              <div className="font-semibold">Route Preferences</div>
              <div className="text-sm text-muted-foreground">Set your preferred routes</div>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DriverDashboard;

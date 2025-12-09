import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, Users, MapPin, Clock, Calendar, Car, CheckCircle, Route } from "lucide-react";

interface SameRouteRide {
  id: string;
  pickup_location: string;
  dropoff_location: string;
  pickup_date: string;
  pickup_time: string;
  available_seats: number;
  fare_per_person: number;
  driver_name?: string;
  driver_phone?: string;
  vehicle_name: string;
  matchType: 'exact' | 'on_the_way';
}

interface SameRouteRidesProps {
  rides: SameRouteRide[];
  onJoinRide: (rideId: string) => void;
  userPickup: string;
  userDropoff: string;
}

export const SameRouteRides = ({ rides, onJoinRide, userPickup, userDropoff }: SameRouteRidesProps) => {
  if (rides.length === 0) return null;

  const exactMatches = rides.filter(r => r.matchType === 'exact');
  const onTheWayMatches = rides.filter(r => r.matchType === 'on_the_way');

  const handleContactCaptain = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  return (
    <Card className="border-2 border-primary/30 bg-primary/5">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <Route className="h-6 w-6 text-primary" />
          <CardTitle className="text-xl">Available Rides on Your Route</CardTitle>
        </div>
        <CardDescription>
          Found {rides.length} shared ride(s) from {userPickup} to {userDropoff}. 
          <Badge className="ml-2 bg-green-600 text-white">30% OFF</Badge> for all shared rides!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Exact Matches */}
        {exactMatches.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold text-sm flex items-center gap-2 text-green-600">
              <CheckCircle className="h-4 w-4" />
              Perfect Match - Same Route ({exactMatches.length})
            </h4>
            <div className="grid gap-3">
              {exactMatches.map((ride) => (
                <div
                  key={ride.id}
                  className="border rounded-lg p-4 bg-background hover:border-primary transition-colors"
                >
                  <div className="flex flex-wrap justify-between items-start gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="default" className="bg-green-600">Perfect Match</Badge>
                        <Badge variant="outline">{ride.vehicle_name}</Badge>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-green-500" />
                        <span>{ride.pickup_location}</span>
                        <span className="text-muted-foreground">→</span>
                        <span>{ride.dropoff_location}</span>
                      </div>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(ride.pickup_date).toLocaleDateString('en-IN')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {ride.pickup_time}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {ride.available_seats} seats left
                        </span>
                      </div>

                      {ride.driver_name && (
                        <div className="flex items-center gap-2 text-sm mt-2 p-2 bg-muted rounded">
                          <Car className="h-4 w-4" />
                          <span>Captain: {ride.driver_name}</span>
                          {ride.driver_phone && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="ml-2 h-7"
                              onClick={() => handleContactCaptain(ride.driver_phone!)}
                            >
                              <Phone className="h-3 w-3 mr-1" />
                              Call
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="text-right space-y-2">
                      <div className="text-xs text-muted-foreground line-through">
                        ₹{Math.round(ride.fare_per_person / 0.7)}
                      </div>
                      <div className="text-2xl font-bold text-green-600">
                        ₹{Math.round(ride.fare_per_person)}
                      </div>
                      <div className="text-xs text-green-600 font-medium">30% OFF · per person</div>
                      <Button onClick={() => onJoinRide(ride.id)} size="sm" className="w-full">
                        Join This Ride
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* On The Way Matches */}
        {onTheWayMatches.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold text-sm flex items-center gap-2 text-blue-600">
              <Route className="h-4 w-4" />
              On The Way - Similar Route ({onTheWayMatches.length})
            </h4>
            <div className="grid gap-3">
              {onTheWayMatches.map((ride) => (
                <div
                  key={ride.id}
                  className="border rounded-lg p-4 bg-background hover:border-primary/50 transition-colors"
                >
                  <div className="flex flex-wrap justify-between items-start gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">On The Way</Badge>
                        <Badge variant="outline">{ride.vehicle_name}</Badge>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-blue-500" />
                        <span>{ride.pickup_location}</span>
                        <span className="text-muted-foreground">→</span>
                        <span>{ride.dropoff_location}</span>
                      </div>
                      
                      <p className="text-xs text-muted-foreground">
                        Your route ({userPickup} → {userDropoff}) falls on this cab's path
                      </p>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(ride.pickup_date).toLocaleDateString('en-IN')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {ride.pickup_time}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {ride.available_seats} seats left
                        </span>
                      </div>

                      {ride.driver_name && (
                        <div className="flex items-center gap-2 text-sm mt-2 p-2 bg-muted rounded">
                          <Car className="h-4 w-4" />
                          <span>Captain: {ride.driver_name}</span>
                          {ride.driver_phone && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="ml-2 h-7"
                              onClick={() => handleContactCaptain(ride.driver_phone!)}
                            >
                              <Phone className="h-3 w-3 mr-1" />
                              Call
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="text-right space-y-2">
                      <div className="text-xs text-muted-foreground line-through">
                        ₹{Math.round(ride.fare_per_person / 0.7)}
                      </div>
                      <div className="text-2xl font-bold text-green-600">
                        ₹{Math.round(ride.fare_per_person)}
                      </div>
                      <div className="text-xs text-green-600 font-medium">30% OFF · per person</div>
                      <Button onClick={() => onJoinRide(ride.id)} size="sm" variant="secondary" className="w-full">
                        Join This Ride
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="text-xs text-muted-foreground text-center pt-2">
          Captain will contact you 30 minutes before pickup time
        </p>
      </CardContent>
    </Card>
  );
};

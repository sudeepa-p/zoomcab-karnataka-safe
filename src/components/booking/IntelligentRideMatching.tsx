import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Car, MapPin, Users, Clock, TrendingDown, Share2 } from "lucide-react";
import { toast } from "sonner";

interface MatchedRide {
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
  vehicles: {
    name: string;
    capacity: number;
  };
  matchScore: number; // 0-100, how well it matches the user's route
  isExactMatch: boolean;
  isOnTheWay: boolean;
  intermediatePoint?: string;
}

interface IntelligentRideMatchingProps {
  userPickup: string;
  userDropoff: string;
  matchedRides: MatchedRide[];
  onJoinRide: (rideId: string, vehicleId: string, pickupDate: string, pickupTime: string) => void;
  passengerCount: number;
}

export const IntelligentRideMatching = ({
  userPickup,
  userDropoff,
  matchedRides,
  onJoinRide,
  passengerCount
}: IntelligentRideMatchingProps) => {
  
  if (matchedRides.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="pt-6 text-center">
          <Share2 className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
          <p className="text-muted-foreground mb-2">No matching shared rides found</p>
          <p className="text-sm text-muted-foreground">
            Enable ride sharing in your booking to help others find your ride
          </p>
        </CardContent>
      </Card>
    );
  }

  // Sort by match score
  const sortedRides = [...matchedRides].sort((a, b) => b.matchScore - a.matchScore);

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Share2 className="h-6 w-6 text-primary" />
              Intelligent Ride Matching
            </CardTitle>
            <CardDescription className="mt-1">
              Smart matches based on your route • Save money & reduce carbon footprint
            </CardDescription>
          </div>
          <Badge variant="secondary" className="text-sm">
            {matchedRides.length} {matchedRides.length === 1 ? 'Match' : 'Matches'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {sortedRides.map((ride) => (
          <Card 
            key={ride.id} 
            className={`transition-all hover:shadow-lg ${
              ride.isExactMatch ? 'border-primary bg-primary/5' : 
              ride.isOnTheWay ? 'border-blue-500/50 bg-blue-500/5' : 
              'bg-background'
            }`}
          >
            <CardContent className="pt-6">
              <div className="space-y-4">
                {/* Header with Match Info */}
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Car className="h-5 w-5 text-primary" />
                      <span className="font-semibold text-lg">{ride.vehicles.name}</span>
                      {ride.isExactMatch && (
                        <Badge className="bg-green-500">Perfect Match</Badge>
                      )}
                      {ride.isOnTheWay && !ride.isExactMatch && (
                        <Badge className="bg-blue-500">On The Way</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{ride.available_seats} seats available</span>
                      <span>•</span>
                      <span>Match: {ride.matchScore}%</span>
                    </div>
                  </div>
                  
                  {/* Price with Savings */}
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">
                      ₹{Math.round(ride.fare_per_person * passengerCount)}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-green-600">
                      <TrendingDown className="h-3 w-3" />
                      <span>Save ~60%</span>
                    </div>
                  </div>
                </div>

                {/* Route Information */}
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <span className="font-medium">Pickup: </span>
                      <span className={ride.pickup_location === userPickup ? "text-green-600 font-semibold" : ""}>
                        {ride.pickup_location}
                      </span>
                      {ride.pickup_location !== userPickup && ride.isOnTheWay && (
                        <Badge variant="outline" className="ml-2 text-xs">Your stop: {userPickup}</Badge>
                      )}
                    </div>
                  </div>
                  
                  {ride.intermediatePoint && (
                    <div className="flex items-start gap-2 ml-4">
                      <MapPin className="h-4 w-4 text-blue-500 mt-1 flex-shrink-0" />
                      <div>
                        <span className="font-medium text-blue-600">Via: </span>
                        <span className="text-blue-600">{ride.intermediatePoint}</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-red-500 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <span className="font-medium">Dropoff: </span>
                      <span className={ride.dropoff_location === userDropoff ? "text-green-600 font-semibold" : ""}>
                        {ride.dropoff_location}
                      </span>
                      {ride.dropoff_location !== userDropoff && ride.isOnTheWay && (
                        <Badge variant="outline" className="ml-2 text-xs">Your stop: {userDropoff}</Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Time & Distance */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{ride.pickup_date} at {ride.pickup_time}</span>
                  </div>
                  <div>
                    <span>•</span>
                  </div>
                  <div>
                    <span>{ride.estimated_distance} km</span>
                  </div>
                </div>

                {/* Match Explanation */}
                {ride.isOnTheWay && !ride.isExactMatch && (
                  <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg text-sm">
                    <p className="text-blue-700 dark:text-blue-400">
                      <strong>On-the-way pickup:</strong> This ride passes through your pickup/dropoff locations, 
                      allowing you to join mid-route and share the journey!
                    </p>
                  </div>
                )}

                {/* Action Button */}
                <Button 
                  onClick={() => {
                    onJoinRide(ride.id, ride.vehicle_id, ride.pickup_date, ride.pickup_time);
                    toast.success(`Joining ${ride.isExactMatch ? 'exact' : 'on-the-way'} match!`);
                  }}
                  className="w-full"
                  size="lg"
                  disabled={ride.available_seats < passengerCount}
                >
                  {ride.available_seats < passengerCount ? (
                    `Not enough seats (${ride.available_seats} available)`
                  ) : (
                    <>
                      Join This Ride
                      {ride.isExactMatch && ' - Perfect Match!'}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
};

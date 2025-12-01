import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Car, MapPin, Users, Clock, Phone } from "lucide-react";
import { toast } from "sonner";

interface SharedRide {
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
}

interface AvailableSharedRidesProps {
  rides: SharedRide[];
  onJoinRide: (rideId: string) => void;
}

export const AvailableSharedRides = ({ rides, onJoinRide }: AvailableSharedRidesProps) => {
  if (rides.length === 0) {
    return null;
  }

  const handleContactCaptain = (phone: string) => {
    window.location.href = `tel:${phone}`;
    toast.success("Calling captain...");
  };

  return (
    <Card className="border-green-500/30 bg-green-500/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Car className="h-5 w-5 text-green-600" />
          Available Shared Rides on This Route
          <Badge className="ml-auto bg-green-600">{rides.length} Available</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {rides.map((ride) => (
          <Card key={ride.id} className="border-border hover:shadow-md transition-all">
            <CardContent className="pt-6">
              <div className="space-y-4">
                {/* Route Info */}
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-green-500" />
                      <span className="font-semibold">{ride.pickup_location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-red-500" />
                      <span className="font-semibold">{ride.dropoff_location}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">
                      ₹{ride.fare_per_person}
                    </div>
                    <div className="text-xs text-muted-foreground">per person</div>
                  </div>
                </div>

                {/* Time & Vehicle Info */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{ride.pickup_date} at {ride.pickup_time}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Car className="h-4 w-4" />
                    <span>{ride.vehicle_name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{ride.available_seats} seats left</span>
                  </div>
                </div>

                {/* Captain Info */}
                {ride.driver_name && ride.driver_phone && (
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <p className="text-sm font-medium mb-2">Captain: {ride.driver_name}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleContactCaptain(ride.driver_phone!)}
                      className="w-full"
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Contact Captain
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                      Captain will call you 30 min before pickup
                    </p>
                  </div>
                )}

                {/* Join Button */}
                <Button 
                  onClick={() => onJoinRide(ride.id)}
                  className="w-full"
                  size="lg"
                >
                  Join This Ride
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
};

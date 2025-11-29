import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Car, Share2, Users, Check } from "lucide-react";

interface FareComparisonProps {
  distance: number;
  vehicleName: string;
  vehicleCapacity: number;
  pricePerKm: number;
  passengerCount: number;
  isSharedRide: boolean;
}

export const FareComparison = ({
  distance,
  vehicleName,
  vehicleCapacity,
  pricePerKm,
  passengerCount,
  isSharedRide,
}: FareComparisonProps) => {
  const fullFare = Math.round(distance * pricePerKm);
  const sharedFarePerPerson = Math.round((fullFare / vehicleCapacity) * passengerCount);
  const savingsAmount = fullFare - sharedFarePerPerson;
  const savingsPercent = Math.round((savingsAmount / fullFare) * 100);

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {/* Regular Ride Card */}
      <Card className={`relative transition-all ${!isSharedRide ? 'border-primary shadow-lg scale-105' : 'opacity-75'}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Car className="h-5 w-5" />
              Regular Ride
            </CardTitle>
            {!isSharedRide && (
              <Badge variant="default" className="animate-pulse">
                <Check className="h-3 w-3 mr-1" />
                Selected
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Vehicle</span>
              <span className="font-medium">{vehicleName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Distance</span>
              <span className="font-medium">{distance} km</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Rate</span>
              <span className="font-medium">₹{pricePerKm}/km</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1">
                <Users className="h-3 w-3" />
                Passengers
              </span>
              <span className="font-medium">{passengerCount}</span>
            </div>
          </div>
          
          <div className="pt-3 border-t">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-muted-foreground">Total Fare</span>
              <div className="text-right">
                <span className="text-3xl font-bold text-primary">₹{fullFare}</span>
                <p className="text-xs text-muted-foreground mt-1">Full vehicle</p>
              </div>
            </div>
          </div>

          <div className="bg-primary/5 p-3 rounded-lg">
            <p className="text-xs text-muted-foreground">
              Private cab for your group only. No sharing with others.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Shared Ride Card */}
      <Card className={`relative transition-all ${isSharedRide ? 'border-primary shadow-lg scale-105' : 'opacity-75'}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Share2 className="h-5 w-5" />
              Shared Ride
            </CardTitle>
            {isSharedRide && (
              <Badge variant="default" className="animate-pulse">
                <Check className="h-3 w-3 mr-1" />
                Selected
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Vehicle</span>
              <span className="font-medium">{vehicleName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Distance</span>
              <span className="font-medium">{distance} km</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Rate</span>
              <span className="font-medium">₹{pricePerKm}/km</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1">
                <Users className="h-3 w-3" />
                Passengers
              </span>
              <span className="font-medium">{passengerCount}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Capacity</span>
              <span className="font-medium">{vehicleCapacity} seats</span>
            </div>
          </div>
          
          <div className="pt-3 border-t">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-muted-foreground">Your Share</span>
              <div className="text-right">
                <span className="text-3xl font-bold text-primary">₹{sharedFarePerPerson}</span>
                <p className="text-xs text-muted-foreground mt-1">
                  ₹{Math.round(sharedFarePerPerson / passengerCount)}/person
                </p>
              </div>
            </div>
          </div>

          {savingsAmount > 0 && (
            <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-green-700 dark:text-green-400">
                  You Save
                </span>
                <div className="text-right">
                  <span className="text-lg font-bold text-green-700 dark:text-green-400">
                    ₹{savingsAmount}
                  </span>
                  <Badge variant="secondary" className="ml-2 bg-green-100 text-green-700">
                    {savingsPercent}% OFF
                  </Badge>
                </div>
              </div>
            </div>
          )}

          <div className="bg-primary/5 p-3 rounded-lg">
            <p className="text-xs text-muted-foreground">
              Share with other passengers traveling on the same route. Save money and meet new people!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

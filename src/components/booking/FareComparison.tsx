import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Car, Share2, Users, Check, Route, Percent } from "lucide-react";

interface FareComparisonProps {
  distance: number;
  vehicleName: string;
  vehicleCapacity: number;
  pricePerKm: number;
  passengerCount: number;
  isSharedRide: boolean;
}

const SHARED_RIDE_DISCOUNT = 0.30; // 30% discount for all shared rides

export const FareComparison = ({
  distance,
  vehicleName,
  vehicleCapacity,
  pricePerKm,
  passengerCount,
  isSharedRide,
}: FareComparisonProps) => {
  // Regular fare calculation (full fare for the distance)
  const regularFare = Math.round(distance * pricePerKm);
  
  // Shared ride: 30% discount on base fare, then split by capacity
  const discountedBaseFare = regularFare * (1 - SHARED_RIDE_DISCOUNT);
  const sharedFarePerSeat = Math.round(discountedBaseFare / vehicleCapacity);
  const sharedFareForUser = sharedFarePerSeat * passengerCount;
  
  // Savings calculation
  const savingsAmount = regularFare - sharedFareForUser;
  const savingsPercent = 30; // Fixed 30% discount

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
              <span className="text-muted-foreground flex items-center gap-1">
                <Route className="h-3 w-3" />
                Distance
              </span>
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
                <span className="text-3xl font-bold text-primary">₹{regularFare}</span>
                <p className="text-xs text-muted-foreground mt-1">
                  {distance} km × ₹{pricePerKm}/km
                </p>
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
        {/* 30% OFF Badge */}
        <div className="absolute -top-3 -right-3 z-10">
          <Badge className="bg-green-600 text-white font-bold px-3 py-1.5 text-sm shadow-lg">
            <Percent className="h-3 w-3 mr-1" />
            30% OFF
          </Badge>
        </div>
        
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
              <span className="text-muted-foreground flex items-center gap-1">
                <Route className="h-3 w-3" />
                Distance
              </span>
              <span className="font-medium">{distance} km</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Base Rate</span>
              <span className="font-medium">
                <span className="line-through text-muted-foreground mr-1">₹{pricePerKm}</span>
                ₹{(pricePerKm * (1 - SHARED_RIDE_DISCOUNT)).toFixed(1)}/km
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1">
                <Users className="h-3 w-3" />
                Your Seats
              </span>
              <span className="font-medium">{passengerCount} of {vehicleCapacity}</span>
            </div>
          </div>
          
          <div className="pt-3 border-t">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-muted-foreground">Your Share</span>
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <span className="text-lg line-through text-muted-foreground">₹{regularFare}</span>
                  <span className="text-3xl font-bold text-green-600">₹{sharedFareForUser}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  ₹{sharedFarePerSeat}/seat × {passengerCount} seat(s)
                </p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-green-700 dark:text-green-400">
                You Save
              </span>
              <div className="text-right">
                <span className="text-lg font-bold text-green-700 dark:text-green-400">
                  ₹{savingsAmount}
                </span>
                <Badge variant="secondary" className="ml-2 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                  {savingsPercent}% OFF
                </Badge>
              </div>
            </div>
          </div>

          <div className="bg-primary/5 p-3 rounded-lg">
            <p className="text-xs text-muted-foreground">
              <strong>30% discount</strong> on all shared rides! Pay only for your kilometers traveled.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Route, Percent, IndianRupee, MapPin } from "lucide-react";

interface SharedFareBreakdownProps {
  primaryRoute: {
    from: string;
    to: string;
    distance: number;
    baseFare: number;
  };
  userSegment: {
    from: string;
    to: string;
    distance: number;
  };
  pricePerKm: number;
  passengerCount: number;
}

export const SharedFareBreakdown = ({
  primaryRoute,
  userSegment,
  pricePerKm,
  passengerCount
}: SharedFareBreakdownProps) => {
  const SHARED_RIDE_DISCOUNT = 0.30; // 30% discount

  // Calculate user's segment fare
  const segmentBaseFare = userSegment.distance * pricePerKm;
  const discountAmount = segmentBaseFare * SHARED_RIDE_DISCOUNT;
  const discountedFare = segmentBaseFare - discountAmount;
  const farePerPerson = discountedFare / passengerCount;

  // Calculate sharing percentage
  const sharePercentage = Math.round((userSegment.distance / primaryRoute.distance) * 100);

  return (
    <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-background">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Users className="h-5 w-5 text-primary" />
          Shared Ride Fare Breakdown
          <Badge className="ml-auto bg-green-500/20 text-green-700 border-green-500/30">
            30% OFF
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Primary Route Info */}
        <div className="p-3 rounded-lg bg-muted/50">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Route className="h-4 w-4" />
            Primary Ride Route
          </div>
          <div className="font-medium">
            {primaryRoute.from} → {primaryRoute.to}
          </div>
          <div className="text-sm text-muted-foreground">
            Total Distance: {primaryRoute.distance} km
          </div>
        </div>

        {/* User's Segment */}
        <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
          <div className="flex items-center gap-2 text-sm text-primary mb-1">
            <MapPin className="h-4 w-4" />
            Your Journey Segment
          </div>
          <div className="font-medium">
            {userSegment.from} → {userSegment.to}
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-sm text-muted-foreground">
              Your Distance: {userSegment.distance} km
            </span>
            <Badge variant="outline" className="text-xs">
              {sharePercentage}% of total route
            </Badge>
          </div>
        </div>

        {/* Fare Calculation */}
        <div className="space-y-2 pt-2 border-t">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Base fare ({userSegment.distance} km × ₹{pricePerKm})</span>
            <span>₹{segmentBaseFare.toFixed(0)}</span>
          </div>
          <div className="flex justify-between text-sm text-green-600">
            <span className="flex items-center gap-1">
              <Percent className="h-3 w-3" />
              Shared Ride Discount (30%)
            </span>
            <span>-₹{discountAmount.toFixed(0)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Discounted fare</span>
            <span>₹{discountedFare.toFixed(0)}</span>
          </div>
          {passengerCount > 1 && (
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Per person ({passengerCount} passengers)</span>
              <span>₹{farePerPerson.toFixed(0)}</span>
            </div>
          )}
        </div>

        {/* Final Amount */}
        <div className="pt-3 border-t-2 border-primary/20">
          <div className="flex justify-between items-center">
            <span className="font-semibold flex items-center gap-2">
              <IndianRupee className="h-5 w-5 text-primary" />
              You Pay (for {userSegment.distance} km)
            </span>
            <div className="text-right">
              <span className="text-2xl font-bold text-primary">
                ₹{discountedFare.toFixed(0)}
              </span>
              <div className="text-xs text-muted-foreground line-through">
                ₹{segmentBaseFare.toFixed(0)}
              </div>
            </div>
          </div>
        </div>

        {/* Info Note */}
        <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded">
          💡 You only pay for the kilometers you travel ({userSegment.from} to {userSegment.to}), 
          not the entire route. All shared ride passengers get 30% off!
        </div>
      </CardContent>
    </Card>
  );
};

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, TrendingUp } from "lucide-react";

interface Route {
  from_location: string;
  to_location: string;
  distance_km: number;
}

interface PopularRoutesProps {
  routes: Route[];
  onSelectRoute: (from: string, to: string) => void;
}

export const PopularRoutes = ({ routes, onSelectRoute }: PopularRoutesProps) => {
  // Filter only Karnataka routes - popular cities in Karnataka
  const karnatakaPopularCities = ['Bengaluru', 'Mysuru', 'Mangaluru', 'Hubballi', 'Belagavi', 'Hampi', 'Coorg', 'Udupi'];
  
  const popularRoutes = routes
    .filter(route => 
      karnatakaPopularCities.includes(route.from_location) || 
      karnatakaPopularCities.includes(route.to_location)
    )
    .slice(0, 8);

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent">
      <CardContent className="pt-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-lg">Popular Routes in Karnataka</h3>
          <Badge variant="secondary" className="ml-auto">Quick Select</Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {popularRoutes.map((route, index) => (
            <button
              key={index}
              onClick={() => onSelectRoute(route.from_location, route.to_location)}
              className="group relative p-4 rounded-lg border border-border bg-background/60 backdrop-blur-sm hover:bg-primary/10 hover:border-primary/50 transition-all duration-300 hover:shadow-md text-left"
            >
              <div className="flex items-start justify-between mb-2">
                <MapPin className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors">
                  {route.distance_km} km
                </span>
              </div>
              <div className="space-y-1">
                <div className="font-semibold text-sm group-hover:text-primary transition-colors">
                  {route.from_location}
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <span className="text-xs">→</span>
                  <span className="text-sm">{route.to_location}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navigation, Clock, MapPin, Zap, TrendingDown, Shield } from "lucide-react";
import routeOptimizationImage from "@/assets/route-optimization.jpg";

const RouteOptimization = () => {
  const features = [
    {
      icon: Navigation,
      title: "AI-Powered Route Planning",
      description: "Advanced algorithms analyze real-time traffic, weather, and road conditions to find the optimal path.",
      benefit: "Save up to 30% travel time"
    },
    {
      icon: Clock,
      title: "Real-Time Optimization",
      description: "Dynamic route adjustments based on live traffic updates and unexpected road conditions.",
      benefit: "Always on-time arrival"
    },
    {
      icon: TrendingDown,
      title: "Fuel Efficiency",
      description: "Eco-friendly routing that minimizes fuel consumption while maintaining optimal speed.",
      benefit: "Reduce costs by 20%"
    },
    {
      icon: Shield,
      title: "Safety-First Routes",
      description: "Prioritizes well-maintained highways and avoids accident-prone areas for safer journeys.",
      benefit: "100% safety record"
    }
  ];

  return (
    <section className="py-20 bg-gradient-bg">
      <div className="container mx-auto px-4">
        
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 px-4 py-2 text-sm font-medium">
            <Zap className="h-4 w-4 mr-2" />
            Advanced Technology
          </Badge>
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Smart Route Optimization
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Experience the future of travel with our AI-powered route optimization system 
            that ensures the fastest, safest, and most efficient journey across Karnataka.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Image Side */}
          <div className="relative">
            <div className="relative overflow-hidden rounded-2xl shadow-luxury">
              <img 
                src={routeOptimizationImage} 
                alt="Route optimization dashboard showing GPS navigation and traffic analysis"
                className="w-full h-[400px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent" />
              
              {/* Floating Stats */}
              <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-card-hover">
                <div className="text-2xl font-bold text-primary">30%</div>
                <div className="text-sm text-muted-foreground">Time Saved</div>
              </div>
              
              <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-card-hover">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-secondary" />
                  <div>
                    <div className="font-semibold text-foreground">Live Tracking</div>
                    <div className="text-sm text-muted-foreground">GPS Enabled</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Features Side */}
          <div className="space-y-6">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-card-hover transition-all duration-300 border-border/50">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <feature.icon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-foreground mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground mb-3 leading-relaxed">
                        {feature.description}
                      </p>
                      <Badge variant="outline" className="border-primary/20 text-primary font-medium">
                        {feature.benefit}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Bottom Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
          {[
            { value: "50,000+", label: "Safe Journeys" },
            { value: "500+", label: "Cities Covered" },
            { value: "99.9%", label: "On-Time Rate" },
            { value: "24/7", label: "Support Available" }
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl lg:text-4xl font-bold text-primary mb-2">
                {stat.value}
              </div>
              <div className="text-muted-foreground font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RouteOptimization;
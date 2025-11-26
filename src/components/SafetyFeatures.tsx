import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  MapPin, 
  Phone, 
  Camera, 
  AlertTriangle, 
  UserCheck,
  Clock,
  Heart,
  Star,
  CheckCircle
} from "lucide-react";

const SafetyFeatures = () => {
  const safetyFeatures = [
    {
      icon: Shield,
      title: "Verified Drivers",
      description: "All drivers undergo rigorous background checks, license verification, and safety training programs.",
      color: "text-secondary"
    },
    {
      icon: MapPin,
      title: "Live GPS Tracking",
      description: "Real-time location sharing with family members and 24/7 monitoring by our safety team.",
      color: "text-primary"
    },
    {
      icon: Phone,
      title: "Emergency SOS",
      description: "One-touch emergency button connected directly to local police and our rapid response team.",
      color: "text-destructive"
    },
    {
      icon: Camera,
      title: "In-Cab Surveillance",
      description: "AI-powered cabin monitoring ensures passenger safety and driver behavior compliance.",
      color: "text-tech-blue"
    },
    {
      icon: UserCheck,
      title: "Identity Verification",
      description: "Mandatory passenger verification and driver photo confirmation before trip starts.",
      color: "text-secondary"
    },
    {
      icon: AlertTriangle,
      title: "Route Deviation Alerts",
      description: "Automatic notifications if vehicle deviates from planned route or makes unexpected stops.",
      color: "text-primary"
    }
  ];

  const testimonials = [
    {
      name: "Priya Sharma",
      location: "Bangalore to Mysore",
      rating: 5,
      comment: "Felt completely safe throughout the journey. The live tracking gave my family peace of mind.",
      avatar: "PS"
    },
    {
      name: "Rajesh Kumar",
      location: "Hubli to Goa",
      rating: 5,
      comment: "Professional driver, clean vehicle, and excellent safety measures. Highly recommend!",
      avatar: "RK"
    }
  ];

  return (
    <section id="safety-routes" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 px-4 py-2 text-sm font-medium border-secondary/20 text-secondary">
            <Shield className="h-4 w-4 mr-2" />
            Your Safety is Our Priority
          </Badge>
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Advanced Safety Measures
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Travel with confidence knowing that every aspect of your journey is protected 
            by our comprehensive safety ecosystem and 24/7 monitoring systems.
          </p>
        </div>

        {/* Safety Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {safetyFeatures.map((feature, index) => (
            <Card key={index} className="group hover:shadow-card-hover transition-all duration-300 border-border/50 hover:border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-xl bg-gradient-safety flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Safety Stats */}
        <div className="bg-gradient-hero rounded-3xl p-8 lg:p-12 mb-16 text-white">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold mb-4">Our Safety Record</h3>
            <p className="text-white/90 text-lg">Numbers that speak for our commitment to your safety</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { 
                icon: CheckCircle,
                value: "0", 
                label: "Major Incidents",
                sublabel: "in 50,000+ trips"
              },
              { 
                icon: Clock,
                value: "<2min", 
                label: "Emergency Response",
                sublabel: "average time"
              },
              { 
                icon: Star,
                value: "4.9/5", 
                label: "Safety Rating",
                sublabel: "customer feedback"
              },
              { 
                icon: Heart,
                value: "100%", 
                label: "Driver Verification",
                sublabel: "background checked"
              }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <stat.icon className="h-8 w-8 mx-auto mb-3 text-primary-glow" />
                <div className="text-3xl lg:text-4xl font-bold mb-2">
                  {stat.value}
                </div>
                <div className="font-medium mb-1">
                  {stat.label}
                </div>
                <div className="text-sm text-white/70">
                  {stat.sublabel}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="text-center mb-8">
          <h3 className="text-3xl font-bold text-foreground mb-4">What Our Passengers Say</h3>
          <p className="text-muted-foreground">Real experiences from real customers</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-border/50">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-semibold text-sm">
                      {testimonial.avatar}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-foreground">{testimonial.name}</h4>
                      <div className="flex">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{testimonial.location}</p>
                    <p className="text-foreground leading-relaxed">"{testimonial.comment}"</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button size="lg" className="bg-gradient-safety hover:shadow-glow transition-all duration-300 px-8 py-6 text-lg font-semibold">
            Experience Safe Travel Today
          </Button>
        </div>
      </div>
    </section>
  );
};

export default SafetyFeatures;
import { Car, Shield, MapPin, Users, Clock, CreditCard } from "lucide-react";
import { Card, CardContent } from "./ui/card";

const Services = () => {
  const services = [
    {
      icon: <Car className="h-10 w-10 text-primary" />,
      title: "Outstation Cabs",
      description: "Comfortable rides across all Indian cities with professional drivers and well-maintained vehicles."
    },
    {
      icon: <Users className="h-10 w-10 text-primary" />,
      title: "Ride Sharing",
      description: "Save up to 30% by sharing rides with other passengers traveling on the same route."
    },
    {
      icon: <MapPin className="h-10 w-10 text-primary" />,
      title: "Live Tracking",
      description: "Track your driver in real-time with GPS-enabled live location updates throughout your journey."
    },
    {
      icon: <Clock className="h-10 w-10 text-primary" />,
      title: "24/7 Availability",
      description: "Book cabs anytime, anywhere across India with round-the-clock customer support."
    },
    {
      icon: <Shield className="h-10 w-10 text-primary" />,
      title: "Safety First",
      description: "Verified drivers, emergency SOS, and ride sharing for secure travel across all routes."
    },
    {
      icon: <CreditCard className="h-10 w-10 text-primary" />,
      title: "Flexible Payment",
      description: "Multiple payment options including cash, cards, UPI, and digital wallets for your convenience."
    }
  ];

  return (
    <section id="services" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Services</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Comprehensive cab booking solutions for all your travel needs across India
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    {service.icon}
                  </div>
                  <h3 className="text-xl font-semibold">{service.title}</h3>
                  <p className="text-muted-foreground">{service.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;

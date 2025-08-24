import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin,
  Car,
  Shield,
  Route
} from "lucide-react";

const Footer = () => {
  const quickLinks = [
    { name: "About Us", href: "#about" },
    { name: "Our Fleet", href: "#fleet" },
    { name: "Route Optimization", href: "#routes" },
    { name: "Safety Features", href: "#safety" },
    { name: "Pricing", href: "#pricing" },
    { name: "Contact", href: "#contact" },
  ];

  const services = [
    { name: "Outstation Cabs", href: "#outstation" },
    { name: "Airport Transfer", href: "#airport" },
    { name: "Corporate Travel", href: "#corporate" },
    { name: "Wedding Cars", href: "#wedding" },
    { name: "Tour Packages", href: "#tours" },
    { name: "Emergency Rides", href: "#emergency" },
  ];

  const cities = [
    "Bangalore", "Mysore", "Hubli", "Mangalore", 
    "Belgaum", "Gulbarga", "Davangere", "Bellary",
    "Bijapur", "Shimoga", "Tumkur", "Chitradurga"
  ];

  return (
    <footer className="bg-gradient-to-b from-foreground to-foreground/95 text-white">
      <div className="container mx-auto px-4 py-16">
        
        {/* Main Footer Content */}
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8 mb-12">
          
          {/* Company Info */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                <MapPin className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">ZoomGo</h1>
                <p className="text-sm text-white/70">Karnataka Outstation Cabs</p>
              </div>
            </div>
            
            <p className="text-white/80 leading-relaxed">
              Your trusted partner for safe, comfortable, and reliable outstation travel 
              across Karnataka. Experience premium cab service with advanced route optimization.
            </p>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary-glow" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary-glow" />
                <span>support@zoomgokarnataka.com</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-primary-glow" />
                <span>24/7 Customer Support</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href}
                    className="text-white/80 hover:text-primary-glow transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Our Services</h3>
            <ul className="space-y-3">
              {services.map((service) => (
                <li key={service.name}>
                  <a 
                    href={service.href}
                    className="text-white/80 hover:text-primary-glow transition-colors"
                  >
                    {service.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Cities & Newsletter */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Cities We Serve</h3>
            <div className="grid grid-cols-2 gap-2 mb-6">
              {cities.slice(0, 8).map((city) => (
                <span key={city} className="text-sm text-white/70">
                  {city}
                </span>
              ))}
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium">Stay Updated</h4>
              <div className="flex gap-2">
                <Input 
                  placeholder="Your email"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                />
                <Button variant="hero" size="sm">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
        </div>

        <Separator className="bg-white/20 mb-8" />

        {/* Key Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="flex items-center gap-3 text-center md:text-left">
            <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center flex-shrink-0">
              <Route className="h-6 w-6 text-white" />
            </div>
            <div>
              <h4 className="font-semibold">Smart Route Optimization</h4>
              <p className="text-sm text-white/70">AI-powered fastest routes</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 text-center md:text-left">
            <div className="w-12 h-12 bg-gradient-safety rounded-full flex items-center justify-center flex-shrink-0">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h4 className="font-semibold">100% Safety Guaranteed</h4>
              <p className="text-sm text-white/70">Verified drivers & live tracking</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 text-center md:text-left">
            <div className="w-12 h-12 bg-tech-blue rounded-full flex items-center justify-center flex-shrink-0">
              <Car className="h-6 w-6 text-white" />
            </div>
            <div>
              <h4 className="font-semibold">Premium Fleet</h4>
              <p className="text-sm text-white/70">Well-maintained luxury vehicles</p>
            </div>
          </div>
        </div>

        <Separator className="bg-white/20 mb-8" />

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-white/70">
            © 2024 ZoomGo Karnataka. All rights reserved. | Privacy Policy | Terms of Service
          </div>
          
          {/* Social Links */}
          <div className="flex items-center gap-4">
            <span className="text-sm text-white/70">Follow us:</span>
            <div className="flex gap-3">
              {[Facebook, Twitter, Instagram, Linkedin].map((Icon, index) => (
                <a
                  key={index}
                  href="#"
                  className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-primary-glow/20 transition-colors"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Calendar, Clock, Shield, Star, Route } from "lucide-react";
import heroImage from "@/assets/hero-cab.jpg";

const Hero = () => {
  const [fromLocation, setFromLocation] = useState("");
  const [toLocation, setToLocation] = useState("");

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background with overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-hero opacity-85" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              ZoomGo
              <span className="block text-primary-glow">Karnataka</span>
            </h1>
            <p className="text-xl lg:text-2xl text-white/90 mb-8 leading-relaxed">
              Premium outstation cab service with advanced route optimization 
              and door-to-door safety across Karnataka
            </p>
            
            {/* Key Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="flex items-center justify-center lg:justify-start gap-2 text-white">
                <Route className="h-5 w-5 text-primary-glow" />
                <span className="font-medium">Smart Routes</span>
              </div>
              <div className="flex items-center justify-center lg:justify-start gap-2 text-white">
                <Shield className="h-5 w-5 text-secondary" />
                <span className="font-medium">100% Safe</span>
              </div>
              <div className="flex items-center justify-center lg:justify-start gap-2 text-white">
                <Star className="h-5 w-5 text-primary-glow" />
                <span className="font-medium">Premium Fleet</span>
              </div>
            </div>
          </div>

          {/* Right Content - Booking Card */}
          <Card className="backdrop-blur-md bg-white/10 border-white/20 shadow-luxury">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-white mb-6 text-center">
                Book Your Journey
              </h2>
              
              <div className="space-y-4">
                {/* From Location */}
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-5 w-5 text-primary" />
                  <Input
                    placeholder="From (Pickup Location)"
                    value={fromLocation}
                    onChange={(e) => setFromLocation(e.target.value)}
                    className="pl-10 bg-white/90 border-white/30 text-foreground placeholder:text-muted-foreground"
                  />
                </div>

                {/* To Location */}
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-5 w-5 text-secondary" />
                  <Input
                    placeholder="To (Drop Location)"
                    value={toLocation}
                    onChange={(e) => setToLocation(e.target.value)}
                    className="pl-10 bg-white/90 border-white/30 text-foreground placeholder:text-muted-foreground"
                  />
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-tech-blue" />
                    <Input
                      type="date"
                      className="pl-10 bg-white/90 border-white/30 text-foreground"
                    />
                  </div>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3 h-4 w-4 text-tech-blue" />
                    <Input
                      type="time"
                      className="pl-10 bg-white/90 border-white/30 text-foreground"
                    />
                  </div>
                </div>

                {/* Vehicle Type */}
                <Select>
                  <SelectTrigger className="bg-white/90 border-white/30 text-foreground">
                    <SelectValue placeholder="Select Vehicle Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sedan">Sedan (4 seats)</SelectItem>
                    <SelectItem value="suv">SUV (6-7 seats)</SelectItem>
                    <SelectItem value="luxury">Luxury (Premium)</SelectItem>
                    <SelectItem value="tempo">Tempo Traveller (12+ seats)</SelectItem>
                  </SelectContent>
                </Select>

                {/* Book Now Button */}
                <Button 
                  size="lg" 
                  className="w-full mt-6 bg-gradient-primary hover:shadow-glow transition-all duration-300 font-semibold text-lg py-6"
                >
                  Book Now - Get Instant Quote
                </Button>

                {/* Quick Info */}
                <div className="text-center text-white/80 text-sm mt-4">
                  <p>✓ Instant booking confirmation</p>
                  <p>✓ 24/7 customer support</p>
                  <p>✓ GPS tracking & live updates</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Calendar, Clock, Shield, Star, Route, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import heroImage from "@/assets/hero-cab.jpg";

const Hero = () => {
  const [fromLocation, setFromLocation] = useState("");
  const [toLocation, setToLocation] = useState("");
  const [isSharedRide, setIsSharedRide] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleBooking = () => {
    if (!user) {
      toast.error('Please sign in to book a cab');
      navigate('/auth');
      return;
    }
    navigate('/booking');
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
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
            <p className="text-xl lg:text-2xl text-white/90 mb-4 leading-relaxed">
              Premium outstation cab service with live tracking
              and safe rides across Karnataka
            </p>
            
            {/* All Karnataka Districts */}
            <div className="mb-6">
              <p className="text-white/70 text-sm mb-2">Serving All 31 Districts of Karnataka:</p>
              <div className="flex flex-wrap gap-2 justify-center lg:justify-start max-h-24 overflow-hidden">
                {['Bengaluru', 'Mysuru', 'Mangaluru', 'Hubballi', 'Belagavi', 'Ballari', 'Kalaburagi', 'Davangere', 'Shivamogga', 'Tumakuru', 'Udupi', 'Hassan', 'Madikeri'].map((city) => (
                  <span key={city} className="px-3 py-1 bg-white/10 border border-white/20 rounded-full text-white text-sm backdrop-blur-sm">
                    {city}
                  </span>
                ))}
                <span className="px-3 py-1 bg-primary/30 border border-primary/50 rounded-full text-white text-sm backdrop-blur-sm font-semibold">
                  +200 more locations
                </span>
              </div>
            </div>
            
            {/* Key Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                <span className="font-medium">Live Tracking</span>
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
                    <SelectItem value="sedan">Sedan (4 seats) - ₹12/km</SelectItem>
                    <SelectItem value="suv">SUV/XUV (6-7 seats) - ₹15/km</SelectItem>
                    <SelectItem value="tempo">Tempo Traveller (12+ seats) - ₹17/km</SelectItem>
                  </SelectContent>
                </Select>

                {/* Ride Sharing Option */}
                <div className="flex items-center space-x-3 p-4 bg-green-500/20 border border-green-500/30 rounded-lg backdrop-blur-sm">
                  <Checkbox 
                    id="shared-ride" 
                    checked={isSharedRide}
                    onCheckedChange={(checked) => setIsSharedRide(checked as boolean)}
                    className="border-white"
                  />
                  <div className="flex-1">
                    <Label htmlFor="shared-ride" className="text-white font-semibold cursor-pointer flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Share & Save 30%
                    </Label>
                    <p className="text-white/80 text-xs">Split costs with other passengers on the same route</p>
                  </div>
                  {isSharedRide && (
                    <Badge className="bg-green-500 hover:bg-green-600">
                      30% OFF
                    </Badge>
                  )}
                </div>

                {/* Book Now Button */}
                <Button 
                  size="lg"
                  onClick={handleBooking}
                  className="w-full mt-6 bg-gradient-primary hover:shadow-glow transition-all duration-300 font-semibold text-lg py-6"
                >
                  {user ? 'Book Now - Get Instant Quote' : 'Sign In to Book'}
                </Button>

                {/* Quick Info */}
                <div className="text-center text-white/80 text-sm mt-4">
                  <p>✓ Instant booking • Karnataka coverage</p>
                  <p>✓ 24/7 support • Live GPS tracking</p>
                  <p>✓ Safe rides • Captain calls 30 min before pickup</p>
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

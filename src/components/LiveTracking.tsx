import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { MapPin, Navigation } from "lucide-react";

interface LiveTrackingProps {
  bookingId: string;
  driverLocation?: { lat: number; lng: number };
  pickupLocation: string;
  dropoffLocation: string;
  driverName?: string;
  status: string;
}

const LiveTracking = ({ 
  bookingId, 
  driverLocation, 
  pickupLocation, 
  dropoffLocation,
  driverName,
  status 
}: LiveTrackingProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [needsApiKey, setNeedsApiKey] = useState(true);

  useEffect(() => {
    // Check if Google Maps API is available
    const google = (window as any).google;
    if (google && google.maps) {
      setNeedsApiKey(false);
      initializeMap();
    }
  }, [driverLocation]);

  const initializeMap = () => {
    const google = (window as any).google;
    if (!mapRef.current || !google) return;

    const defaultCenter = driverLocation || { lat: 12.9716, lng: 77.5946 }; // Bengaluru

    const map = new google.maps.Map(mapRef.current, {
      center: defaultCenter,
      zoom: 13,
      styles: [
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "off" }]
        }
      ]
    });

    if (driverLocation) {
      new google.maps.Marker({
        position: driverLocation,
        map: map,
        icon: {
          url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
        },
        title: "Driver Location"
      });
    }

    setMapLoaded(true);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'pending': 'bg-yellow-500',
      'confirmed': 'bg-blue-500',
      'driver_assigned': 'bg-purple-500',
      'on_the_way': 'bg-orange-500',
      'picked_up': 'bg-cyan-500',
      'in_transit': 'bg-green-500',
      'completed': 'bg-gray-500',
      'cancelled': 'bg-red-500',
    };
    return colors[status] || 'bg-gray-500';
  };

  if (needsApiKey) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Live Tracking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/30 rounded-lg p-8 text-center">
            <Navigation className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-semibold mb-2">Live Tracking Requires Setup</h3>
            <p className="text-sm text-muted-foreground mb-4">
              To enable live tracking, you need to add your Google Maps API key.
            </p>
            <p className="text-xs text-muted-foreground">
              Get your API key from{" "}
              <a 
                href="https://console.cloud.google.com/google/maps-apis" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Google Cloud Console
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Live Tracking
          </CardTitle>
          <Badge className={getStatusColor(status)}>
            {status.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div 
          ref={mapRef} 
          className="w-full h-64 rounded-lg bg-muted"
        />
        
        <div className="space-y-3">
          {driverName && (
            <div className="flex items-center gap-2">
              <Navigation className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                <span className="font-medium">Driver:</span> {driverName}
              </span>
            </div>
          )}
          
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-green-500 mt-0.5" />
            <div className="text-sm">
              <span className="font-medium">Pickup:</span> {pickupLocation}
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-red-500 mt-0.5" />
            <div className="text-sm">
              <span className="font-medium">Drop-off:</span> {dropoffLocation}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LiveTracking;

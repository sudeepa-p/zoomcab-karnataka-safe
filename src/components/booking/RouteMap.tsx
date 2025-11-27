import { useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Navigation } from "lucide-react";

interface RouteMapProps {
  pickupLocation: string;
  dropoffLocation: string;
  distance?: number;
}

declare global {
  interface Window {
    google: any;
  }
}

export const RouteMap = ({ pickupLocation, dropoffLocation, distance }: RouteMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    const initMap = async () => {
      if (!mapRef.current || !pickupLocation || !dropoffLocation) return;

      const google = window.google;
      if (!google || !google.maps) {
        console.log("Google Maps not loaded yet");
        return;
      }

      try {
        const geocoder = new google.maps.Geocoder();
        
        // Geocode pickup location
        const pickupResult = await new Promise<any>((resolve, reject) => {
          geocoder.geocode({ address: pickupLocation + ", India" }, (results: any, status: any) => {
            if (status === "OK" && results[0]) {
              resolve(results[0]);
            } else {
              reject(new Error("Geocoding failed for pickup"));
            }
          });
        });

        // Geocode dropoff location
        const dropoffResult = await new Promise<any>((resolve, reject) => {
          geocoder.geocode({ address: dropoffLocation + ", India" }, (results: any, status: any) => {
            if (status === "OK" && results[0]) {
              resolve(results[0]);
            } else {
              reject(new Error("Geocoding failed for dropoff"));
            }
          });
        });

        const pickupLatLng = pickupResult.geometry.location;
        const dropoffLatLng = dropoffResult.geometry.location;

        // Create or update map
        if (!mapInstanceRef.current) {
          mapInstanceRef.current = new google.maps.Map(mapRef.current, {
            zoom: 6,
            center: pickupLatLng,
            mapTypeControl: false,
            streetViewControl: false,
            styles: [
              {
                featureType: "poi",
                elementType: "labels",
                stylers: [{ visibility: "off" }],
              },
            ],
          });
        }

        // Clear previous markers and directions
        mapInstanceRef.current.setCenter(pickupLatLng);

        // Add markers
        new google.maps.Marker({
          position: pickupLatLng,
          map: mapInstanceRef.current,
          title: pickupLocation,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: "#FF6B35",
            fillOpacity: 1,
            strokeColor: "#FFFFFF",
            strokeWeight: 2,
          },
        });

        new google.maps.Marker({
          position: dropoffLatLng,
          map: mapInstanceRef.current,
          title: dropoffLocation,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: "#22C55E",
            fillOpacity: 1,
            strokeColor: "#FFFFFF",
            strokeWeight: 2,
          },
        });

        // Draw route
        const directionsService = new google.maps.DirectionsService();
        const directionsRenderer = new google.maps.DirectionsRenderer({
          map: mapInstanceRef.current,
          suppressMarkers: true,
          polylineOptions: {
            strokeColor: "#FF6B35",
            strokeWeight: 4,
            strokeOpacity: 0.8,
          },
        });

        directionsService.route(
          {
            origin: pickupLatLng,
            destination: dropoffLatLng,
            travelMode: google.maps.TravelMode.DRIVING,
          },
          (result: any, status: any) => {
            if (status === "OK") {
              directionsRenderer.setDirections(result);
            }
          }
        );

        // Fit bounds to show both markers
        const bounds = new google.maps.LatLngBounds();
        bounds.extend(pickupLatLng);
        bounds.extend(dropoffLatLng);
        mapInstanceRef.current.fitBounds(bounds);

      } catch (error) {
        console.error("Error initializing map:", error);
      }
    };

    // Load Google Maps script if not already loaded
    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        initMap();
        return;
      }

      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => initMap();
      document.head.appendChild(script);
    };

    if (pickupLocation && dropoffLocation) {
      loadGoogleMaps();
    }
  }, [pickupLocation, dropoffLocation]);

  if (!pickupLocation || !dropoffLocation) {
    return (
      <Card className="border-muted">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center h-64 text-center text-muted-foreground">
            <Navigation className="h-12 w-12 mb-4 opacity-50" />
            <p className="text-sm">Select pickup and dropoff locations to view route</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20">
      <CardContent className="p-0">
        <div className="relative">
          <div ref={mapRef} className="h-80 w-full rounded-lg" />
          <div className="absolute top-4 left-4 bg-background/95 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-border">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-xs font-medium">{pickupLocation}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-secondary" />
              <span className="text-xs font-medium">{dropoffLocation}</span>
            </div>
            {distance && (
              <div className="mt-2 pt-2 border-t border-border">
                <span className="text-xs text-muted-foreground">Distance: </span>
                <span className="text-xs font-semibold text-primary">{distance} km</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

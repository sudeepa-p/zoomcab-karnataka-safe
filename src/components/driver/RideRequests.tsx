import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Users, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

interface RideRequest {
  id: string;
  pickup_location: string;
  dropoff_location: string;
  pickup_date: string;
  pickup_time: string;
  passenger_name: string;
  passenger_phone: string;
  passenger_count: number;
  estimated_fare: number;
  estimated_distance: number;
  is_shared_ride: boolean;
  special_requests: string | null;
}

interface RideRequestsProps {
  driverProfileId: string;
  onRequestAccepted?: () => void;
}

export const RideRequests = ({ driverProfileId, onRequestAccepted }: RideRequestsProps) => {
  const [requests, setRequests] = useState<RideRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    loadRequests();
    
    // Subscribe to new ride requests
    const channel = supabase
      .channel('ride-requests-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'bookings',
          filter: 'status=eq.pending'
        },
        () => loadRequests()
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'bookings'
        },
        () => loadRequests()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadRequests = async () => {
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .eq("status", "pending")
        .is("driver_id", null)
        .order("pickup_date", { ascending: true })
        .order("pickup_time", { ascending: true });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error("Error loading ride requests:", error);
      toast.error("Failed to load ride requests");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (bookingId: string) => {
    setProcessingId(bookingId);
    try {
      const { error } = await supabase
        .from("bookings")
        .update({
          driver_id: driverProfileId,
          status: "driver_assigned"
        })
        .eq("id", bookingId)
        .eq("status", "pending")
        .is("driver_id", null);

      if (error) throw error;

      toast.success("Ride request accepted!");
      await loadRequests();
      onRequestAccepted?.();
    } catch (error: any) {
      console.error("Error accepting ride:", error);
      toast.error(error.message || "Failed to accept ride request");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (bookingId: string) => {
    setProcessingId(bookingId);
    try {
      // Simply remove from view - don't update the booking
      setRequests(prev => prev.filter(r => r.id !== bookingId));
      toast.success("Ride request dismissed");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-8">
        <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No pending ride requests</p>
        <p className="text-sm text-muted-foreground mt-2">
          New requests will appear here automatically
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <Card key={request.id} className="border-l-4 border-l-primary">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">{request.passenger_name}</CardTitle>
                <p className="text-sm text-muted-foreground">{request.passenger_phone}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">₹{request.estimated_fare}</p>
                <p className="text-sm text-muted-foreground">{request.estimated_distance} km</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <span className="font-medium">Pickup:</span>{" "}
                  <span className="text-muted-foreground">{request.pickup_location}</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <span className="font-medium">Drop:</span>{" "}
                  <span className="text-muted-foreground">{request.dropoff_location}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 text-sm">
              <Badge variant="outline" className="gap-1">
                <Clock className="h-3 w-3" />
                {request.pickup_date} at {request.pickup_time}
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Users className="h-3 w-3" />
                {request.passenger_count} {request.passenger_count === 1 ? "passenger" : "passengers"}
              </Badge>
              {request.is_shared_ride && (
                <Badge variant="secondary">Shared Ride</Badge>
              )}
            </div>

            {request.special_requests && (
              <div className="text-sm">
                <span className="font-medium">Special requests:</span>{" "}
                <span className="text-muted-foreground">{request.special_requests}</span>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button
                className="flex-1"
                onClick={() => handleAccept(request.id)}
                disabled={processingId === request.id}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Accept Ride
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => handleReject(request.id)}
                disabled={processingId === request.id}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Dismiss
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

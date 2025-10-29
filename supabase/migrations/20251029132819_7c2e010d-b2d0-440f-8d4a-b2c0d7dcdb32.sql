-- Add ride sharing support to bookings table
ALTER TABLE public.bookings 
ADD COLUMN is_shared_ride BOOLEAN DEFAULT false,
ADD COLUMN available_seats INTEGER DEFAULT 0,
ADD COLUMN parent_booking_id UUID REFERENCES public.bookings(id),
ADD COLUMN is_primary_booking BOOLEAN DEFAULT true,
ADD COLUMN fare_per_person NUMERIC,
ADD COLUMN route_segment_start TEXT,
ADD COLUMN route_segment_end TEXT;

-- Create shared_ride_participants table to track all participants in a shared ride
CREATE TABLE public.shared_ride_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  primary_booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  participant_booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  pickup_location TEXT NOT NULL,
  dropoff_location TEXT NOT NULL,
  fare_amount NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE public.shared_ride_participants ENABLE ROW LEVEL SECURITY;

-- RLS policies for shared_ride_participants
CREATE POLICY "Users can view shared rides they're part of"
ON public.shared_ride_participants
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.bookings 
    WHERE bookings.id = shared_ride_participants.primary_booking_id 
    AND bookings.user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.bookings 
    WHERE bookings.id = shared_ride_participants.participant_booking_id 
    AND bookings.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create shared ride entries"
ON public.shared_ride_participants
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.bookings 
    WHERE bookings.id = shared_ride_participants.participant_booking_id 
    AND bookings.user_id = auth.uid()
  )
);

-- Create index for faster queries
CREATE INDEX idx_bookings_shared_rides ON public.bookings(is_shared_ride, is_primary_booking, pickup_date, status);
CREATE INDEX idx_bookings_parent ON public.bookings(parent_booking_id);
CREATE INDEX idx_shared_participants_primary ON public.shared_ride_participants(primary_booking_id);
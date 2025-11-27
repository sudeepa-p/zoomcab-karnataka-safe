-- Add RLS policy for drivers to view pending bookings
CREATE POLICY "Drivers can view pending bookings"
ON bookings
FOR SELECT
TO authenticated
USING (
  status = 'pending' 
  AND driver_id IS NULL
  AND EXISTS (
    SELECT 1 FROM driver_profiles 
    WHERE driver_profiles.user_id = auth.uid()
    AND driver_profiles.is_available = true
  )
);

-- Add RLS policy for drivers to accept bookings (update to assign themselves)
CREATE POLICY "Drivers can accept pending bookings"
ON bookings
FOR UPDATE
TO authenticated
USING (
  status = 'pending' 
  AND driver_id IS NULL
  AND EXISTS (
    SELECT 1 FROM driver_profiles 
    WHERE driver_profiles.user_id = auth.uid()
    AND driver_profiles.is_available = true
  )
)
WITH CHECK (
  status = 'driver_assigned'
  AND driver_id IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM driver_profiles 
    WHERE driver_profiles.id = bookings.driver_id
    AND driver_profiles.user_id = auth.uid()
  )
);
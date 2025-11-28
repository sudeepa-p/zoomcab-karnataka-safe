-- Fix driver authentication and add payment methods support

-- First, ensure the driver_profiles INSERT policy allows new signups
DROP POLICY IF EXISTS "Enable insert for authenticated users during signup" ON public.driver_profiles;

CREATE POLICY "Enable insert for authenticated users during signup"
ON public.driver_profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Ensure user_roles INSERT policy allows new role assignments
DROP POLICY IF EXISTS "Users can insert their own role during signup" ON public.user_roles;

CREATE POLICY "Users can insert their own role during signup"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Add payment_method column to bookings table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' 
    AND column_name = 'payment_method'
  ) THEN
    ALTER TABLE public.bookings 
    ADD COLUMN payment_method TEXT DEFAULT 'cash' CHECK (payment_method IN ('cash', 'phone_pay', 'google_pay', 'card', 'upi'));
  END IF;
END $$;

-- Add payment_status column to bookings table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' 
    AND column_name = 'payment_status'
  ) THEN
    ALTER TABLE public.bookings 
    ADD COLUMN payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded'));
  END IF;
END $$;

-- Create an index on user_roles for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id_role ON public.user_roles(user_id, role);

-- Update the handle_new_user function to work with both passengers and drivers
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Insert into users table
  INSERT INTO public.users (id, email, full_name, phone)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'phone'
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN new;
END;
$$;
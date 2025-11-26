-- Create app role enum for user types
CREATE TYPE public.app_role AS ENUM ('passenger', 'driver', 'admin');

-- Create user_roles table for role management
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Create driver_profiles table
CREATE TABLE public.driver_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  license_number TEXT NOT NULL UNIQUE,
  license_expiry DATE NOT NULL,
  vehicle_registration TEXT,
  aadhar_number TEXT,
  pan_number TEXT,
  bank_account TEXT,
  ifsc_code TEXT,
  rating NUMERIC(3, 2) DEFAULT 5.0,
  total_rides INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending_approval' CHECK (status IN ('pending_approval', 'active', 'inactive', 'suspended')),
  current_location JSONB,
  is_available BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.driver_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Drivers can view their own profile"
  ON public.driver_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Drivers can update their own profile"
  ON public.driver_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Passengers can view active driver profiles"
  ON public.driver_profiles FOR SELECT
  TO authenticated
  USING (status = 'active');

-- Create driver_vehicles table
CREATE TABLE public.driver_vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID REFERENCES public.driver_profiles(id) ON DELETE CASCADE NOT NULL,
  vehicle_type TEXT NOT NULL,
  vehicle_model TEXT NOT NULL,
  vehicle_year INTEGER NOT NULL,
  registration_number TEXT NOT NULL UNIQUE,
  color TEXT,
  capacity INTEGER NOT NULL,
  insurance_expiry DATE NOT NULL,
  pollution_cert_expiry DATE NOT NULL,
  fitness_cert_expiry DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.driver_vehicles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Drivers can manage their vehicles"
  ON public.driver_vehicles FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.driver_profiles
    WHERE id = driver_vehicles.driver_id
    AND user_id = auth.uid()
  ));

-- Create driver_earnings table
CREATE TABLE public.driver_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID REFERENCES public.driver_profiles(id) ON DELETE CASCADE NOT NULL,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
  base_amount NUMERIC(10, 2) NOT NULL,
  commission_amount NUMERIC(10, 2) NOT NULL,
  net_amount NUMERIC(10, 2) NOT NULL,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
  payment_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.driver_earnings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Drivers can view their earnings"
  ON public.driver_earnings FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.driver_profiles
    WHERE id = driver_earnings.driver_id
    AND user_id = auth.uid()
  ));

-- Create driver_route_preferences table
CREATE TABLE public.driver_route_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID REFERENCES public.driver_profiles(id) ON DELETE CASCADE NOT NULL,
  preferred_cities TEXT[] DEFAULT '{}',
  preferred_routes TEXT[] DEFAULT '{}',
  max_distance_km INTEGER DEFAULT 500,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (driver_id)
);

ALTER TABLE public.driver_route_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Drivers can manage their route preferences"
  ON public.driver_route_preferences FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.driver_profiles
    WHERE id = driver_route_preferences.driver_id
    AND user_id = auth.uid()
  ));

-- Create ride_share_offers table
CREATE TABLE public.ride_share_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  discount_percentage INTEGER NOT NULL CHECK (discount_percentage > 0 AND discount_percentage <= 50),
  min_participants INTEGER DEFAULT 2,
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.ride_share_offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active offers"
  ON public.ride_share_offers FOR SELECT
  TO authenticated
  USING (is_active = true AND valid_until > CURRENT_TIMESTAMP);

-- Add driver_id to bookings table
ALTER TABLE public.bookings
ADD COLUMN driver_id UUID REFERENCES public.driver_profiles(id) ON DELETE SET NULL,
ADD COLUMN tracking_enabled BOOLEAN DEFAULT false,
ADD COLUMN current_driver_location JSONB,
ADD COLUMN offer_id UUID REFERENCES public.ride_share_offers(id) ON DELETE SET NULL,
ADD COLUMN discount_applied NUMERIC(10, 2) DEFAULT 0;

-- Update bookings RLS to allow drivers to view assigned bookings
CREATE POLICY "Drivers can view their assigned bookings"
  ON public.bookings FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.driver_profiles
    WHERE id = bookings.driver_id
    AND user_id = auth.uid()
  ));

CREATE POLICY "Drivers can update their assigned bookings"
  ON public.bookings FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.driver_profiles
    WHERE id = bookings.driver_id
    AND user_id = auth.uid()
  ));

-- Create trigger function to update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers
CREATE TRIGGER update_driver_profiles_updated_at
  BEFORE UPDATE ON public.driver_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_driver_vehicles_updated_at
  BEFORE UPDATE ON public.driver_vehicles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_driver_route_preferences_updated_at
  BEFORE UPDATE ON public.driver_route_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to automatically assign passenger role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Assign passenger role by default
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'passenger');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_role();

-- Insert default ride share offer
INSERT INTO public.ride_share_offers (title, description, discount_percentage, min_participants, valid_until)
VALUES (
  'Share & Save 30%',
  'Share your ride with other passengers and save up to 30% on your fare! Valid for all routes across India.',
  30,
  2,
  '2025-12-31 23:59:59'
);
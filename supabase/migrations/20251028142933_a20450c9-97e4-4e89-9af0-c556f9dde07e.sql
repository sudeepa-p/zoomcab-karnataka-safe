-- Update vehicles table and insert vehicles with correct pricing
TRUNCATE TABLE vehicles CASCADE;

INSERT INTO vehicles (vehicle_type, name, capacity, price_per_km, image_url) VALUES
('sedan', 'Sedan', 4, 12, 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400'),
('suv', 'SUV/XUV', 7, 15, 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=400'),
('luxury', 'Premium Luxury', 4, 15, 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=400'),
('tempo', 'Tempo Traveller', 12, 17, 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400');

-- Create routes table for Karnataka districts
CREATE TABLE IF NOT EXISTS public.routes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  from_location text NOT NULL,
  to_location text NOT NULL,
  distance_km numeric NOT NULL,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view routes" 
ON public.routes 
FOR SELECT 
USING (true);

-- Insert popular Karnataka routes
INSERT INTO public.routes (from_location, to_location, distance_km) VALUES
('Bangalore', 'Mysore', 150),
('Bangalore', 'Mangalore', 352),
('Bangalore', 'Hubli', 410),
('Bangalore', 'Belgaum', 502),
('Bangalore', 'Hampi', 343),
('Bangalore', 'Coorg', 265),
('Bangalore', 'Udupi', 405),
('Bangalore', 'Chikmagalur', 245),
('Mysore', 'Coorg', 120),
('Mysore', 'Ooty', 125),
('Mangalore', 'Udupi', 58),
('Hubli', 'Belgaum', 102),
('Bangalore', 'Hassan', 183),
('Bangalore', 'Shimoga', 285),
('Bangalore', 'Davangere', 260);
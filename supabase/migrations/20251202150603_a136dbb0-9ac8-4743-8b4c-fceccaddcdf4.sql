-- Clear existing routes and add Karnataka-only routes
DELETE FROM routes;

-- Insert popular Karnataka routes
INSERT INTO routes (from_location, to_location, distance_km) VALUES
-- Bengaluru Hub Routes
('Bengaluru', 'Mysuru', 150),
('Bengaluru', 'Mangaluru', 350),
('Bengaluru', 'Hubballi', 400),
('Bengaluru', 'Belagavi', 500),
('Bengaluru', 'Tumakuru', 70),
('Bengaluru', 'Hassan', 180),
('Bengaluru', 'Davangere', 260),
('Bengaluru', 'Chitradurga', 200),
('Bengaluru', 'Ballari', 300),
('Bengaluru', 'Raichur', 400),
('Bengaluru', 'Kalaburagi', 600),
('Bengaluru', 'Bidar', 700),
('Bengaluru', 'Kolar', 70),
('Bengaluru', 'Chikkaballapur', 60),
('Bengaluru', 'Ramanagara', 50),
('Bengaluru', 'Mandya', 100),
('Bengaluru', 'Chamarajanagar', 180),
('Bengaluru', 'Madikeri', 250),
('Bengaluru', 'Chikkamagaluru', 240),
('Bengaluru', 'Shivamogga', 280),
('Bengaluru', 'Udupi', 400),
('Bengaluru', 'Karwar', 500),
('Bengaluru', 'Vijayapura', 520),
('Bengaluru', 'Hampi', 340),

-- Mysuru Hub Routes
('Mysuru', 'Madikeri', 120),
('Mysuru', 'Chamarajanagar', 60),
('Mysuru', 'Mandya', 45),
('Mysuru', 'Hassan', 120),
('Mysuru', 'Mangaluru', 250),
('Mysuru', 'Hunsur', 50),

-- Hubballi-Dharwad Hub Routes
('Hubballi', 'Dharwad', 20),
('Hubballi', 'Gadag', 55),
('Hubballi', 'Belagavi', 95),
('Hubballi', 'Ballari', 150),
('Hubballi', 'Vijayapura', 200),

-- Coastal Karnataka Routes
('Mangaluru', 'Udupi', 60),
('Mangaluru', 'Karwar', 150),
('Udupi', 'Karwar', 100),
('Karwar', 'Gokarna', 60),

-- North Karnataka Routes
('Kalaburagi', 'Bidar', 110),
('Kalaburagi', 'Vijayapura', 170),
('Kalaburagi', 'Yadgir', 80),
('Ballari', 'Hosapete', 15),
('Ballari', 'Raichur', 100),
('Raichur', 'Kalaburagi', 200),

-- Malnad Region Routes
('Shivamogga', 'Davangere', 70),
('Shivamogga', 'Chikkamagaluru', 85),
('Hassan', 'Chikkamagaluru', 60),
('Hassan', 'Shivamogga', 120),

-- Tourist Routes
('Bengaluru', 'Nandi Hills', 60),
('Mysuru', 'Bandipur', 80),
('Madikeri', 'Kushalnagar', 35),
('Chikkamagaluru', 'Mudigere', 40);

-- Add reverse routes for bidirectional travel
INSERT INTO routes (from_location, to_location, distance_km)
SELECT to_location, from_location, distance_km FROM routes
WHERE NOT EXISTS (
  SELECT 1 FROM routes r2 
  WHERE r2.from_location = routes.to_location 
  AND r2.to_location = routes.from_location
);
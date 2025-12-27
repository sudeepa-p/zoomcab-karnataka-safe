-- Add more route distances for Karnataka to enable segment-based fare calculation
INSERT INTO routes (from_location, to_location, distance_km) VALUES
-- Bengaluru to North Karnataka
('Bengaluru', 'Tumakuru', 70),
('Bengaluru', 'Davangere', 260),
('Bengaluru', 'Hubballi', 400),
('Bengaluru', 'Belagavi', 500),
('Bengaluru', 'Ballari', 300),
('Tumakuru', 'Davangere', 190),
('Tumakuru', 'Chitradurga', 130),
('Davangere', 'Hubballi', 140),
('Davangere', 'Ballari', 130),
('Hubballi', 'Belagavi', 95),
('Hubballi', 'Dharwad', 20),

-- Intermediate segments for shared rides
('Tumakuru', 'Hubballi', 330),
('Tumakuru', 'Belagavi', 430),
('Tumakuru', 'Ballari', 230),
('Chitradurga', 'Davangere', 60),
('Chitradurga', 'Ballari', 150),
('Chitradurga', 'Hubballi', 200),
('Davangere', 'Belagavi', 235),

-- Bengaluru to Mysuru corridor
('Bengaluru', 'Ramanagara', 50),
('Bengaluru', 'Mandya', 100),
('Bengaluru', 'Mysuru', 150),
('Ramanagara', 'Mandya', 50),
('Ramanagara', 'Mysuru', 100),
('Mandya', 'Mysuru', 50),

-- Coastal route
('Bengaluru', 'Hassan', 180),
('Bengaluru', 'Mangaluru', 350),
('Hassan', 'Mangaluru', 170),

-- Mysuru extensions
('Mysuru', 'Chamarajanagar', 60),
('Mysuru', 'Madikeri', 120),
('Mysuru', 'Hassan', 120)
ON CONFLICT DO NOTHING;
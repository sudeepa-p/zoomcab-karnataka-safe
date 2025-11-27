-- Add major all-India inter-city routes
-- Delete existing Karnataka-only routes
DELETE FROM routes;

-- Add major all-India routes with approximate distances
INSERT INTO routes (from_location, to_location, distance_km) VALUES
-- Bengaluru routes
('Bengaluru', 'Chennai', 350),
('Bengaluru', 'Mumbai', 980),
('Bengaluru', 'Delhi', 2150),
('Bengaluru', 'Hyderabad', 570),
('Bengaluru', 'Pune', 840),
('Bengaluru', 'Goa', 560),
('Bengaluru', 'Kochi', 560),
('Bengaluru', 'Mangalore', 350),
('Bengaluru', 'Mysore', 150),
('Bengaluru', 'Hubli', 410),

-- Mumbai routes
('Mumbai', 'Delhi', 1420),
('Mumbai', 'Pune', 150),
('Mumbai', 'Goa', 470),
('Mumbai', 'Ahmedabad', 530),
('Mumbai', 'Hyderabad', 710),
('Mumbai', 'Jaipur', 1160),
('Mumbai', 'Surat', 280),
('Mumbai', 'Nashik', 165),

-- Delhi routes
('Delhi', 'Jaipur', 280),
('Delhi', 'Agra', 230),
('Delhi', 'Chandigarh', 245),
('Delhi', 'Lucknow', 555),
('Delhi', 'Amritsar', 450),
('Delhi', 'Dehradun', 250),
('Delhi', 'Shimla', 345),
('Delhi', 'Kolkata', 1450),
('Delhi', 'Chennai', 2180),

-- Chennai routes
('Chennai', 'Hyderabad', 630),
('Chennai', 'Coimbatore', 505),
('Chennai', 'Madurai', 460),
('Chennai', 'Pondicherry', 150),
('Chennai', 'Vellore', 145),
('Chennai', 'Trichy', 320),
('Chennai', 'Kochi', 690),

-- Hyderabad routes
('Hyderabad', 'Vijayawada', 270),
('Hyderabad', 'Pune', 560),
('Hyderabad', 'Goa', 630),
('Hyderabad', 'Visakhapatnam', 620),
('Hyderabad', 'Tirupati', 630),

-- Kolkata routes
('Kolkata', 'Bhubaneswar', 440),
('Kolkata', 'Guwahati', 1010),
('Kolkata', 'Patna', 585),
('Kolkata', 'Siliguri', 560),
('Kolkata', 'Ranchi', 420),

-- Pune routes
('Pune', 'Goa', 450),
('Pune', 'Nashik', 210),
('Pune', 'Aurangabad', 230),
('Pune', 'Kolhapur', 230),

-- Ahmedabad routes
('Ahmedabad', 'Jaipur', 670),
('Ahmedabad', 'Udaipur', 260),
('Ahmedabad', 'Vadodara', 110),
('Ahmedabad', 'Rajkot', 215),

-- Jaipur routes
('Jaipur', 'Udaipur', 395),
('Jaipur', 'Jodhpur', 335),
('Jaipur', 'Ajmer', 135),

-- Goa routes
('Goa', 'Mangalore', 360),
('Goa', 'Hubli', 185),
('Goa', 'Kochi', 600),

-- Kerala routes
('Kochi', 'Trivandrum', 205),
('Kochi', 'Calicut', 190),
('Kochi', 'Munnar', 130),

-- North routes
('Chandigarh', 'Shimla', 115),
('Chandigarh', 'Amritsar', 230),
('Chandigarh', 'Manali', 310),

-- Additional important routes
('Lucknow', 'Varanasi', 320),
('Indore', 'Bhopal', 195),
('Nagpur', 'Hyderabad', 500),
('Surat', 'Vadodara', 145),
('Coimbatore', 'Ooty', 85),
('Madurai', 'Rameshwaram', 170);
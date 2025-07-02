-- Sample users data (passwords are hashed version of 'password123')
INSERT INTO users (club_id, email, password_hash, name, age, role, parent_function, head_coach_function) VALUES 
('DEMO001', 'coach@demo.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewbS9NLUx4XTTbti', '田中コーチ', 35, 'coach', false, true),
('DEMO001', 'player1@demo.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewbS9NLUx4XTTbti', '佐藤太郎', 16, 'player', false, false),
('DEMO001', 'player2@demo.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewbS9NLUx4XTTbti', '山田花子', 15, 'player', false, false),
('DEMO001', 'parent1@demo.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewbS9NLUx4XTTbti', '佐藤一郎', 45, 'father', true, false),
('DEMO001', 'parent2@demo.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewbS9NLUx4XTTbti', '佐藤美香', 42, 'mother', false, false);
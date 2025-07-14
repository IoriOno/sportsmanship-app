-- Sample users data (passwords are hashed version of 'password123')
INSERT INTO users (club_id, email, password_hash, name, age, role, parent_function, head_coach_function, head_parent_function) VALUES 
('DEMO001', 'coach@demo.com', '$2b$12$x1V/gMaHp631VSsjHzRv3e3fc48IPmS2dJe7E4krQbIYtZF9KP8j.', '田中コーチ', 35, 'coach', false, true, false),
('DEMO001', 'yamada@demo.com', '$2b$12$x1V/gMaHp631VSsjHzRv3e3fc48IPmS2dJe7E4krQbIYtZF9KP8j.', '山田コーチ', 38, 'coach', false, true, false),
('DEMO001', 'player1@demo.com', '$2b$12$x1V/gMaHp631VSsjHzRv3e3fc48IPmS2dJe7E4krQbIYtZF9KP8j.', '佐藤太郎', 16, 'player', false, false, false),
('DEMO001', 'player2@demo.com', '$2b$12$x1V/gMaHp631VSsjHzRv3e3fc48IPmS2dJe7E4krQbIYtZF9KP8j.', '山田花子', 15, 'player', false, false, false),
('DEMO001', 'parent1@demo.com', '$2b$12$x1V/gMaHp631VSsjHzRv3e3fc48IPmS2dJe7E4krQbIYtZF9KP8j.', '佐藤一郎', 45, 'father', true, false, true),
('DEMO001', 'parent2@demo.com', '$2b$12$x1V/gMaHp631VSsjHzRv3e3fc48IPmS2dJe7E4krQbIYtZF9KP8j.', '佐藤美香', 42, 'mother', false, false, false);

-- Sample family relations
INSERT INTO family_relations (parent_id, child_id) VALUES 
((SELECT user_id FROM users WHERE email = 'parent1@demo.com'), (SELECT user_id FROM users WHERE email = 'player1@demo.com')),
((SELECT user_id FROM users WHERE email = 'parent2@demo.com'), (SELECT user_id FROM users WHERE email = 'player1@demo.com')),
((SELECT user_id FROM users WHERE email = 'parent1@demo.com'), (SELECT user_id FROM users WHERE email = 'player2@demo.com')),
((SELECT user_id FROM users WHERE email = 'parent2@demo.com'), (SELECT user_id FROM users WHERE email = 'player2@demo.com'));
-- Create database if not exists
SELECT 'CREATE DATABASE sportsmanship'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'sportsmanship');

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE user_role AS ENUM ('player', 'coach', 'father', 'mother', 'adult');

-- Create clubs table
CREATE TABLE IF NOT EXISTS clubs (
    club_id VARCHAR(50) PRIMARY KEY,
    club_name VARCHAR(255) NOT NULL,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    club_id VARCHAR(50) REFERENCES clubs(club_id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    age INTEGER,
    role user_role NOT NULL,
    parent_function BOOLEAN DEFAULT FALSE,
    head_coach_function BOOLEAN DEFAULT FALSE,
    head_parent_function BOOLEAN DEFAULT FALSE,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create family_relations table
CREATE TABLE IF NOT EXISTS family_relations (
    parent_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    child_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (parent_id, child_id)
);

-- Create test_results table
CREATE TABLE IF NOT EXISTS test_results (
    result_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    test_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- 自己肯定感関連
    self_determination INTEGER CHECK (self_determination >= 0 AND self_determination <= 50),
    self_acceptance INTEGER CHECK (self_acceptance >= 0 AND self_acceptance <= 50),
    self_worth INTEGER CHECK (self_worth >= 0 AND self_worth <= 50),
    self_efficacy INTEGER CHECK (self_efficacy >= 0 AND self_efficacy <= 50),
    -- アスリートマインド
    introspection INTEGER CHECK (introspection >= 0 AND introspection <= 50),
    self_control INTEGER CHECK (self_control >= 0 AND self_control <= 50),
    dedication INTEGER CHECK (dedication >= 0 AND dedication <= 50),
    intuition INTEGER CHECK (intuition >= 0 AND intuition <= 50),
    sensitivity INTEGER CHECK (sensitivity >= 0 AND sensitivity <= 50),
    steadiness INTEGER CHECK (steadiness >= 0 AND steadiness <= 50),
    comparison INTEGER CHECK (comparison >= 0 AND comparison <= 50),
    result_focus INTEGER CHECK (result_focus >= 0 AND result_focus <= 50),
    assertion INTEGER CHECK (assertion >= 0 AND assertion <= 50),
    thoroughness INTEGER CHECK (thoroughness >= 0 AND thoroughness <= 50),
    -- スポーツマンシップ
    courage INTEGER,
    resilience INTEGER,
    cooperation INTEGER,
    natural_acceptance INTEGER,
    non_rationality INTEGER,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create comparison_results table
CREATE TABLE IF NOT EXISTS comparison_results (
    comparison_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    participants JSONB NOT NULL,
    comparison_data JSONB NOT NULL,
    created_by UUID REFERENCES users(user_id) ON DELETE SET NULL,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create chat_history table
CREATE TABLE IF NOT EXISTS chat_history (
    chat_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    message_type VARCHAR(20) CHECK (message_type IN ('user', 'assistant')),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_users_club_id ON users(club_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_test_results_user_id ON test_results(user_id);
CREATE INDEX idx_test_results_test_date ON test_results(test_date);
CREATE INDEX idx_chat_history_user_id ON chat_history(user_id);
CREATE INDEX idx_comparison_results_created_by ON comparison_results(created_by);

-- Create updated_date trigger
CREATE OR REPLACE FUNCTION update_updated_date_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_date = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_date BEFORE UPDATE
    ON users FOR EACH ROW EXECUTE FUNCTION update_updated_date_column();
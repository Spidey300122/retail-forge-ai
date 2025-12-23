-- =====================================================
-- COMPLETE DATABASE SCHEMA FOR RETAIL FORGE AI
-- Run this ONCE to set up all tables
-- =====================================================

-- Drop existing tables (in correct order to avoid dependency errors)
DROP TABLE IF EXISTS ai_logs CASCADE;
DROP TABLE IF EXISTS exports CASCADE;
DROP TABLE IF EXISTS compliance_validations CASCADE;
DROP TABLE IF EXISTS creative_history CASCADE;
DROP TABLE IF EXISTS creatives CASCADE;
DROP TABLE IF EXISTS color_palettes CASCADE;
DROP TABLE IF EXISTS images CASCADE;
DROP TABLE IF EXISTS brand_profiles CASCADE;
DROP TABLE IF EXISTS api_usage CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- =====================================================
-- 1. USERS TABLE
-- =====================================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    subscription_tier VARCHAR(50) DEFAULT 'free'
);

-- Insert default user for development
INSERT INTO users (email, name, subscription_tier) 
VALUES ('demo@retailforge.ai', 'Demo User', 'free');

-- =====================================================
-- 2. BRAND PROFILES TABLE
-- =====================================================
CREATE TABLE brand_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    brand_name VARCHAR(255) NOT NULL,
    color_palette JSONB,
    style_preferences JSONB,
    logo_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_used TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 3. IMAGES TABLE
-- =====================================================
CREATE TABLE images (
    id VARCHAR(255) PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    original_filename VARCHAR(255),
    s3_key TEXT,
    s3_url TEXT,
    file_size_kb INTEGER,
    width INTEGER,
    height INTEGER,
    format VARCHAR(50),
    type VARCHAR(50),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 4. CREATIVES TABLE
-- =====================================================
CREATE TABLE creatives (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    brand_profile_id INTEGER REFERENCES brand_profiles(id) ON DELETE SET NULL,
    title VARCHAR(255),
    canvas_data JSONB NOT NULL,
    product_category VARCHAR(100),
    target_formats TEXT[],
    is_compliant BOOLEAN DEFAULT false,
    compliance_score INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 5. COMPLIANCE VALIDATIONS TABLE
-- =====================================================
CREATE TABLE compliance_validations (
    id SERIAL PRIMARY KEY,
    creative_id INTEGER REFERENCES creatives(id) ON DELETE CASCADE,
    rules_checked INTEGER NOT NULL,
    rules_passed INTEGER NOT NULL,
    violations JSONB,
    warnings JSONB,
    score INTEGER,
    validated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 6. EXPORTS TABLE
-- =====================================================
CREATE TABLE exports (
    id SERIAL PRIMARY KEY,
    creative_id INTEGER REFERENCES creatives(id) ON DELETE CASCADE,
    format VARCHAR(50) NOT NULL,
    file_url TEXT,
    file_size_kb INTEGER,
    dimensions JSONB,
    exported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 7. CREATIVE HISTORY TABLE (for brand learning)
-- =====================================================
CREATE TABLE creative_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    creative_id INTEGER REFERENCES creatives(id) ON DELETE CASCADE,
    action_type VARCHAR(50),
    choices JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 8. AI LOGS TABLE
-- =====================================================
CREATE TABLE ai_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    creative_id INTEGER REFERENCES creatives(id) ON DELETE SET NULL,
    agent_type VARCHAR(100),
    request_data JSONB,
    response_data JSONB,
    processing_time_ms INTEGER,
    status VARCHAR(50),
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 9. API USAGE TABLE (for rate limiting)
-- =====================================================
CREATE TABLE api_usage (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    endpoint VARCHAR(255),
    request_count INTEGER DEFAULT 1,
    date DATE DEFAULT CURRENT_DATE,
    UNIQUE(user_id, endpoint, date)
);

-- =====================================================
-- 10. COLOR PALETTES TABLE
-- =====================================================
CREATE TABLE color_palettes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    image_id VARCHAR(255),
    colors JSONB NOT NULL,
    extracted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- CREATE INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_brand_profiles_user ON brand_profiles(user_id);
CREATE INDEX idx_images_user ON images(user_id);
CREATE INDEX idx_creatives_user ON creatives(user_id);
CREATE INDEX idx_creatives_status ON creatives(status);
CREATE INDEX idx_validations_creative ON compliance_validations(creative_id);
CREATE INDEX idx_exports_creative ON exports(creative_id);
CREATE INDEX idx_history_user ON creative_history(user_id);
CREATE INDEX idx_ai_logs_user ON ai_logs(user_id);
CREATE INDEX idx_ai_logs_agent ON ai_logs(agent_type);
CREATE INDEX idx_api_usage_user_date ON api_usage(user_id, date);
CREATE INDEX idx_palettes_user ON color_palettes(user_id);
CREATE INDEX idx_palettes_extracted ON color_palettes(extracted_at DESC);

-- =====================================================
-- VERIFY SETUP
-- =====================================================
SELECT 'Database schema created successfully!' AS status;
SELECT COUNT(*) AS user_count FROM users;
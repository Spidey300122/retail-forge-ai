-- ============================================
-- Retail Forge AI Database Schema
-- ============================================

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- Brand profiles
CREATE TABLE brand_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    brand_name VARCHAR(255) NOT NULL,
    logo_url TEXT,
    logo_image_id VARCHAR(255),
    color_palette JSONB,  -- [{"hex": "#FF0000", "name": "primary", "usage": "dominant"}]
    preferred_fonts JSONB,  -- ["Arial", "Helvetica"]
    style_preferences JSONB,  -- {"layout": "modern", "tone": "energetic"}
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_used TIMESTAMP
);

CREATE INDEX idx_brand_user ON brand_profiles(user_id);
CREATE INDEX idx_brand_last_used ON brand_profiles(last_used DESC);

-- Images storage metadata
CREATE TABLE images (
    id VARCHAR(255) PRIMARY KEY,  -- img_abc123
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    original_filename VARCHAR(255),
    s3_key TEXT NOT NULL,
    s3_url TEXT NOT NULL,
    file_size_kb INTEGER,
    width INTEGER,
    height INTEGER,
    format VARCHAR(10),  -- jpeg, png, webp
    type VARCHAR(50),  -- product, logo, background, generated
    metadata JSONB,  -- {"removed_background": true, "colors": [...]}
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_images_user ON images(user_id);
CREATE INDEX idx_images_type ON images(type);
CREATE INDEX idx_images_created ON images(created_at DESC);

-- Creative projects (canvas state)
CREATE TABLE creatives (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    brand_profile_id INTEGER REFERENCES brand_profiles(id) ON DELETE SET NULL,
    title VARCHAR(255),
    canvas_data JSONB NOT NULL,  -- Fabric.js canvas JSON
    thumbnail_url TEXT,
    product_category VARCHAR(100),
    target_formats TEXT[],  -- ["instagram_post", "facebook_feed"]
    is_compliant BOOLEAN DEFAULT false,
    compliance_score INTEGER,  -- 0-100
    status VARCHAR(50) DEFAULT 'draft',  -- draft, validated, exported
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    exported_at TIMESTAMP
);

CREATE INDEX idx_creatives_user ON creatives(user_id);
CREATE INDEX idx_creatives_brand ON creatives(brand_profile_id);
CREATE INDEX idx_creatives_status ON creatives(status);
CREATE INDEX idx_creatives_updated ON creatives(updated_at DESC);

-- Compliance validation results
CREATE TABLE compliance_validations (
    id SERIAL PRIMARY KEY,
    creative_id INTEGER REFERENCES creatives(id) ON DELETE CASCADE,
    is_compliant BOOLEAN,
    score INTEGER,
    violations JSONB,  -- [{"rule": "min_font_size", "severity": "error", ...}]
    warnings JSONB,
    validated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_validations_creative ON compliance_validations(creative_id);

-- Exported creatives
CREATE TABLE exports (
    id SERIAL PRIMARY KEY,
    creative_id INTEGER REFERENCES creatives(id) ON DELETE CASCADE,
    format VARCHAR(50),  -- instagram_post, facebook_feed, etc.
    s3_key TEXT NOT NULL,
    s3_url TEXT NOT NULL,
    file_size_kb INTEGER,
    dimensions JSONB,  -- {"width": 1080, "height": 1080}
    compliance_report_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_exports_creative ON exports(creative_id);

-- User creative history (for brand learning)
CREATE TABLE creative_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    brand_profile_id INTEGER REFERENCES brand_profiles(id) ON DELETE SET NULL,
    creative_id INTEGER REFERENCES creatives(id) ON DELETE CASCADE,
    user_choices JSONB,  -- {"layout_chosen": "layout_1", "colors_used": [...]}
    ai_suggestions_used JSONB,  -- {"layout": true, "copy": false}
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_history_user ON creative_history(user_id);
CREATE INDEX idx_history_brand ON creative_history(brand_profile_id);

-- AI interaction logs (for debugging/analytics)
CREATE TABLE ai_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    creative_id INTEGER REFERENCES creatives(id) ON DELETE SET NULL,
    agent_type VARCHAR(50),  -- creative_director, compliance_officer, etc.
    request_data JSONB,
    response_data JSONB,
    processing_time_ms INTEGER,
    status VARCHAR(50),  -- success, error
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_logs_user ON ai_logs(user_id);
CREATE INDEX idx_logs_agent ON ai_logs(agent_type);
CREATE INDEX idx_logs_created ON ai_logs(created_at DESC);

-- API usage tracking (for rate limiting)
CREATE TABLE api_usage (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    endpoint VARCHAR(255),
    request_count INTEGER DEFAULT 1,
    date DATE DEFAULT CURRENT_DATE,
    UNIQUE(user_id, endpoint, date)
);

CREATE INDEX idx_usage_user_date ON api_usage(user_id, date DESC);

-- ============================================
-- Helper Functions
-- ============================================

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for auto-updating timestamps
CREATE TRIGGER update_brand_profiles_updated_at 
    BEFORE UPDATE ON brand_profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_creatives_updated_at 
    BEFORE UPDATE ON creatives 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Sample Data (for development)
-- ============================================

-- Insert test user
INSERT INTO users (email, name) 
VALUES ('test@example.com', 'Test User');

-- Insert test brand profile
INSERT INTO brand_profiles (user_id, brand_name, color_palette, style_preferences)
VALUES (
    1, 
    'Fresh Juice Co.',
    '[{"hex": "#FF5733", "name": "primary"}, {"hex": "#FFC300", "name": "accent"}]',
    '{"layout": "modern", "tone": "energetic"}'
);
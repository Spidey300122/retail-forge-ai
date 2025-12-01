-- backend/docs/database/color_palettes_schema.sql

-- Drop table if it exists
DROP TABLE IF EXISTS color_palettes CASCADE;

-- Create color_palettes table
CREATE TABLE color_palettes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    image_id VARCHAR(255),
    colors JSONB NOT NULL,
    extracted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_palettes_user ON color_palettes(user_id);
CREATE INDEX idx_palettes_extracted ON color_palettes(extracted_at DESC);
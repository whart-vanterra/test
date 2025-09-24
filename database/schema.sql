-- Vanterra Reviews Database Schema
-- This file contains all the SQL commands needed to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('brand-logos', 'brand-logos', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('platform-logos', 'platform-logos', true);

-- Brands table
CREATE TABLE reviews_brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  logo_url TEXT,
  website_url TEXT,
  notification_email VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Locations table
CREATE TABLE reviews_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES reviews_brands(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255),
  rating_type VARCHAR(10) DEFAULT 'emoji' CHECK (rating_type IN ('emoji', 'thumbs')),
  platform_urls JSONB DEFAULT '{}',
  platform_order TEXT[],
  notification_email VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews table
CREATE TABLE reviews_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID NOT NULL REFERENCES reviews_locations(id) ON DELETE CASCADE,
  nps_score INTEGER NOT NULL CHECK (nps_score >= 1 AND nps_score <= 5),
  customer_name VARCHAR(255),
  customer_email VARCHAR(255),
  customer_phone VARCHAR(20),
  comments TEXT,
  feedback_type VARCHAR(10) NOT NULL CHECK (feedback_type IN ('positive', 'negative')),
  external_review_url TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Review platforms table
CREATE TABLE reviews_platforms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  key VARCHAR(100) UNIQUE NOT NULL,
  logo_url TEXT,
  color VARCHAR(7) DEFAULT '#6B7280',
  priority INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Negative feedback tracking table
CREATE TABLE reviews_negative_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES reviews_reviews(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES reviews_locations(id) ON DELETE CASCADE,
  email_sent BOOLEAN DEFAULT false,
  email_sent_at TIMESTAMPTZ,
  gm_notified BOOLEAN DEFAULT false,
  gm_notified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin users table
CREATE TABLE reviews_admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  is_active BOOLEAN DEFAULT true,
  reset_token VARCHAR(255),
  reset_token_expires TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_reviews_locations_brand_id ON reviews_locations(brand_id);
CREATE INDEX idx_reviews_reviews_location_id ON reviews_reviews(location_id);
CREATE INDEX idx_reviews_reviews_created_at ON reviews_reviews(created_at);
CREATE INDEX idx_reviews_reviews_feedback_type ON reviews_reviews(feedback_type);
CREATE INDEX idx_reviews_negative_feedback_review_id ON reviews_negative_feedback(review_id);
CREATE INDEX idx_reviews_negative_feedback_location_id ON reviews_negative_feedback(location_id);

-- Insert default review platforms
INSERT INTO reviews_platforms (name, key, color, priority) VALUES
('Google', 'google', '#4285F4', 1),
('Yelp', 'yelp', '#FF1A1A', 2),
('Facebook', 'facebook', '#1877F2', 3),
('TripAdvisor', 'tripadvisor', '#34E0A1', 4),
('BBB', 'bbb', '#FF6600', 5);

-- Row Level Security (RLS) Policies
ALTER TABLE reviews_brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews_platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews_negative_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews_admin_users ENABLE ROW LEVEL SECURITY;

-- Public read access for brands and locations (for public review pages)
CREATE POLICY "Public read access for brands" ON reviews_brands FOR SELECT USING (true);
CREATE POLICY "Public read access for locations" ON reviews_locations FOR SELECT USING (true);
CREATE POLICY "Public read access for platforms" ON reviews_platforms FOR SELECT USING (is_active = true);

-- Public insert access for reviews (for review submission)
CREATE POLICY "Public insert access for reviews" ON reviews_reviews FOR INSERT WITH CHECK (true);

-- Admin policies (will be handled by application-level authentication)
-- These are placeholder policies that will be updated based on admin authentication
CREATE POLICY "Admin full access to brands" ON reviews_brands FOR ALL USING (true);
CREATE POLICY "Admin full access to locations" ON reviews_locations FOR ALL USING (true);
CREATE POLICY "Admin full access to reviews" ON reviews_reviews FOR ALL USING (true);
CREATE POLICY "Admin full access to platforms" ON reviews_platforms FOR ALL USING (true);
CREATE POLICY "Admin full access to negative feedback" ON reviews_negative_feedback FOR ALL USING (true);
CREATE POLICY "Admin full access to admin users" ON reviews_admin_users FOR ALL USING (true);

-- Functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_reviews_brands_updated_at BEFORE UPDATE ON reviews_brands FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_locations_updated_at BEFORE UPDATE ON reviews_locations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_platforms_updated_at BEFORE UPDATE ON reviews_platforms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_admin_users_updated_at BEFORE UPDATE ON reviews_admin_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create PING database
CREATE DATABASE ping_db;

-- Create default organization
INSERT INTO organizations (name, domain, is_active, data_collection_enabled, keyboard_tracking_enabled)
VALUES ('Rowan University', 'rowan.edu', true, true, true);

-- Create platform admin user (password: admin123)
-- Note: In production, use a secure password and change immediately
INSERT INTO users (email, username, hashed_password, full_name, role, is_active, is_verified, organization_id)
VALUES (
  'admin@ping.agaii.org',
  'admin',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5lQvceL2Z0d8i',  -- admin123
  'Platform Admin',
  'platform_admin',
  true,
  true,
  1
);

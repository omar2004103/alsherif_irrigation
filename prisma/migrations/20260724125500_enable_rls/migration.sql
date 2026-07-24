-- Ensure auth schema and Supabase helper functions exist for shadow database validation
CREATE SCHEMA IF NOT EXISTS auth;
CREATE OR REPLACE FUNCTION auth.role() RETURNS text AS $$ SELECT coalesce(current_setting('request.jwt.claim.role', true), 'anon'); $$ LANGUAGE sql STABLE;
CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid AS $$ SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid; $$ LANGUAGE sql STABLE;

-- ======================================================
-- MIGRATION: Enable Row Level Security (RLS) & Policies
-- ======================================================

-- ------------------------------------------------------
-- 1. PUBLIC READ-ONLY TABLES
-- ------------------------------------------------------

-- Categories
ALTER TABLE "categories" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read categories" ON "categories" FOR SELECT USING (true);
CREATE POLICY "Admin all categories" ON "categories" FOR ALL USING (auth.role() = 'authenticated');

-- Brands
ALTER TABLE "brands" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read brands" ON "brands" FOR SELECT USING (true);
CREATE POLICY "Admin all brands" ON "brands" FOR ALL USING (auth.role() = 'authenticated');

-- Products
ALTER TABLE "products" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read products" ON "products" FOR SELECT USING (true);
CREATE POLICY "Admin all products" ON "products" FOR ALL USING (auth.role() = 'authenticated');

-- Product Images
ALTER TABLE "product_images" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read product_images" ON "product_images" FOR SELECT USING (true);
CREATE POLICY "Admin all product_images" ON "product_images" FOR ALL USING (auth.role() = 'authenticated');

-- Product Specifications
ALTER TABLE "product_specifications" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read product_specifications" ON "product_specifications" FOR SELECT USING (true);
CREATE POLICY "Admin all product_specifications" ON "product_specifications" FOR ALL USING (auth.role() = 'authenticated');

-- Services
ALTER TABLE "services" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read services" ON "services" FOR SELECT USING (true);
CREATE POLICY "Admin all services" ON "services" FOR ALL USING (auth.role() = 'authenticated');

-- Articles
ALTER TABLE "articles" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read articles" ON "articles" FOR SELECT USING (true);
CREATE POLICY "Admin all articles" ON "articles" FOR ALL USING (auth.role() = 'authenticated');

-- Website Settings
ALTER TABLE "website_settings" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read website_settings" ON "website_settings" FOR SELECT USING (true);
CREATE POLICY "Admin all website_settings" ON "website_settings" FOR ALL USING (auth.role() = 'authenticated');

-- Homepage Contents
ALTER TABLE "homepage_contents" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read homepage_contents" ON "homepage_contents" FOR SELECT USING (true);
CREATE POLICY "Admin all homepage_contents" ON "homepage_contents" FOR ALL USING (auth.role() = 'authenticated');

-- SEO Settings
ALTER TABLE "seo_settings" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read seo_settings" ON "seo_settings" FOR SELECT USING (true);
CREATE POLICY "Admin all seo_settings" ON "seo_settings" FOR ALL USING (auth.role() = 'authenticated');

-- Footer Contents
ALTER TABLE "footer_contents" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read footer_contents" ON "footer_contents" FOR SELECT USING (true);
CREATE POLICY "Admin all footer_contents" ON "footer_contents" FOR ALL USING (auth.role() = 'authenticated');

-- Media Library
ALTER TABLE "media_library" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read media_library" ON "media_library" FOR SELECT USING (true);
CREATE POLICY "Admin all media_library" ON "media_library" FOR ALL USING (auth.role() = 'authenticated');


-- ------------------------------------------------------
-- 2. CONTACT & QUOTE TABLES (Public Insert Only)
-- ------------------------------------------------------

-- Contact Messages
ALTER TABLE "contact_messages" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public insert contact_messages" ON "contact_messages" FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin all contact_messages" ON "contact_messages" FOR ALL USING (auth.role() = 'authenticated');

-- Quote Requests
ALTER TABLE "quote_requests" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public insert quote_requests" ON "quote_requests" FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin all quote_requests" ON "quote_requests" FOR ALL USING (auth.role() = 'authenticated');


-- ------------------------------------------------------
-- 3. ADMIN-ONLY TABLES (Authenticated Admins Only)
-- ------------------------------------------------------

-- Admin Users
ALTER TABLE "admin_users" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin all admin_users" ON "admin_users" FOR ALL USING (auth.role() = 'authenticated');

-- Roles
ALTER TABLE "roles" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin all roles" ON "roles" FOR ALL USING (auth.role() = 'authenticated');

-- Permissions
ALTER TABLE "permissions" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin all permissions" ON "permissions" FOR ALL USING (auth.role() = 'authenticated');

-- Role Permissions
ALTER TABLE "role_permissions" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin all role_permissions" ON "role_permissions" FOR ALL USING (auth.role() = 'authenticated');

-- Admin Sessions
ALTER TABLE "admin_sessions" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin all admin_sessions" ON "admin_sessions" FOR ALL USING (auth.role() = 'authenticated');

-- Notifications
ALTER TABLE "notifications" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin all notifications" ON "notifications" FOR ALL USING (auth.role() = 'authenticated');

-- Activity Logs
ALTER TABLE "activity_logs" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin all activity_logs" ON "activity_logs" FOR ALL USING (auth.role() = 'authenticated');

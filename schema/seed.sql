-- ============================================================
-- EliteEscorts Seed Data
-- Run AFTER schema.sql
-- ============================================================

-- ── Admin user (password: Admin@1234) ────────────────────────
INSERT INTO ec_users (email, password_hash, name, role, status)
VALUES (
  'admin@eliteescorts.in',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TiGmj2Xr0WBl9CRr5HpQZ5mU9VQu',
  'Admin',
  'admin',
  'active'
) ON CONFLICT (email) DO NOTHING;

-- ── Boost plans ───────────────────────────────────────────────
INSERT INTO ec_boost_plans (name, slug, badge_label, badge_color, sort_priority, description, price, duration_days, is_active)
VALUES
  ('Featured', 'featured', 'Featured', 'blue',   10, 'Appear above free listings across all search pages.', 499,  30, TRUE),
  ('Premium',  'premium',  'Premium',  'amber',  20, 'Appear at the top of city and area pages.',            999,  30, TRUE),
  ('VIP Elite','vip',      'VIP Elite','purple', 30, 'Top position across all pages with VIP badge.',       1999, 30, TRUE)
ON CONFLICT (slug) DO NOTHING;

-- ── Locations: Tamil Nadu ─────────────────────────────────────
-- Coimbatore areas
INSERT INTO ec_locations (state, city, area, area_slug, city_slug, state_slug, url_base) VALUES
  ('Tamil Nadu','Coimbatore','Gandhipuram',  'gandhipuram',   'coimbatore','tamilnadu','escorts/coimbatore/gandhipuram'),
  ('Tamil Nadu','Coimbatore','RS Puram',     'rs-puram',      'coimbatore','tamilnadu','escorts/coimbatore/rs-puram'),
  ('Tamil Nadu','Coimbatore','Race Course',  'race-course',   'coimbatore','tamilnadu','escorts/coimbatore/race-course'),
  ('Tamil Nadu','Coimbatore','Peelamedu',    'peelamedu',     'coimbatore','tamilnadu','escorts/coimbatore/peelamedu'),
  ('Tamil Nadu','Coimbatore','Saibaba Colony','saibaba-colony','coimbatore','tamilnadu','escorts/coimbatore/saibaba-colony')
ON CONFLICT (area_slug) DO NOTHING;

-- Chennai areas
INSERT INTO ec_locations (state, city, area, area_slug, city_slug, state_slug, url_base) VALUES
  ('Tamil Nadu','Chennai','Adyar',       'adyar',       'chennai','tamilnadu','escorts/chennai/adyar'),
  ('Tamil Nadu','Chennai','Anna Nagar',  'anna-nagar',  'chennai','tamilnadu','escorts/chennai/anna-nagar'),
  ('Tamil Nadu','Chennai','T Nagar',     't-nagar',     'chennai','tamilnadu','escorts/chennai/t-nagar'),
  ('Tamil Nadu','Chennai','Velachery',   'velachery',   'chennai','tamilnadu','escorts/chennai/velachery'),
  ('Tamil Nadu','Chennai','Nungambakkam','nungambakkam','chennai','tamilnadu','escorts/chennai/nungambakkam')
ON CONFLICT (area_slug) DO NOTHING;

-- ── Site settings ─────────────────────────────────────────────
INSERT INTO ec_settings (key, value) VALUES
  ('site_name',              'EliteEscorts'),
  ('site_tagline',           'Tamil Nadu No.1 Verified Escort Platform'),
  ('header_logo_text',       'EliteEscorts'),
  ('watermark_text',         'EliteEscorts.in'),
  ('theme_color',            '#e11d48'),
  ('footer_about',           'EliteEscorts is Tamil Nadu''s most trusted adult companion classified platform. All profiles are verified and 18+.'),
  ('footer_copyright',       '© 2025 EliteEscorts. All rights reserved.'),
  ('footer_contact_email',   'support@eliteescorts.in'),
  ('seo_home_title',         'EliteEscorts - Verified Escort Classifieds in Tamil Nadu'),
  ('seo_home_desc',          'Browse 100% verified independent escort profiles across Tamil Nadu. Coimbatore, Chennai and all major cities.')
ON CONFLICT (key) DO NOTHING;

-- ── Sample page content ───────────────────────────────────────
INSERT INTO ec_page_content (page_key, page_type, page_name, slug_ref, content_heading, content_html, faq_json)
VALUES (
  'listings_all', 'listings', 'All Escorts (Browse Page)', '',
  'Browse Verified Escorts in Tamil Nadu',
  '<p>Welcome to EliteEscorts — Tamil Nadu''s most trusted adult classified platform. Browse verified independent escort profiles across Chennai, Coimbatore, and every major locality.</p><h3>How to Browse</h3><ul><li>Use the <strong>Search</strong> button to filter by region, city, or area.</li><li>Click any listing to view full profile details and contact information.</li><li>Contact the escort directly via phone, WhatsApp, or Telegram.</li></ul>',
  '[{"q":"How do I find escorts near me in Tamil Nadu?","a":"Use the Search button in the navbar to select your region, city and area."},{"q":"Are all escort profiles verified?","a":"Yes. Every profile undergoes a manual admin review. We ensure all escorts are adults 18+."},{"q":"Can I post my own escort listing?","a":"Yes. Register a free account and click Post Ad on your dashboard. Free accounts get 1 listing."}]'::jsonb
), (
  'state_tamilnadu', 'state', 'Tamil Nadu (State Page)', 'tamilnadu',
  'Escort Services in Tamil Nadu - Browse by City',
  '<p>Tamil Nadu is home to South India''s most vibrant cities. EliteEscorts brings you verified independent escort listings across Chennai, Coimbatore and more. Each city page lists escorts by area for easy browsing.</p>',
  '[{"q":"Which cities in Tamil Nadu have escort listings?","a":"We cover Coimbatore and Chennai with full area-level listings. More cities are added regularly."},{"q":"Are Tamil Nadu listings verified?","a":"Yes. All profiles are manually verified by our admin team with 18+ age enforcement."}]'::jsonb
)
ON CONFLICT (page_key) DO NOTHING;

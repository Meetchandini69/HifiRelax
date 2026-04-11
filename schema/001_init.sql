-- ============================================================
-- EliteEscorts Database Schema
-- PostgreSQL 14+
-- Run this file once to set up the database from scratch.
-- ============================================================

-- Users
CREATE TABLE IF NOT EXISTS ec_users (
  id            SERIAL PRIMARY KEY,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name          VARCHAR(255) NOT NULL,
  role          VARCHAR(50)  NOT NULL DEFAULT 'user',
  status        VARCHAR(20)  NOT NULL DEFAULT 'active',
  created_at    TIMESTAMP DEFAULT NOW()
);

-- Locations (state / city / area hierarchy)
CREATE TABLE IF NOT EXISTS ec_locations (
  id         SERIAL PRIMARY KEY,
  state      VARCHAR(255) NOT NULL,
  city       VARCHAR(255) NOT NULL,
  area       VARCHAR(255) NOT NULL,
  area_slug  VARCHAR(255) NOT NULL UNIQUE,
  city_slug  TEXT,
  state_slug TEXT,
  url_base   VARCHAR(500) NOT NULL DEFAULT '',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Boost plans (featured / premium / vip)
CREATE TABLE IF NOT EXISTS ec_boost_plans (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  slug          VARCHAR(50)  NOT NULL UNIQUE,
  badge_label   VARCHAR(50)  NOT NULL,
  badge_color   VARCHAR(50)  NOT NULL,
  sort_priority INTEGER      NOT NULL DEFAULT 0,
  description   TEXT,
  price         NUMERIC      NOT NULL DEFAULT 0,
  duration_days INTEGER      NOT NULL DEFAULT 30,
  is_active     BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMP DEFAULT NOW()
);

-- Escort profiles / listings
CREATE TABLE IF NOT EXISTS ec_profiles (
  id                  SERIAL PRIMARY KEY,
  user_id             INTEGER REFERENCES ec_users(id) ON DELETE SET NULL,
  title               VARCHAR(500) NOT NULL,
  name                VARCHAR(255) NOT NULL,
  description         TEXT,
  age                 INTEGER,
  phone               VARCHAR(50),
  whatsapp            VARCHAR(50),
  telegram            VARCHAR(100),
  services            TEXT[],
  photos              TEXT[],
  location_id         INTEGER REFERENCES ec_locations(id) ON DELETE SET NULL,
  slug                VARCHAR(500),
  full_url            TEXT,
  status              VARCHAR(50)  DEFAULT 'pending',
  rejection_reason    TEXT,
  boost_plan_slug     VARCHAR(50),
  boost_expires_at    TIMESTAMP,
  boost_sort_priority INTEGER      NOT NULL DEFAULT 0,
  created_at          TIMESTAMP DEFAULT NOW(),
  updated_at          TIMESTAMP DEFAULT NOW()
);

-- Site settings (key-value store)
CREATE TABLE IF NOT EXISTS ec_settings (
  key        VARCHAR(255) PRIMARY KEY,
  value      TEXT,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Boost purchase requests
CREATE TABLE IF NOT EXISTS ec_boost_requests (
  id         SERIAL PRIMARY KEY,
  profile_id INTEGER     NOT NULL REFERENCES ec_profiles(id) ON DELETE CASCADE,
  user_id    INTEGER     NOT NULL REFERENCES ec_users(id)    ON DELETE CASCADE,
  plan_slug  VARCHAR(50) NOT NULL,
  status     VARCHAR(20) NOT NULL DEFAULT 'pending',
  admin_note TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- SEO page content (per page key)
CREATE TABLE IF NOT EXISTS ec_page_content (
  id              SERIAL PRIMARY KEY,
  page_key        VARCHAR(200) NOT NULL UNIQUE,
  page_type       VARCHAR(50)  NOT NULL DEFAULT 'area',
  page_name       VARCHAR(300) NOT NULL,
  slug_ref        VARCHAR(200),
  content_heading VARCHAR(300),
  content_html    TEXT,
  faq_json        JSONB        DEFAULT '[]',
  created_at      TIMESTAMPTZ  DEFAULT NOW(),
  updated_at      TIMESTAMPTZ  DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_status     ON ec_profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_location   ON ec_profiles(location_id);
CREATE INDEX IF NOT EXISTS idx_profiles_user       ON ec_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_slug       ON ec_profiles(slug);
CREATE INDEX IF NOT EXISTS idx_profiles_boost_exp  ON ec_profiles(boost_expires_at);
CREATE INDEX IF NOT EXISTS idx_locations_area_slug ON ec_locations(area_slug);
CREATE INDEX IF NOT EXISTS idx_locations_city_slug ON ec_locations(city_slug);
CREATE INDEX IF NOT EXISTS idx_page_content_key    ON ec_page_content(page_key);

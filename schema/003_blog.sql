-- Ensure blog storage exists even when an existing installation skips the
-- complete schema bootstrap or has an older blog table definition.
CREATE TABLE IF NOT EXISTS ec_blog_posts (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(200) NOT NULL UNIQUE,
  excerpt VARCHAR(500) NOT NULL DEFAULT '',
  content TEXT NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('Health', 'Lifestyle', 'Relationships')),
  cover_image_url VARCHAR(2000) NOT NULL DEFAULT '',
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK ((status = 'published' AND published_at IS NOT NULL) OR (status = 'draft' AND published_at IS NULL))
);

ALTER TABLE ec_blog_posts
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_blog_published
  ON ec_blog_posts (published_at DESC, id DESC)
  WHERE status = 'published';

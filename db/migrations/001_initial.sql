CREATE TABLE visitor_sessions (
 id uuid PRIMARY KEY, token_hash text NOT NULL UNIQUE, expires_at timestamptz NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE admins (id uuid PRIMARY KEY, username text NOT NULL UNIQUE, password_hash text NOT NULL);
CREATE TABLE admin_sessions (token_hash text PRIMARY KEY, admin_id uuid NOT NULL REFERENCES admins(id) ON DELETE CASCADE, expires_at timestamptz NOT NULL);
CREATE TABLE articles (
 id uuid PRIMARY KEY, slug text NOT NULL UNIQUE, title text NOT NULL, summary text NOT NULL,
 category text NOT NULL, body jsonb NOT NULL, sources jsonb NOT NULL DEFAULT '[]',
 pattern_id uuid, published boolean NOT NULL DEFAULT true, sort_order integer NOT NULL DEFAULT 0,
 updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE patterns (
 id uuid PRIMARY KEY, name text NOT NULL, description text NOT NULL, sources jsonb NOT NULL DEFAULT '[]',
 model jsonb NOT NULL CHECK (model->>'schemaVersion' = '1'), published boolean NOT NULL DEFAULT true,
 sort_order integer NOT NULL DEFAULT 0, updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE articles ADD CONSTRAINT articles_pattern_fk FOREIGN KEY (pattern_id) REFERENCES patterns(id);
CREATE TABLE tutorials (
 id uuid PRIMARY KEY, slug text NOT NULL UNIQUE, title text NOT NULL, summary text NOT NULL,
 steps jsonb NOT NULL, pattern_id uuid REFERENCES patterns(id), sort_order integer NOT NULL DEFAULT 0,
 published boolean NOT NULL DEFAULT true, updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE works (
 id uuid PRIMARY KEY, owner_id uuid REFERENCES visitor_sessions(id), title varchar(60) NOT NULL,
 description varchar(500) NOT NULL DEFAULT '', model jsonb NOT NULL CHECK (model->>'schemaVersion' = '1'),
 status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','pending','published','rejected')),
 version integer NOT NULL DEFAULT 1 CHECK (version > 0), is_example boolean NOT NULL DEFAULT false,
 category text NOT NULL DEFAULT '自由创作', featured_order integer NOT NULL DEFAULT 100,
 review_note text NOT NULL DEFAULT '', created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now(), published_at timestamptz,
 CHECK (owner_id IS NOT NULL OR is_example)
);
CREATE INDEX works_owner ON works(owner_id, updated_at DESC);
CREATE INDEX works_public ON works(featured_order, published_at DESC) WHERE status='published';
CREATE INDEX articles_public ON articles(category, sort_order) WHERE published;
CREATE TABLE tutorial_progress (
 visitor_id uuid NOT NULL REFERENCES visitor_sessions(id) ON DELETE CASCADE,
 tutorial_id uuid NOT NULL REFERENCES tutorials(id) ON DELETE CASCADE, step integer NOT NULL CHECK(step >= 0 AND step <= 20),
 updated_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(visitor_id,tutorial_id)
);
CREATE TABLE favorites (
 visitor_id uuid NOT NULL REFERENCES visitor_sessions(id) ON DELETE CASCADE,
 work_id uuid NOT NULL REFERENCES works(id) ON DELETE CASCADE, PRIMARY KEY(visitor_id,work_id)
);
CREATE TABLE rate_limits (key text PRIMARY KEY, hits integer NOT NULL, reset_at timestamptz NOT NULL);
CREATE TABLE admin_audit (id bigserial PRIMARY KEY, admin_id uuid NOT NULL REFERENCES admins(id), action text NOT NULL, target_id uuid, created_at timestamptz NOT NULL DEFAULT now());

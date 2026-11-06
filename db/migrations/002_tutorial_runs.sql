CREATE TABLE tutorial_runs (
 id uuid PRIMARY KEY,
 visitor_id uuid NOT NULL REFERENCES visitor_sessions(id) ON DELETE CASCADE,
 tutorial_id uuid NOT NULL REFERENCES tutorials(id) ON DELETE CASCADE,
 work_id uuid REFERENCES works(id) ON DELETE SET NULL,
 step integer NOT NULL DEFAULT 0 CHECK(step BETWEEN 0 AND 20),
 active boolean NOT NULL DEFAULT true,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX tutorial_active_run ON tutorial_runs(visitor_id,tutorial_id) WHERE active;

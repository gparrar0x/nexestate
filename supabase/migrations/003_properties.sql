-- Migration: 003_properties
-- Creates properties table synced from CRM providers
-- Rollback: DROP TABLE properties CASCADE;

CREATE TABLE IF NOT EXISTS properties (
  id              UUID             PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID             NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
  tokko_id        INTEGER,
  title           TEXT             NOT NULL DEFAULT '',
  address         TEXT             NOT NULL DEFAULT '',
  description     TEXT             NOT NULL DEFAULT '',
  property_type   TEXT             NOT NULL DEFAULT '',
  operation_type  TEXT             NOT NULL DEFAULT '',
  price           NUMERIC,
  currency        TEXT,
  surface_total   NUMERIC,
  surface_covered NUMERIC,
  bedrooms        INTEGER,
  bathrooms       INTEGER,
  photos          JSONB            NOT NULL DEFAULT '[]',
  geo_lat         DOUBLE PRECISION,
  geo_long        DOUBLE PRECISION,
  status          TEXT             NOT NULL DEFAULT 'active',
  tokko_data      JSONB            NOT NULL DEFAULT '{}',
  synced_at       TIMESTAMPTZ      NOT NULL DEFAULT now(),
  created_at      TIMESTAMPTZ      NOT NULL DEFAULT now(),
  UNIQUE (org_id, tokko_id)
);

CREATE INDEX IF NOT EXISTS idx_properties_org_id  ON properties (org_id);
CREATE INDEX IF NOT EXISTS idx_properties_tokko_id ON properties (tokko_id);

-- RLS: org members can read, admins can write
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "properties_select_member"
  ON properties
  FOR SELECT
  TO authenticated
  USING (org_id = public.get_user_org_id(auth.uid()));

CREATE POLICY "properties_all_admin"
  ON properties
  FOR ALL
  TO authenticated
  USING (
    org_id = public.get_user_org_id(auth.uid())
    AND EXISTS (
      SELECT 1 FROM members m
      WHERE m.user_id = auth.uid()
        AND m.org_id  = properties.org_id
        AND m.role    = 'admin'
    )
  )
  WITH CHECK (
    org_id = public.get_user_org_id(auth.uid())
    AND EXISTS (
      SELECT 1 FROM members m
      WHERE m.user_id = auth.uid()
        AND m.org_id  = properties.org_id
        AND m.role    = 'admin'
    )
  );

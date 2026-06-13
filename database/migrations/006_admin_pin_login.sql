BEGIN;

ALTER TABLE admin_grants
  ADD COLUMN IF NOT EXISTS pin_hash text,
  ADD COLUMN IF NOT EXISTS pin_updated_at timestamptz;

CREATE INDEX IF NOT EXISTS admin_grants_pin_email_idx
  ON admin_grants (lower(email))
  WHERE pin_hash IS NOT NULL;

COMMIT;

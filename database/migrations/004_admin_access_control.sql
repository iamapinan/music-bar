BEGIN;

CREATE TABLE IF NOT EXISTS admin_grants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  email varchar(320) NOT NULL,
  role varchar(30) NOT NULL CHECK (role IN ('owner', 'admin', 'staff')),
  granted_by_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS admin_grants_tenant_email_idx
  ON admin_grants (tenant_id, lower(email));

CREATE INDEX IF NOT EXISTS admin_grants_email_idx
  ON admin_grants (lower(email));

COMMIT;

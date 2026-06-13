BEGIN;

CREATE TABLE IF NOT EXISTS store_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_name text NOT NULL,
  requested_slug text,
  applicant_name text NOT NULL,
  applicant_email text NOT NULL,
  phone text,
  notes text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_tenant_id uuid REFERENCES tenants(id) ON DELETE SET NULL,
  reviewed_by_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  rejection_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS store_applications_status_created_idx
  ON store_applications (status, created_at DESC);

CREATE INDEX IF NOT EXISTS store_applications_email_idx
  ON store_applications (lower(applicant_email));

COMMIT;

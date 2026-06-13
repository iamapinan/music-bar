BEGIN;

-- Drop the old global unique constraint that breaks multi-tenant
DROP INDEX IF EXISTS playlists_single_default_idx;

-- Create a per-tenant unique index so each tenant can have exactly one default playlist
CREATE UNIQUE INDEX IF NOT EXISTS playlists_tenant_single_default_idx
  ON playlists (tenant_id, is_default)
  WHERE is_default = true;

COMMIT;

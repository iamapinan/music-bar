BEGIN;

WITH inserted AS (
  INSERT INTO tenants (slug, name, display_name)
  VALUES ('main', 'Music Bar', 'Music Bar')
  ON CONFLICT (slug) DO UPDATE
  SET updated_at = now()
  RETURNING id
),
default_tenant AS (
  SELECT id FROM inserted
  UNION ALL
  SELECT id FROM tenants WHERE slug = 'main'
  LIMIT 1
)
UPDATE playlists SET tenant_id = (SELECT id FROM default_tenant) WHERE tenant_id IS NULL;

WITH default_tenant AS (SELECT id FROM tenants WHERE slug = 'main' LIMIT 1)
UPDATE playlist_songs SET tenant_id = (SELECT id FROM default_tenant) WHERE tenant_id IS NULL;

WITH default_tenant AS (SELECT id FROM tenants WHERE slug = 'main' LIMIT 1)
UPDATE song_requests SET tenant_id = (SELECT id FROM default_tenant) WHERE tenant_id IS NULL;

WITH default_tenant AS (SELECT id FROM tenants WHERE slug = 'main' LIMIT 1)
UPDATE app_settings SET tenant_id = (SELECT id FROM default_tenant) WHERE tenant_id IS NULL;

WITH default_tenant AS (SELECT id FROM tenants WHERE slug = 'main' LIMIT 1)
UPDATE active_players SET tenant_id = (SELECT id FROM default_tenant) WHERE tenant_id IS NULL;

WITH default_tenant AS (SELECT id FROM tenants WHERE slug = 'main' LIMIT 1)
INSERT INTO app_settings (tenant_id, key, value, updated_at)
VALUES
  ((SELECT id FROM default_tenant), 'is_requests_enabled', 'true', now()),
  ((SELECT id FROM default_tenant), 'active_playlist_ids', '[]', now())
ON CONFLICT DO NOTHING;

COMMIT;

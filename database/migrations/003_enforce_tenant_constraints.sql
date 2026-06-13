BEGIN;

ALTER TABLE playlists ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE playlist_songs ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE song_requests ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE app_settings ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE active_players ALTER COLUMN tenant_id SET NOT NULL;

ALTER TABLE app_settings DROP CONSTRAINT IF EXISTS app_settings_key_key;
ALTER TABLE active_players DROP CONSTRAINT IF EXISTS active_players_device_id_key;

CREATE UNIQUE INDEX IF NOT EXISTS app_settings_tenant_key_idx ON app_settings (tenant_id, key);
CREATE INDEX IF NOT EXISTS playlists_tenant_default_idx ON playlists (tenant_id, is_default);
CREATE INDEX IF NOT EXISTS playlists_tenant_created_idx ON playlists (tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS playlist_songs_tenant_playlist_position_idx ON playlist_songs (tenant_id, playlist_id, position);
CREATE INDEX IF NOT EXISTS song_requests_tenant_status_created_idx ON song_requests (tenant_id, status, created_at);
CREATE UNIQUE INDEX IF NOT EXISTS song_requests_tenant_pending_youtube_idx ON song_requests (tenant_id, youtube_id) WHERE status = 'pending';
CREATE UNIQUE INDEX IF NOT EXISTS active_players_tenant_device_idx ON active_players (tenant_id, device_id);
CREATE INDEX IF NOT EXISTS tenant_memberships_user_idx ON tenant_memberships (user_id);

COMMIT;

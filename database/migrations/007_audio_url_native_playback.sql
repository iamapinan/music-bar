ALTER TABLE playlist_songs
  ADD COLUMN IF NOT EXISTS audio_url TEXT;

ALTER TABLE song_requests
  ADD COLUMN IF NOT EXISTS audio_url TEXT;

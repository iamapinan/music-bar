-- Migration 008: Create standalone songs table for deduplicated song metadata
--
-- Before: song metadata (youtube_id, title, thumbnail, duration, artist, audio_url)
--         was stored inline in both playlist_songs and song_requests, leading to
--         duplication when the same song existed in multiple playlists or requests.
--
-- After:  songs table holds unique song metadata keyed by youtube_id.
--         playlist_songs and song_requests reference songs.id instead.

-- 1. Create songs table
CREATE TABLE IF NOT EXISTS songs (
    id BIGSERIAL PRIMARY KEY,
    youtube_id VARCHAR(20) NOT NULL,
    title VARCHAR(500) NOT NULL,
    thumbnail VARCHAR(500),
    duration VARCHAR(20),
    artist VARCHAR(255),
    audio_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS songs_youtube_id_idx ON songs (youtube_id);
CREATE INDEX IF NOT EXISTS songs_title_idx ON songs (title);

-- 2. Migrate existing data from playlist_songs into songs
INSERT INTO songs (youtube_id, title, thumbnail, duration, artist, audio_url)
SELECT DISTINCT ON (youtube_id)
    youtube_id,
    title,
    thumbnail,
    duration,
    artist,
    audio_url
FROM playlist_songs
ORDER BY youtube_id, created_at ASC
ON CONFLICT (youtube_id) DO NOTHING;

-- 3. Migrate existing data from song_requests into songs
--    (only rows whose youtube_id wasn't already inserted above)
INSERT INTO songs (youtube_id, title, thumbnail, duration, artist, audio_url)
SELECT DISTINCT ON (youtube_id)
    youtube_id,
    title,
    thumbnail,
    duration,
    NULL AS artist,
    audio_url
FROM song_requests
ORDER BY youtube_id, created_at ASC
ON CONFLICT (youtube_id) DO NOTHING;

-- 4. Add song_id to playlist_songs
ALTER TABLE playlist_songs ADD COLUMN IF NOT EXISTS song_id BIGINT;

UPDATE playlist_songs ps
SET song_id = s.id
FROM songs s
WHERE ps.youtube_id = s.youtube_id;

ALTER TABLE playlist_songs ALTER COLUMN song_id SET NOT NULL;
ALTER TABLE playlist_songs ADD CONSTRAINT fk_playlist_songs_song
    FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS playlist_songs_song_id_idx ON playlist_songs (song_id);

-- 5. Add song_id to song_requests
ALTER TABLE song_requests ADD COLUMN IF NOT EXISTS song_id BIGINT;

UPDATE song_requests sr
SET song_id = s.id
FROM songs s
WHERE sr.youtube_id = s.youtube_id;

ALTER TABLE song_requests ALTER COLUMN song_id SET NOT NULL;
ALTER TABLE song_requests ADD CONSTRAINT fk_song_requests_song
    FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS song_requests_song_id_idx ON song_requests (song_id);

-- 6. Drop old columns from playlist_songs (metadata now lives in songs table)
ALTER TABLE playlist_songs DROP COLUMN IF EXISTS youtube_id;
ALTER TABLE playlist_songs DROP COLUMN IF EXISTS title;
ALTER TABLE playlist_songs DROP COLUMN IF EXISTS thumbnail;
ALTER TABLE playlist_songs DROP COLUMN IF EXISTS duration;
ALTER TABLE playlist_songs DROP COLUMN IF EXISTS artist;
ALTER TABLE playlist_songs DROP COLUMN IF EXISTS audio_url;

-- 7. Drop old columns from song_requests
ALTER TABLE song_requests DROP COLUMN IF EXISTS youtube_id;
ALTER TABLE song_requests DROP COLUMN IF EXISTS title;
ALTER TABLE song_requests DROP COLUMN IF EXISTS thumbnail;
ALTER TABLE song_requests DROP COLUMN IF EXISTS duration;
ALTER TABLE song_requests DROP COLUMN IF EXISTS audio_url;

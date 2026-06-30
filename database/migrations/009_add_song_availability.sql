-- Migration 009: Add is_available column to songs table
--
-- Tracks whether a song is still publicly available on YouTube.
-- When a song is deleted or made private on YouTube, this flag is set to false
-- so it can be filtered out of playlists and queries without hard-deleting the row.
-- A background job (POST /api/songs/validate-availability) syncs this flag.

ALTER TABLE songs
  ADD COLUMN IF NOT EXISTS is_available BOOLEAN NOT NULL DEFAULT true;

CREATE INDEX IF NOT EXISTS songs_availability_idx
  ON songs (is_available)
  WHERE is_available = false;

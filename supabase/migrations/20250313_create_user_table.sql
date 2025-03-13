-- Create User table for check-in functionality
CREATE TABLE IF NOT EXISTS "user" (
  id TEXT PRIMARY KEY,
  userid TEXT NOT NULL,
  lastcheckin TIMESTAMPTZ NOT NULL,
  count INTEGER NOT NULL DEFAULT 1,
  streak INTEGER NOT NULL DEFAULT 1,
  checkinhistory JSONB NOT NULL DEFAULT '[]'::JSONB
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_userid ON "user" (userid); 
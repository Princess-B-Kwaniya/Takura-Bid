-- ============================================================
-- TakuraBid — Direct Messages Table
-- Run this in the Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS direct_messages (
  dm_id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id     UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  recipient_id  UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  content       TEXT NOT NULL,
  "read"        BOOLEAN NOT NULL DEFAULT false,
  sent_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dm_sender ON direct_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_dm_recipient ON direct_messages(recipient_id);

ALTER TABLE direct_messages DISABLE ROW LEVEL SECURITY;

-- ============================================================
-- DONE! Direct messages table is ready.
-- ============================================================

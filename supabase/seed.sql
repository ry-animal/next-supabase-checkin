-- Seed data for testing
INSERT INTO "User" (id, userid, lastcheckin, count, streak, checkinhistory)
VALUES (
  '123', 
  '123', 
  NOW() - INTERVAL '2 days', 
  3, 
  2, 
  '["2024-03-10T00:00:00Z", "2024-03-11T00:00:00Z", "2024-03-12T00:00:00Z"]'::JSONB
) ON CONFLICT (id) DO NOTHING; 
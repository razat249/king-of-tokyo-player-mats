-- King of Tokyo Player Mats - Supabase Schema
-- Run this in your Supabase SQL Editor

-- Create rooms table
CREATE TABLE IF NOT EXISTS rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_code VARCHAR(4) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Create players table
CREATE TABLE IF NOT EXISTS players (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_code VARCHAR(4) NOT NULL REFERENCES rooms(room_code) ON DELETE CASCADE,
  player_id VARCHAR(100) NOT NULL,
  monster_id VARCHAR(50) NOT NULL,
  monster_name VARCHAR(50) NOT NULL,
  monster_emoji VARCHAR(10) NOT NULL,
  monster_color VARCHAR(20) NOT NULL,
  health INTEGER DEFAULT 10,
  max_health INTEGER DEFAULT 10,
  victory_points INTEGER DEFAULT 0,
  energy INTEGER DEFAULT 0,
  in_tokyo BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(room_code, player_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_players_room_code ON players(room_code);
CREATE INDEX IF NOT EXISTS idx_players_player_id ON players(player_id);

-- Enable Row Level Security
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since this is a game without auth)
CREATE POLICY "Allow all operations on rooms" ON rooms
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on players" ON players
  FOR ALL USING (true) WITH CHECK (true);

-- Enable realtime for players table
ALTER PUBLICATION supabase_realtime ADD TABLE players;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_players_updated_at
  BEFORE UPDATE ON players
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to clean up old inactive rooms (optional, for maintenance)
CREATE OR REPLACE FUNCTION cleanup_old_rooms()
RETURNS void AS $$
BEGIN
  DELETE FROM rooms 
  WHERE created_at < NOW() - INTERVAL '24 hours'
  AND is_active = false;
END;
$$ LANGUAGE plpgsql;

import { createClient } from '@supabase/supabase-js'
import { Database } from '../types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase credentials not found. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file')
}

export const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
)

// Generate a random 4-digit room code
export function generateRoomCode(): string {
  return Math.floor(1000 + Math.random() * 9000).toString()
}

// Generate a unique player ID (stored in localStorage)
export function getPlayerId(): string {
  let playerId = localStorage.getItem('kot_player_id')
  if (!playerId) {
    playerId = `player_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
    localStorage.setItem('kot_player_id', playerId)
  }
  return playerId
}

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      rooms: {
        Row: {
          id: string
          room_code: string
          created_at: string
          is_active: boolean
        }
        Insert: {
          id?: string
          room_code: string
          created_at?: string
          is_active?: boolean
        }
        Update: {
          id?: string
          room_code?: string
          created_at?: string
          is_active?: boolean
        }
        Relationships: []
      }
      players: {
        Row: {
          id: string
          room_code: string
          player_id: string
          monster_id: string
          monster_name: string
          monster_emoji: string
          monster_color: string
          health: number
          max_health: number
          victory_points: number
          energy: number
          in_tokyo: boolean
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          room_code: string
          player_id: string
          monster_id: string
          monster_name: string
          monster_emoji: string
          monster_color: string
          health?: number
          max_health?: number
          victory_points?: number
          energy?: number
          in_tokyo?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          room_code?: string
          player_id?: string
          monster_id?: string
          monster_name?: string
          monster_emoji?: string
          monster_color?: string
          health?: number
          max_health?: number
          victory_points?: number
          energy?: number
          in_tokyo?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "players_room_code_fkey"
            columns: ["room_code"]
            referencedRelation: "rooms"
            referencedColumns: ["room_code"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Room = Database['public']['Tables']['rooms']['Row']
export type RoomInsert = Database['public']['Tables']['rooms']['Insert']
export type Player = Database['public']['Tables']['players']['Row']
export type PlayerInsert = Database['public']['Tables']['players']['Insert']
export type PlayerUpdate = Database['public']['Tables']['players']['Update']

import { useState, useEffect, useCallback } from 'react'
import { supabase, generateRoomCode, getPlayerId } from '../lib/supabase'
import { PlayerState, Monster, AttackResult } from '../types'
import { Player } from '../types/database'
import { MONSTERS } from '../data/monsters'

interface UseGameReturn {
  // State
  roomCode: string | null
  players: PlayerState[]
  currentPlayer: PlayerState | null
  myPlayerId: string
  isLoading: boolean
  error: string | null
  lastAttack: AttackResult | null
  
  // Room actions
  createRoom: () => Promise<string>
  joinRoom: (code: string) => Promise<boolean>
  leaveRoom: () => Promise<void>
  
  // Player actions
  selectMonster: (monster: Monster) => Promise<void>
  updateMyStats: (updates: Partial<Pick<PlayerState, 'health' | 'victoryPoints' | 'energy' | 'inTokyo'>>) => Promise<void>
  
  // Game actions
  attack: (damage: number) => Promise<void>
  enterTokyo: () => Promise<void>
  leaveTokyo: () => Promise<void>
}

function playerRowToState(row: Player): PlayerState {
  return {
    id: row.id,
    playerId: row.player_id,
    monster: {
      id: row.monster_id,
      name: row.monster_name,
      emoji: row.monster_emoji,
      color: row.monster_color
    },
    health: row.health,
    maxHealth: row.max_health,
    victoryPoints: row.victory_points,
    energy: row.energy,
    inTokyo: row.in_tokyo
  }
}

export function useGame(): UseGameReturn {
  const [roomCode, setRoomCode] = useState<string | null>(null)
  const [players, setPlayers] = useState<PlayerState[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastAttack, setLastAttack] = useState<AttackResult | null>(null)
  
  const myPlayerId = getPlayerId()
  const currentPlayer = players.find(p => p.playerId === myPlayerId) || null

  // Fetch players for current room
  const fetchPlayers = useCallback(async (code: string) => {
    const { data, error: fetchError } = await supabase
      .from('players')
      .select('*')
      .eq('room_code', code)
      .eq('is_active', true)
      .order('created_at', { ascending: true })
    
    if (fetchError) {
      console.error('Error fetching players:', fetchError)
      return
    }
    
    if (data) {
      setPlayers(data.map(playerRowToState))
    }
  }, [])

  // Subscribe to real-time updates
  useEffect(() => {
    if (!roomCode) return

    // Initial fetch
    fetchPlayers(roomCode)

    // Subscribe to changes
    const channel = supabase
      .channel(`room:${roomCode}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'players',
          filter: `room_code=eq.${roomCode}`
        },
        (payload) => {
          console.log('Realtime update:', payload)
          
          if (payload.eventType === 'INSERT') {
            const newPlayer = playerRowToState(payload.new as Player)
            setPlayers(prev => {
              if (prev.find(p => p.id === newPlayer.id)) return prev
              return [...prev, newPlayer]
            })
          } else if (payload.eventType === 'UPDATE') {
            const updated = playerRowToState(payload.new as Player)
            setPlayers(prev => 
              prev.map(p => p.id === updated.id ? updated : p)
            )
          } else if (payload.eventType === 'DELETE') {
            const deletedId = (payload.old as Player).id
            setPlayers(prev => prev.filter(p => p.id !== deletedId))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [roomCode, fetchPlayers])

  // Create a new room
  const createRoom = useCallback(async (): Promise<string> => {
    setIsLoading(true)
    setError(null)
    
    try {
      const code = generateRoomCode()
      
      const { error: insertError } = await supabase
        .from('rooms')
        .insert({ room_code: code })
      
      if (insertError) {
        // Room code might already exist, try again
        if (insertError.code === '23505') {
          return createRoom() // Retry with new code
        }
        throw insertError
      }
      
      setRoomCode(code)
      return code
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create room'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Join an existing room
  const joinRoom = useCallback(async (code: string): Promise<boolean> => {
    setIsLoading(true)
    setError(null)
    
    try {
      const { data, error: fetchError } = await supabase
        .from('rooms')
        .select('*')
        .eq('room_code', code.toUpperCase())
        .eq('is_active', true)
        .single()
      
      if (fetchError || !data) {
        setError('Room not found')
        return false
      }
      
      setRoomCode(code.toUpperCase())
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to join room'
      setError(message)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Leave the current room
  const leaveRoom = useCallback(async () => {
    if (!roomCode || !currentPlayer) return
    
    await supabase
      .from('players')
      .update({ is_active: false })
      .eq('id', currentPlayer.id)
    
    setRoomCode(null)
    setPlayers([])
  }, [roomCode, currentPlayer])

  // Select a monster and join the game
  const selectMonster = useCallback(async (monster: Monster) => {
    if (!roomCode) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      // Check if player already exists in this room
      const { data: existing } = await supabase
        .from('players')
        .select('*')
        .eq('room_code', roomCode)
        .eq('player_id', myPlayerId)
        .single()
      
      if (existing) {
        // Update existing player
        await supabase
          .from('players')
          .update({
            monster_id: monster.id,
            monster_name: monster.name,
            monster_emoji: monster.emoji,
            monster_color: monster.color,
            health: 10,
            max_health: 10,
            victory_points: 0,
            energy: 0,
            in_tokyo: false,
            is_active: true
          })
          .eq('id', existing.id)
      } else {
        // Insert new player
        await supabase
          .from('players')
          .insert({
            room_code: roomCode,
            player_id: myPlayerId,
            monster_id: monster.id,
            monster_name: monster.name,
            monster_emoji: monster.emoji,
            monster_color: monster.color
          })
      }
      
      // Fetch updated players
      await fetchPlayers(roomCode)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to join game'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [roomCode, myPlayerId, fetchPlayers])

  // Update current player's stats
  const updateMyStats = useCallback(async (
    updates: Partial<Pick<PlayerState, 'health' | 'victoryPoints' | 'energy' | 'inTokyo'>>
  ) => {
    if (!currentPlayer) return
    
    const dbUpdates: Record<string, unknown> = {}
    if (updates.health !== undefined) dbUpdates.health = updates.health
    if (updates.victoryPoints !== undefined) dbUpdates.victory_points = updates.victoryPoints
    if (updates.energy !== undefined) dbUpdates.energy = updates.energy
    if (updates.inTokyo !== undefined) dbUpdates.in_tokyo = updates.inTokyo
    
    await supabase
      .from('players')
      .update(dbUpdates)
      .eq('id', currentPlayer.id)
  }, [currentPlayer])

  // Attack action - applies King of Tokyo rules
  const attack = useCallback(async (damage: number) => {
    if (!currentPlayer || !roomCode || damage <= 0) return
    
    const targets: string[] = []
    
    if (currentPlayer.inTokyo) {
      // In Tokyo: damage all players OUTSIDE Tokyo
      const outsidePlayers = players.filter(p => 
        !p.inTokyo && p.playerId !== myPlayerId && p.health > 0
      )
      
      for (const target of outsidePlayers) {
        const newHealth = Math.max(0, target.health - damage)
        await supabase
          .from('players')
          .update({ health: newHealth })
          .eq('id', target.id)
        targets.push(target.monster.name)
      }
    } else {
      // Outside Tokyo: damage the monster IN Tokyo
      const tokyoPlayer = players.find(p => 
        p.inTokyo && p.playerId !== myPlayerId && p.health > 0
      )
      
      if (tokyoPlayer) {
        const newHealth = Math.max(0, tokyoPlayer.health - damage)
        await supabase
          .from('players')
          .update({ health: newHealth })
          .eq('id', tokyoPlayer.id)
        targets.push(tokyoPlayer.monster.name)
      }
    }
    
    if (targets.length > 0) {
      setLastAttack({
        attacker: currentPlayer.monster.name,
        targets,
        damage,
        timestamp: Date.now()
      })
      
      // Clear attack notification after 3 seconds
      setTimeout(() => setLastAttack(null), 3000)
    }
  }, [currentPlayer, players, roomCode, myPlayerId])

  // Enter Tokyo
  const enterTokyo = useCallback(async () => {
    if (!currentPlayer) return
    
    // First, remove anyone else from Tokyo
    const tokyoPlayers = players.filter(p => p.inTokyo && p.id !== currentPlayer.id)
    for (const player of tokyoPlayers) {
      await supabase
        .from('players')
        .update({ in_tokyo: false })
        .eq('id', player.id)
    }
    
    // Now enter Tokyo and gain 1 VP
    await supabase
      .from('players')
      .update({ 
        in_tokyo: true,
        victory_points: Math.min(20, currentPlayer.victoryPoints + 1)
      })
      .eq('id', currentPlayer.id)
  }, [currentPlayer, players])

  // Leave Tokyo
  const leaveTokyo = useCallback(async () => {
    if (!currentPlayer) return
    
    await supabase
      .from('players')
      .update({ in_tokyo: false })
      .eq('id', currentPlayer.id)
  }, [currentPlayer])

  return {
    roomCode,
    players,
    currentPlayer,
    myPlayerId,
    isLoading,
    error,
    lastAttack,
    createRoom,
    joinRoom,
    leaveRoom,
    selectMonster,
    updateMyStats,
    attack,
    enterTokyo,
    leaveTokyo
  }
}

// Get available monsters (not taken in this room)
export function getAvailableMonsters(players: PlayerState[]): Monster[] {
  const takenIds = players.map(p => p.monster.id)
  return MONSTERS.filter(m => !takenIds.includes(m.id))
}

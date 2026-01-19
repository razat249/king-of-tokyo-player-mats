export interface Monster {
  id: string
  name: string
  emoji: string
  color: string
}

export interface PlayerState {
  id: string
  playerId: string
  monster: Monster
  health: number
  maxHealth: number
  victoryPoints: number
  energy: number
  inTokyo: boolean
}

export interface GameState {
  roomCode: string
  players: PlayerState[]
  currentPlayerId: string
}

// Attack result for UI feedback
export interface AttackResult {
  attacker: string
  targets: string[]
  damage: number
  timestamp: number
}

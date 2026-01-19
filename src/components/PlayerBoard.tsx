import { useState } from 'react'
import { PlayerState, AttackResult } from '../types'
import { TokyoSkyline } from './TokyoSkyline'
import { OtherPlayers } from './OtherPlayers'
import './PlayerBoard.css'

interface PlayerBoardProps {
  player: PlayerState
  allPlayers: PlayerState[]
  roomCode: string
  lastAttack: AttackResult | null
  onHealthChange: (delta: number) => void
  onVictoryPointsChange: (delta: number) => void
  onEnergyChange: (delta: number) => void
  onEnterTokyo: () => void
  onLeaveTokyo: () => void
  onAttack: (damage: number) => void
  onLeaveRoom: () => void
}

export function PlayerBoard({
  player,
  allPlayers,
  roomCode,
  lastAttack,
  onHealthChange,
  onVictoryPointsChange,
  onEnergyChange,
  onEnterTokyo,
  onLeaveTokyo,
  onAttack,
  onLeaveRoom
}: PlayerBoardProps) {
  const [attackDamage, setAttackDamage] = useState(1)
  const healthPercentage = (player.health / player.maxHealth) * 100
  const vpPercentage = (player.victoryPoints / 20) * 100
  
  // Check if there's anyone to attack
  const canAttack = player.inTokyo 
    ? allPlayers.some(p => !p.inTokyo && p.playerId !== player.playerId && p.health > 0)
    : allPlayers.some(p => p.inTokyo && p.playerId !== player.playerId && p.health > 0)

  const handleTokyoClick = () => {
    if (player.inTokyo) {
      onLeaveTokyo()
    } else {
      onEnterTokyo()
    }
  }

  const handleAttack = () => {
    onAttack(attackDamage)
  }

  const copyRoomLink = () => {
    const url = `${window.location.origin}?room=${roomCode}`
    navigator.clipboard.writeText(url)
  }

  return (
    <div 
      className="player-board"
      style={{ '--monster-color': player.monster.color } as React.CSSProperties}
    >
      {/* Header */}
      <div className="board-header">
        <button className="back-btn" onClick={onLeaveRoom} title="Leave Room">
          ✕
        </button>
        <div className="monster-badge">
          <span className="badge-emoji">{player.monster.emoji}</span>
          <span className="badge-name">{player.monster.name}</span>
        </div>
        <button className="room-code-btn" onClick={copyRoomLink} title="Copy room link">
          🔗 {roomCode}
        </button>
      </div>

      {/* Tokyo Button */}
      <button 
        className={`tokyo-button ${player.inTokyo ? 'active' : ''}`}
        onClick={handleTokyoClick}
      >
        <TokyoSkyline isActive={player.inTokyo} />
      </button>

      {/* Attack Section */}
      <div className="attack-section">
        <div className="attack-header">
          <span className="attack-icon">⚔️</span>
          <span className="attack-label">Attack</span>
          <span className="attack-hint">
            {player.inTokyo 
              ? 'Damages all outside Tokyo' 
              : 'Damages monster in Tokyo'}
          </span>
        </div>
        <div className="attack-controls">
          <div className="damage-selector">
            <button 
              className="damage-btn"
              onClick={() => setAttackDamage(d => Math.max(1, d - 1))}
              disabled={attackDamage <= 1}
            >
              −
            </button>
            <span className="damage-value">
              <span className="claw">🔱</span> {attackDamage}
            </span>
            <button 
              className="damage-btn"
              onClick={() => setAttackDamage(d => Math.min(10, d + 1))}
              disabled={attackDamage >= 10}
            >
              +
            </button>
          </div>
          <button 
            className="attack-btn"
            onClick={handleAttack}
            disabled={!canAttack}
          >
            {canAttack ? 'ATTACK!' : 'No Target'}
          </button>
        </div>
      </div>

      {/* Attack Notification */}
      {lastAttack && (
        <div className="attack-notification">
          <span className="attack-text">
            {lastAttack.attacker} dealt {lastAttack.damage} damage to {lastAttack.targets.join(', ')}!
          </span>
        </div>
      )}

      {/* Main Stats */}
      <div className="stats-container">
        {/* Health */}
        <div className="stat-card health-card">
          <div className="stat-header">
            <span className="stat-icon">❤️</span>
            <span className="stat-label">Health</span>
          </div>
          <div className="stat-value">{player.health}</div>
          <div className="stat-bar">
            <div 
              className="stat-bar-fill health-fill" 
              style={{ width: `${healthPercentage}%` }}
            />
          </div>
          <div className="stat-controls">
            <button 
              className="control-btn minus"
              onClick={() => onHealthChange(-1)}
              disabled={player.health <= 0}
            >
              −
            </button>
            <button 
              className="control-btn plus"
              onClick={() => onHealthChange(1)}
              disabled={player.health >= player.maxHealth}
            >
              +
            </button>
          </div>
        </div>

        {/* Victory Points */}
        <div className="stat-card vp-card">
          <div className="stat-header">
            <span className="stat-icon">⭐</span>
            <span className="stat-label">Victory</span>
          </div>
          <div className="stat-value">{player.victoryPoints}</div>
          <div className="stat-bar">
            <div 
              className="stat-bar-fill vp-fill" 
              style={{ width: `${vpPercentage}%` }}
            />
          </div>
          <div className="stat-controls">
            <button 
              className="control-btn minus"
              onClick={() => onVictoryPointsChange(-1)}
              disabled={player.victoryPoints <= 0}
            >
              −
            </button>
            <button 
              className="control-btn plus"
              onClick={() => onVictoryPointsChange(1)}
              disabled={player.victoryPoints >= 20}
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Energy */}
      <div className="energy-section">
        <div className="energy-header">
          <span className="energy-icon">⚡</span>
          <span className="energy-label">Energy</span>
          <span className="energy-value">{player.energy}</span>
        </div>
        <div className="energy-display">
          {Array.from({ length: Math.min(player.energy, 20) }).map((_, i) => (
            <div key={i} className="energy-cube" style={{ animationDelay: `${i * 0.05}s` }}>
              ⚡
            </div>
          ))}
          {player.energy > 20 && (
            <div className="energy-overflow">+{player.energy - 20}</div>
          )}
        </div>
        <div className="energy-controls">
          <button 
            className="control-btn minus"
            onClick={() => onEnergyChange(-1)}
            disabled={player.energy <= 0}
          >
            −
          </button>
          <button 
            className="control-btn plus"
            onClick={() => onEnergyChange(1)}
          >
            +
          </button>
        </div>
      </div>

      {/* Other Players Section */}
      <OtherPlayers 
        players={allPlayers}
        currentPlayerId={player.playerId}
      />

      {/* Win/Death Status */}
      {player.health <= 0 && (
        <div className="status-overlay death">
          <div className="status-content">
            <span className="status-emoji">💀</span>
            <span className="status-text">DEFEATED</span>
            <button className="status-btn" onClick={onLeaveRoom}>Leave Game</button>
          </div>
        </div>
      )}
      {player.victoryPoints >= 20 && player.health > 0 && (
        <div className="status-overlay victory">
          <div className="status-content">
            <span className="status-emoji">👑</span>
            <span className="status-text">VICTORY!</span>
            <button className="status-btn" onClick={onLeaveRoom}>Leave Game</button>
          </div>
        </div>
      )}
    </div>
  )
}

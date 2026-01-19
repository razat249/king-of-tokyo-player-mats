import { PlayerState } from '../types'
import './OtherPlayers.css'

interface OtherPlayersProps {
  players: PlayerState[]
  currentPlayerId: string
}

export function OtherPlayers({ players, currentPlayerId }: OtherPlayersProps) {
  const otherPlayers = players.filter(p => p.playerId !== currentPlayerId)
  
  if (otherPlayers.length === 0) {
    return (
      <div className="other-players empty">
        <p className="empty-message">Waiting for other players...</p>
        <p className="empty-hint">Share the room code to invite friends!</p>
      </div>
    )
  }

  return (
    <div className="other-players">
      <div className="section-header">
        <span className="section-icon">👥</span>
        <span className="section-title">Other Players ({otherPlayers.length})</span>
      </div>
      <div className="players-list">
        {otherPlayers.map(player => (
          <div
            key={player.id}
            className={`player-mini-card ${player.health <= 0 ? 'defeated' : ''} ${player.inTokyo ? 'in-tokyo' : ''}`}
            style={{ '--monster-color': player.monster.color } as React.CSSProperties}
          >
            <div className="mini-monster">
              {player.monster.emoji}
              {player.inTokyo && <span className="tokyo-indicator">🏙️</span>}
            </div>
            <div className="mini-stats">
              <span className="mini-name">{player.monster.name}</span>
              <div className="mini-values">
                <span className="mini-health">
                  ❤️ {player.health}
                </span>
                <span className="mini-vp">
                  ⭐ {player.victoryPoints}
                </span>
                <span className="mini-energy">
                  ⚡ {player.energy}
                </span>
              </div>
            </div>
            {player.health <= 0 && <div className="defeated-badge">💀</div>}
            {player.victoryPoints >= 20 && player.health > 0 && <div className="winner-badge">👑</div>}
          </div>
        ))}
      </div>
    </div>
  )
}

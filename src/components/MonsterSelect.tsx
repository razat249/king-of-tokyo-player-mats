import { Monster } from '../types'
import { MONSTERS } from '../data/monsters'
import './MonsterSelect.css'

interface MonsterSelectProps {
  onSelect: (monster: Monster) => void
  takenMonsterIds: string[]
  roomCode: string
  isLoading?: boolean
}

export function MonsterSelect({ onSelect, takenMonsterIds, roomCode, isLoading }: MonsterSelectProps) {
  const availableMonsters = MONSTERS.filter(m => !takenMonsterIds.includes(m.id))

  const copyRoomLink = () => {
    const url = `${window.location.origin}?room=${roomCode}`
    navigator.clipboard.writeText(url)
  }

  return (
    <div className="monster-select">
      <div className="room-info">
        <span className="room-label">Room Code</span>
        <button className="room-code" onClick={copyRoomLink}>
          {roomCode}
          <span className="copy-hint">📋</span>
        </button>
      </div>
      
      <div className="select-header">
        <h1>Choose Your Monster</h1>
        <p className="tagline">
          {takenMonsterIds.length > 0 
            ? `${takenMonsterIds.length} player${takenMonsterIds.length > 1 ? 's' : ''} joined`
            : 'Be the first to join!'
          }
        </p>
      </div>
      
      <div className="monsters-grid">
        {availableMonsters.map((monster) => (
          <button
            key={monster.id}
            className="monster-card"
            style={{ '--monster-color': monster.color } as React.CSSProperties}
            onClick={() => onSelect(monster)}
            disabled={isLoading}
          >
            <div className="monster-emoji">{monster.emoji}</div>
            <div className="monster-name">{monster.name}</div>
          </button>
        ))}
      </div>
      
      {availableMonsters.length === 0 ? (
        <p className="hint">All monsters are taken!</p>
      ) : (
        <p className="hint">Tap a monster to join the game</p>
      )}

      {takenMonsterIds.length > 0 && (
        <div className="taken-monsters">
          <span className="taken-label">In game:</span>
          {MONSTERS.filter(m => takenMonsterIds.includes(m.id)).map(m => (
            <span key={m.id} className="taken-emoji">{m.emoji}</span>
          ))}
        </div>
      )}
    </div>
  )
}

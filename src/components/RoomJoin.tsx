import { useState } from 'react'
import './RoomJoin.css'

interface RoomJoinProps {
  onCreateRoom: () => Promise<string>
  onJoinRoom: (code: string) => Promise<boolean>
  isLoading: boolean
  error: string | null
}

export function RoomJoin({ onCreateRoom, onJoinRoom, isLoading, error }: RoomJoinProps) {
  const [joinCode, setJoinCode] = useState('')
  const [mode, setMode] = useState<'menu' | 'join'>('menu')

  const handleCreate = async () => {
    await onCreateRoom()
  }

  const handleJoin = async () => {
    if (joinCode.length === 4) {
      const success = await onJoinRoom(joinCode)
      if (!success) {
        setJoinCode('')
      }
    }
  }

  const handleCodeInput = (value: string) => {
    // Only allow digits, max 4 characters
    const cleaned = value.replace(/\D/g, '').slice(0, 4)
    setJoinCode(cleaned)
  }

  if (mode === 'join') {
    return (
      <div className="room-join">
        <button className="back-link" onClick={() => setMode('menu')}>
          ← Back
        </button>
        
        <div className="join-header">
          <div className="join-icon">🔗</div>
          <h2>Join Room</h2>
          <p>Enter the 4-digit room code</p>
        </div>

        <div className="code-input-container">
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={4}
            value={joinCode}
            onChange={(e) => handleCodeInput(e.target.value)}
            placeholder="0000"
            className="code-input"
            autoFocus
          />
          <div className="code-underlines">
            {[0, 1, 2, 3].map(i => (
              <div 
                key={i} 
                className={`code-underline ${joinCode[i] ? 'filled' : ''}`}
              />
            ))}
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <button 
          className="primary-btn"
          onClick={handleJoin}
          disabled={joinCode.length !== 4 || isLoading}
        >
          {isLoading ? 'Joining...' : 'Join Game'}
        </button>
      </div>
    )
  }

  return (
    <div className="room-join">
      <div className="hero">
        <div className="hero-emoji">👹</div>
        <h1>King of Tokyo</h1>
        <p className="hero-subtitle">Player Mats</p>
      </div>

      <div className="action-buttons">
        <button 
          className="action-btn create-btn"
          onClick={handleCreate}
          disabled={isLoading}
        >
          <span className="btn-icon">🎮</span>
          <span className="btn-text">
            <span className="btn-title">Create Room</span>
            <span className="btn-desc">Start a new game session</span>
          </span>
        </button>

        <button 
          className="action-btn join-btn"
          onClick={() => setMode('join')}
          disabled={isLoading}
        >
          <span className="btn-icon">🔗</span>
          <span className="btn-text">
            <span className="btn-title">Join Room</span>
            <span className="btn-desc">Enter a room code</span>
          </span>
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <p className="footer-hint">
        Play together on the same network or share the room code!
      </p>
    </div>
  )
}

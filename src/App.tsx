import { useEffect } from 'react'
import { useGame } from './hooks/useGame'
import { RoomJoin } from './components/RoomJoin'
import { MonsterSelect } from './components/MonsterSelect'
import { PlayerBoard } from './components/PlayerBoard'

function App() {
  const {
    roomCode,
    players,
    currentPlayer,
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
  } = useGame()

  // Check URL for room code on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const roomFromUrl = params.get('room')
    if (roomFromUrl && !roomCode) {
      joinRoom(roomFromUrl)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Update URL when room code changes
  useEffect(() => {
    if (roomCode) {
      const url = new URL(window.location.href)
      url.searchParams.set('room', roomCode)
      window.history.replaceState({}, '', url.toString())
    } else {
      const url = new URL(window.location.href)
      url.searchParams.delete('room')
      window.history.replaceState({}, '', url.toString())
    }
  }, [roomCode])

  // Handle room creation
  const handleCreateRoom = async () => {
    const code = await createRoom()
    return code
  }

  // Handle room joining
  const handleJoinRoom = async (code: string) => {
    return await joinRoom(code)
  }

  // Handle leaving room
  const handleLeaveRoom = async () => {
    await leaveRoom()
  }

  // Handle monster selection
  const handleSelectMonster = async (monster: Parameters<typeof selectMonster>[0]) => {
    await selectMonster(monster)
  }

  // Handle stat updates
  const handleHealthChange = async (delta: number) => {
    if (!currentPlayer) return
    const newHealth = Math.max(0, Math.min(currentPlayer.maxHealth, currentPlayer.health + delta))
    await updateMyStats({ health: newHealth })
  }

  const handleVictoryPointsChange = async (delta: number) => {
    if (!currentPlayer) return
    const newVP = Math.max(0, Math.min(20, currentPlayer.victoryPoints + delta))
    await updateMyStats({ victoryPoints: newVP })
  }

  const handleEnergyChange = async (delta: number) => {
    if (!currentPlayer) return
    const newEnergy = Math.max(0, currentPlayer.energy + delta)
    await updateMyStats({ energy: newEnergy })
  }

  // Step 1: No room - show join/create screen
  if (!roomCode) {
    return (
      <RoomJoin
        onCreateRoom={handleCreateRoom}
        onJoinRoom={handleJoinRoom}
        isLoading={isLoading}
        error={error}
      />
    )
  }

  // Step 2: In room but no monster selected - show monster select
  if (!currentPlayer) {
    const takenMonsterIds = players.map(p => p.monster.id)
    return (
      <MonsterSelect
        onSelect={handleSelectMonster}
        takenMonsterIds={takenMonsterIds}
        roomCode={roomCode}
        isLoading={isLoading}
      />
    )
  }

  // Step 3: In game - show player board
  return (
    <PlayerBoard
      player={currentPlayer}
      allPlayers={players}
      roomCode={roomCode}
      lastAttack={lastAttack}
      onHealthChange={handleHealthChange}
      onVictoryPointsChange={handleVictoryPointsChange}
      onEnergyChange={handleEnergyChange}
      onEnterTokyo={enterTokyo}
      onLeaveTokyo={leaveTokyo}
      onAttack={attack}
      onLeaveRoom={handleLeaveRoom}
    />
  )
}

export default App

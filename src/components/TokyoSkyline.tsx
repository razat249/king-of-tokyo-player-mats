interface TokyoSkylineProps {
  isActive: boolean
}

export function TokyoSkyline({ isActive }: TokyoSkylineProps) {
  return (
    <svg 
      viewBox="0 0 120 60" 
      className="tokyo-skyline"
      style={{ width: '100%', height: '100%' }}
    >
      {/* Sky gradient */}
      <defs>
        <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={isActive ? "#ff6b35" : "#2a2a4e"} />
          <stop offset="100%" stopColor={isActive ? "#ff8c42" : "#1a1a2e"} />
        </linearGradient>
        <linearGradient id="buildingGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={isActive ? "#1a1a2e" : "#3a3a5e"} />
          <stop offset="100%" stopColor={isActive ? "#0f0f1a" : "#2a2a4e"} />
        </linearGradient>
        {isActive && (
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        )}
      </defs>
      
      {/* Background */}
      <rect width="120" height="60" fill="url(#skyGradient)" rx="8"/>
      
      {/* Tokyo Tower */}
      <g filter={isActive ? "url(#glow)" : undefined}>
        <polygon 
          points="60,8 55,45 65,45" 
          fill={isActive ? "#ff4444" : "#666"}
        />
        <rect x="57" y="45" width="6" height="10" fill={isActive ? "#ff4444" : "#666"}/>
        {/* Tower stripes */}
        <line x1="56" y1="20" x2="64" y2="20" stroke={isActive ? "#fff" : "#888"} strokeWidth="1"/>
        <line x1="55.5" y1="30" x2="64.5" y2="30" stroke={isActive ? "#fff" : "#888"} strokeWidth="1"/>
        <line x1="55" y1="40" x2="65" y2="40" stroke={isActive ? "#fff" : "#888"} strokeWidth="1"/>
      </g>
      
      {/* Buildings left side */}
      <rect x="5" y="35" width="12" height="20" fill="url(#buildingGradient)" rx="1"/>
      <rect x="8" y="38" width="2" height="3" fill={isActive ? "#ffeb3b" : "#555"}/>
      <rect x="12" y="38" width="2" height="3" fill={isActive ? "#ffeb3b" : "#555"}/>
      <rect x="8" y="44" width="2" height="3" fill={isActive ? "#ffeb3b" : "#555"}/>
      
      <rect x="20" y="28" width="10" height="27" fill="url(#buildingGradient)" rx="1"/>
      <rect x="22" y="31" width="2" height="2" fill={isActive ? "#ffeb3b" : "#555"}/>
      <rect x="26" y="31" width="2" height="2" fill={isActive ? "#ffeb3b" : "#555"}/>
      <rect x="22" y="36" width="2" height="2" fill={isActive ? "#ffeb3b" : "#555"}/>
      <rect x="26" y="36" width="2" height="2" fill={isActive ? "#ffeb3b" : "#555"}/>
      
      <rect x="33" y="40" width="8" height="15" fill="url(#buildingGradient)" rx="1"/>
      <rect x="35" y="43" width="4" height="3" fill={isActive ? "#4fc3f7" : "#555"}/>
      
      {/* Buildings right side */}
      <rect x="78" y="32" width="10" height="23" fill="url(#buildingGradient)" rx="1"/>
      <rect x="80" y="35" width="2" height="2" fill={isActive ? "#ffeb3b" : "#555"}/>
      <rect x="84" y="35" width="2" height="2" fill={isActive ? "#ffeb3b" : "#555"}/>
      <rect x="80" y="40" width="2" height="2" fill={isActive ? "#ffeb3b" : "#555"}/>
      <rect x="84" y="40" width="2" height="2" fill={isActive ? "#ffeb3b" : "#555"}/>
      
      <rect x="92" y="38" width="14" height="17" fill="url(#buildingGradient)" rx="1"/>
      <rect x="94" y="41" width="3" height="3" fill={isActive ? "#4fc3f7" : "#555"}/>
      <rect x="100" y="41" width="3" height="3" fill={isActive ? "#4fc3f7" : "#555"}/>
      <rect x="94" y="47" width="3" height="3" fill={isActive ? "#ffeb3b" : "#555"}/>
      
      <rect x="108" y="42" width="8" height="13" fill="url(#buildingGradient)" rx="1"/>
      
      {/* Ground */}
      <rect x="0" y="55" width="120" height="5" fill={isActive ? "#1a1a2e" : "#222"} rx="0 0 8 8"/>
      
      {/* Stars/lights in sky when active */}
      {isActive && (
        <>
          <circle cx="15" cy="12" r="1" fill="#fff" opacity="0.8">
            <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2s" repeatCount="indefinite"/>
          </circle>
          <circle cx="100" cy="15" r="1" fill="#fff" opacity="0.6">
            <animate attributeName="opacity" values="0.6;0.2;0.6" dur="1.5s" repeatCount="indefinite"/>
          </circle>
          <circle cx="45" cy="18" r="0.8" fill="#fff" opacity="0.7">
            <animate attributeName="opacity" values="0.7;0.3;0.7" dur="1.8s" repeatCount="indefinite"/>
          </circle>
        </>
      )}
      
      {/* Text */}
      <text 
        x="60" 
        y="58" 
        textAnchor="middle" 
        fill={isActive ? "#fff" : "#888"}
        fontSize="6"
        fontWeight="bold"
        fontFamily="sans-serif"
      >
        {isActive ? "IN TOKYO" : "TOKYO"}
      </text>
    </svg>
  )
}

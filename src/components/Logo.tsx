import React from 'react';

export const Logo = ({ size = "md" }: { size?: "sm" | "md" | "lg" }) => {
  const dimensions = {
    sm: "w-12 h-12",
    md: "w-20 h-20",
    lg: "w-24 h-24"
  };
  
  return (
    <div className={`${dimensions[size]} relative group`}>
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg" xmlns="http://www.w3.org/2000/svg">
        {/* Sun/Circle */}
        <circle cx="50" cy="50" r="48" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1" />
        
        {/* Mountains (Red Sea Hills) */}
        <path d="M10 70 L30 40 L50 60 L70 30 L90 70 Z" fill="#92400e" className="opacity-80" />
        
        {/* Red Sea Waves */}
        <path d="M10 75 Q30 65 50 75 T90 75 L90 90 L10 90 Z" fill="#2563eb" />
        
        {/* Stylized Khalal (3-pronged comb) */}
        <g transform="translate(40, 45) scale(0.2)">
          <rect x="0" y="0" width="10" height="100" rx="5" fill="#4b5563" />
          <rect x="40" y="0" width="10" height="100" rx="5" fill="#4b5563" />
          <rect x="80" y="0" width="10" height="100" rx="5" fill="#4b5563" />
          <rect x="0" y="0" width="90" height="20" rx="10" fill="#4b5563" />
        </g>
        
        {/* Port/Anchor Hint */}
        <circle cx="50" cy="85" r="3" fill="white" />
      </svg>
    </div>
  );
};

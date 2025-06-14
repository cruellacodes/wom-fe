/* eslint-disable react/prop-types */
/* eslint-disable react/display-name */
import React, { useMemo } from "react";

// Matching the aesthetic colors from your original design
const podiumColors = ["#00D4AA", "#14F195", "#9945FF"];

const Podium = React.memo(({ tokens = [] }) => {
  const topTokens = useMemo(() => {
    return [...tokens]
      .sort((a, b) => b.tweetVolume - a.tweetVolume)
      .slice(0, 3);
  }, [tokens]);

  // Create custom polar chart segments with gradient effect
  const createPolarSegments = (values, labels) => {
    if (!values.length) return [];

    const center = 90;
    const maxRadius = 60;
    const segments = [];
    
    // Find max value for scaling
    const maxValue = Math.max(...values);
    
    values.forEach((value, index) => {
      const angle = (index * 360) / values.length;
      const radius = (value / maxValue) * maxRadius;
      
      // Calculate sector path
      const startAngle = angle - (360 / values.length) / 2;
      const endAngle = angle + (360 / values.length) / 2;
      
      const startAngleRad = (startAngle * Math.PI) / 180;
      const endAngleRad = (endAngle * Math.PI) / 180;
      
      const x1 = center + radius * Math.cos(startAngleRad);
      const y1 = center + radius * Math.sin(startAngleRad);
      const x2 = center + radius * Math.cos(endAngleRad);
      const y2 = center + radius * Math.sin(endAngleRad);
      
      const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
      
      const pathData = [
        `M ${center} ${center}`,
        `L ${x1} ${y1}`,
        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        `Z`
      ].join(' ');

      // Label position
      const labelAngle = (angle * Math.PI) / 180;
      const labelRadius = radius + 10;
      const labelX = center + labelRadius * Math.cos(labelAngle);
      const labelY = center + labelRadius * Math.sin(labelAngle);

      segments.push({
        path: pathData,
        color: podiumColors[index % podiumColors.length],
        label: labels[index],
        value: value,
        labelX,
        labelY
      });
    });

    return segments;
  };

  // Create concentric circles for grid
  const createGridCircles = () => {
    const center = 90;
    const circles = [];
    
    for (let i = 1; i <= 3; i++) {
      const radius = (i * 60) / 3;
      circles.push(
        <circle
          key={i}
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="rgba(20, 241, 149, 0.2)"
          strokeWidth="1"
        />
      );
    }
    
    return circles;
  };

  // Create radial lines
  const createRadialLines = (count) => {
    const center = 90;
    const lines = [];
    
    for (let i = 0; i < count; i++) {
      const angle = (i * 360) / count;
      const angleRad = (angle * Math.PI) / 180;
      const x = center + 60 * Math.cos(angleRad);
      const y = center + 60 * Math.sin(angleRad);
      
      lines.push(
        <line
          key={i}
          x1={center}
          y1={center}
          x2={x}
          y2={y}
          stroke="rgba(20, 241, 149, 0.2)"
          strokeWidth="1"
        />
      );
    }
    
    return lines;
  };

  const tweetVolumes = topTokens.map(token => token.tweetVolume);
  const tokenSymbols = topTokens.map(token => token.token_symbol);
  const segments = createPolarSegments(tweetVolumes, tokenSymbols);

  return (
    <div className="podium-container group">
      {/* Exact styling from your original design */}
      <div className="relative p-4 rounded-xl bg-gradient-to-br from-[#0A0F0A] via-[#0D1117] to-[#111827] 
        border border-[#14F195]/20 backdrop-blur-xl shadow-xl
        hover:border-[#14F195]/40 hover:shadow-[0_4px_20px_rgba(20,241,149,0.1)]
        transition-all duration-300 ease-out max-w-xs mx-auto w-full">
        
        {/* Header matching your style */}
        <div className="text-center mb-4">
          <h2 className="text-sm font-bold bg-gradient-to-r from-[#14F195] to-[#00D4AA] bg-clip-text text-transparent">
            Talk of the Day
          </h2>
          <p className="text-xs text-gray-400">
            Top tokens by tweet volume
          </p>
        </div>

        {topTokens.length > 0 ? (
          <div className="space-y-3">
            {/* Custom SVG Polar Chart with gradients */}
            <div className="relative flex justify-center">
              <svg width="180" height="180" className="drop-shadow-sm">
                <defs>
                  {/* Radial gradients for each segment */}
                  {segments.map((segment, index) => (
                    <radialGradient key={`gradient-${index}`} id={`gradient-podium-${index}`} cx="50%" cy="50%">
                      <stop offset="0%" style={{ stopColor: segment.color, stopOpacity: 0.7 }} />
                      <stop offset="100%" style={{ stopColor: segment.color, stopOpacity: 0.1 }} />
                    </radialGradient>
                  ))}
                </defs>
                
                {/* Grid circles */}
                {createGridCircles()}
                
                {/* Radial lines */}
                {createRadialLines(topTokens.length)}
                
                {/* Chart segments with gradient fill */}
                {segments.map((segment, index) => (
                  <g key={index}>
                    <path
                      d={segment.path}
                      fill={`url(#gradient-podium-${index})`}
                      stroke="rgba(20, 241, 149, 0.3)"
                      strokeWidth="1"
                      className="transition-opacity hover:opacity-100"
                    />
                    {/* Token labels with drop shadow */}
                    <text
                      x={segment.labelX}
                      y={segment.labelY}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="text-xs font-semibold fill-white"
                      style={{ 
                        fontSize: '10px', 
                        fontWeight: '600',
                        filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.7))'
                      }}
                    >
                      {segment.label}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          </div>
        ) : (
          // Empty state matching your style
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#14F195]/10 
              flex items-center justify-center">
              <svg className="w-8 h-8 text-[#14F195]/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-6a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-sm text-gray-400 font-medium">
              No tweet data available
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Data will appear when tokens are active
            </p>
          </div>
        )}
      </div>

      <style>{`
        .podium-container {
          animation: fadeInScale 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
          transform: scale(0.95) translateY(10px);
        }
        
        @keyframes fadeInScale {
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
});

export default Podium;
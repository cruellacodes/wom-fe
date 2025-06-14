/* eslint-disable react/prop-types */
import React, { useState, useEffect, useMemo } from "react";

// Matching the aesthetic colors from your original design
const CHART_COLORS = ["#00D4AA", "#14F195", "#9945FF", "#F97316", "#EF4444"];

// Minimal loading component
const LoadingState = () => (
  <div className="flex items-center justify-center py-8">
    <div className="w-5 h-5 border-2 border-gray-600 border-t-[#14F195] rounded-full animate-spin"></div>
  </div>
);

const PolarChart = React.memo(function PolarChart({ tokens = [] }) {
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading delay
  useEffect(() => {
    const loadTimer = setTimeout(() => {
      setIsLoading(false);
    }, 150);
    return () => clearTimeout(loadTimer);
  }, []);

  // Process token data
  const processedData = useMemo(() => {
    const validTokens = tokens
      .filter(token => token.token_symbol && typeof token.wom_score === "number")
      .sort((a, b) => b.wom_score - a.wom_score) // Sort by sentiment score instead of tweet volume
      .slice(0, 5);
    
    return {
      labels: validTokens.map(token => token.token_symbol),
      values: validTokens.map(token => token.wom_score),
      tokens: validTokens
    };
  }, [tokens]);

  // Create polar chart segments with gradient effect
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
        color: CHART_COLORS[index % CHART_COLORS.length],
        label: labels[index],
        value: Math.round(value),
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

  const segments = createPolarSegments(processedData.values, processedData.labels);
  const hasData = processedData.values.length > 0;

  return (
    <div className="polar-chart-container group">
      {/* Exact styling from your original design */}
      <div className="relative p-4 rounded-xl bg-gradient-to-br from-[#0A0F0A] via-[#0D1117] to-[#111827] 
        border border-[#14F195]/20 backdrop-blur-xl shadow-xl
        hover:border-[#14F195]/40 hover:shadow-[0_4px_20px_rgba(20,241,149,0.1)]
        transition-all duration-300 ease-out max-w-xs mx-auto w-full">
        
        {/* Header matching your style */}
        <div className="text-center mb-4">
          <h2 className="text-sm font-bold bg-gradient-to-r from-[#14F195] to-[#00D4AA] bg-clip-text text-transparent">
            WOM Sentiment
          </h2>
          <p className="text-xs text-gray-400">
            Real-time sentiment analysis
          </p>
        </div>

        {/* Content area */}
        <div className="min-h-[200px] flex flex-col items-center justify-center">
          {isLoading ? (
            <LoadingState />
          ) : hasData ? (
            <>
              {/* Custom SVG Polar Chart with gradients */}
              <div className="relative">
                <svg width="180" height="180" className="drop-shadow-sm">
                  <defs>
                    {/* Radial gradients for each segment */}
                    {segments.map((segment, index) => (
                      <radialGradient key={`gradient-${index}`} id={`gradient-${index}`} cx="50%" cy="50%">
                        <stop offset="0%" style={{ stopColor: segment.color, stopOpacity: 0.7 }} />
                        <stop offset="100%" style={{ stopColor: segment.color, stopOpacity: 0.1 }} />
                      </radialGradient>
                    ))}
                  </defs>
                  
                  {/* Grid circles */}
                  {createGridCircles()}
                  
                  {/* Radial lines */}
                  {createRadialLines(hasData ? processedData.values.length : 8)}
                  
                  {/* Chart segments with gradient fill */}
                  {segments.map((segment, index) => (
                    <g key={index}>
                      <path
                        d={segment.path}
                        fill={`url(#gradient-${index})`}
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


            </>
          ) : (
            // Empty state matching your style
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#14F195]/10 
                flex items-center justify-center">
                <svg className="w-8 h-8 text-[#14F195]/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="text-sm text-gray-400 font-medium">
                No sentiment data available
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Data will appear when tokens are analyzed
              </p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .polar-chart-container {
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

export default PolarChart;
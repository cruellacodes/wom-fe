/* eslint-disable no-unused-vars */
/* eslint-disable react/display-name */
/* eslint-disable react/prop-types */
import React, { useMemo } from "react";

const colorPalette = ["#00D4AA", "#14F195", "#9945FF", "#DC2626", "#F59E0B"];

// Utility functions to replace dayjs
const getCurrentHourUTC = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getUTCHours());
};

const subtractHours = (date, hours) => {
  return new Date(date.getTime() - hours * 60 * 60 * 1000);
};

const isDateBetween = (date, start, end) => {
  const time = date.getTime();
  return time >= start.getTime() && time < end.getTime();
};

const RadarChart = React.memo(({ tokens = [], tweets = [] }) => {
  const now = useMemo(() => getCurrentHourUTC(), []);
  const [hoveredSeries, setHoveredSeries] = React.useState(null);
  const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });

  const seriesData = useMemo(() => {
    if (!tokens.length || !tweets.length) return [];

    // Create 6 hourly buckets
    const buckets = [];
    for (let i = 6; i > 0; i--) {
      buckets.push({
        start: subtractHours(now, i),
        end: subtractHours(now, i - 1),
      });
    }

    // Sort tokens by tweet volume to match podium ordering
    const sortedTokens = [...tokens].sort((a, b) => b.tweetVolume - a.tweetVolume);

    return sortedTokens.map((token, idx) => {
      const symbol = token.token_symbol?.toLowerCase();
      const counts = Array(6).fill(0);

      tweets.forEach((tweet) => {
        if (tweet.token_symbol?.toLowerCase() !== symbol) return;

        const createdAt = new Date(tweet.created_at);
        buckets.forEach((bucket, i) => {
          if (isDateBetween(createdAt, bucket.start, bucket.end)) {
            counts[i]++;
          }
        });
      });

      // Only return tokens that have tweet activity
      if (counts.every((v) => v === 0)) return null;

      return {
        name: `${symbol}`,
        data: counts,
        color: colorPalette[idx % colorPalette.length], // Same color assignment as podium
      };
    }).filter(Boolean);
  }, [tokens, tweets, now]);

  // Create custom radar chart
  const createRadarChart = () => {
    if (!seriesData.length) return null;

    const center = 90;
    const maxRadius = 60;
    const angleStep = (2 * Math.PI) / 6; // 6 time periods
    
    // Find max value for scaling
    const maxValue = Math.max(...seriesData.flatMap(s => s.data));
    if (maxValue === 0) return null;

    // Create hexagon grid
    const gridLevels = 3;
    const gridElements = [];
    
    // Grid polygons
    for (let level = 1; level <= gridLevels; level++) {
      const radius = (level * maxRadius) / gridLevels;
      const points = [];
      
      for (let i = 0; i < 6; i++) {
        const angle = i * angleStep - Math.PI / 2; // Start from top
        const x = center + radius * Math.cos(angle);
        const y = center + radius * Math.sin(angle);
        points.push(`${x},${y}`);
      }
      
      gridElements.push(
        <polygon
          key={`grid-${level}`}
          points={points.join(' ')}
          fill="none"
          stroke="rgba(20, 241, 149, 0.2)"
          strokeWidth="1"
        />
      );
    }

    // Grid lines from center to vertices
    for (let i = 0; i < 6; i++) {
      const angle = i * angleStep - Math.PI / 2;
      const x = center + maxRadius * Math.cos(angle);
      const y = center + maxRadius * Math.sin(angle);
      
      gridElements.push(
        <line
          key={`spoke-${i}`}
          x1={center}
          y1={center}
          x2={x}
          y2={y}
          stroke="rgba(20, 241, 149, 0.2)"
          strokeWidth="1"
        />
      );
    }

    // Time labels
    const timeLabels = ["-6h", "-5h", "-4h", "-3h", "-2h", "-1h"];
    const labelElements = timeLabels.map((label, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const labelRadius = maxRadius + 15;
      const x = center + labelRadius * Math.cos(angle);
      const y = center + labelRadius * Math.sin(angle);
      
      return (
        <text
          key={`label-${i}`}
          x={x}
          y={y}
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-xs fill-gray-400"
          style={{ fontSize: '10px', fontWeight: '500' }}
        >
          {label}
        </text>
      );
    });

    // Data series
    const seriesElements = seriesData.map((series, seriesIndex) => {
      const points = [];
      
      for (let i = 0; i < 6; i++) {
        const angle = i * angleStep - Math.PI / 2;
        const value = series.data[i];
        const radius = (value / maxValue) * maxRadius;
        const x = center + radius * Math.cos(angle);
        const y = center + radius * Math.sin(angle);
        points.push(`${x},${y}`);
      }
      
      return (
        <g key={`series-${seriesIndex}`}>
          <defs>
            <radialGradient id={`radar-gradient-${seriesIndex}`} cx="50%" cy="50%">
              <stop offset="0%" style={{ stopColor: series.color, stopOpacity: 0.3 }} />
              <stop offset="100%" style={{ stopColor: series.color, stopOpacity: 0.05 }} />
            </radialGradient>
          </defs>
          <polygon
            points={points.join(' ')}
            fill={`url(#radar-gradient-${seriesIndex})`}
            stroke={series.color}
            strokeWidth="2"
            opacity="0.8"
            className="transition-opacity hover:opacity-100 cursor-pointer"
            onMouseEnter={(e) => {
              const rect = e.currentTarget.closest('svg').getBoundingClientRect();
              setHoveredSeries({
                name: series.name,
                color: series.color,
                totalTweets: series.data.reduce((sum, count) => sum + count, 0)
              });
              setMousePosition({ 
                x: e.clientX - rect.left, 
                y: e.clientY - rect.top 
              });
            }}
            onMouseMove={(e) => {
              const rect = e.currentTarget.closest('svg').getBoundingClientRect();
              setMousePosition({ 
                x: e.clientX - rect.left, 
                y: e.clientY - rect.top 
              });
            }}
            onMouseLeave={() => setHoveredSeries(null)}
          />
          {/* Data points */}
          {points.map((point, i) => {
            const [x, y] = point.split(',').map(Number);
            return (
              <circle
                key={`point-${seriesIndex}-${i}`}
                cx={x}
                cy={y}
                r="3"
                fill={series.color}
                stroke="#ffffff"
                strokeWidth="1"
              />
            );
          })}
        </g>
      );
    });

    return (
      <svg width="180" height="180" className="drop-shadow-sm">
        {gridElements}
        {labelElements}
        {seriesElements}
      </svg>
    );
  };

  return (
    <div className="radar-chart-container">
      <div className="relative p-4 rounded-xl bg-gradient-to-br from-[#0A0F0A] via-[#0D1117] to-[#111827] 
        border border-[#00D4AA]/20 backdrop-blur-xl shadow-xl
        hover:border-[#00D4AA]/40 hover:shadow-[0_4px_20px_rgba(0,212,170,0.1)]
        transition-all duration-300 ease-out max-w-xs mx-auto w-full">
        
        {/* Header */}
        <div className="text-center mb-3">
          <h2 className="text-sm font-bold bg-gradient-to-r from-[#00D4AA] to-[#14F195] bg-clip-text text-transparent">
            Tweet Pulse
          </h2>
          <p className="text-xs text-gray-400">
            Last 6 hours activity
          </p>
        </div>

        {seriesData.length > 0 ? (
          <div className="space-y-3">
            {/* Custom SVG Radar Chart */}
            <div className="relative flex justify-center">
              {createRadarChart()}
              
              {/* Tooltip */}
              {hoveredSeries && (
                <div 
                  className="absolute z-50 pointer-events-none bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 shadow-xl whitespace-nowrap"
                  style={{
                    left: Math.min(mousePosition.x + 10, 140), // Keep within bounds
                    top: Math.max(mousePosition.y - 50, 10), // Keep within bounds
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: hoveredSeries.color }}
                    />
                    <span className="text-white text-sm font-medium">
                      {hoveredSeries.name}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {hoveredSeries.totalTweets} tweets total
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#00D4AA]/10 
              flex items-center justify-center">
              <svg className="w-8 h-8 text-[#00D4AA]/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <p className="text-sm text-gray-400 font-medium">
              No activity detected
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Tweets will appear when tokens are mentioned
            </p>
          </div>
        )}
      </div>

      <style>{`
        .radar-chart-container {
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

export default RadarChart;
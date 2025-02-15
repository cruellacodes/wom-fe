import React, { useState, useRef, useEffect } from "react";
import ReactApexChart from "react-apexcharts";

// ✅ Fresh mock data with real profile images
const mockTweets = [
  {
    time: new Date().getTime() - 2 * 60 * 60 * 1000,
    followers: 12345,
    profilePic: "https://randomuser.me/api/portraits/men/10.jpg",
    text: "This token is pumping hard! 🚀"
  },
  {
    time: new Date().getTime() - 5 * 60 * 60 * 1000,
    followers: 8900,
    profilePic: "https://randomuser.me/api/portraits/women/20.jpg",
    text: "Should I buy this dip? 🤔"
  },
  {
    time: new Date().getTime() - 1 * 60 * 60 * 1000,
    followers: 15200,
    profilePic: "https://randomuser.me/api/portraits/men/30.jpg",
    text: "Huge whale just bought 100k tokens! 🔥"
  },
  {
    time: new Date().getTime() - 6 * 60 * 60 * 1000,
    followers: 6400,
    profilePic: "https://randomuser.me/api/portraits/women/40.jpg",
    text: "Token volume just spiked. 🚨"
  },
  {
    time: new Date().getTime() - 3 * 60 * 60 * 1000,
    followers: 9300,
    profilePic: "https://randomuser.me/api/portraits/men/50.jpg",
    text: "What's your price target on this?"
  }
];

const TweetScatterChart = () => {
  const chartRef = useRef(null);
  const [tooltip, setTooltip] = useState(null);
  const [imagePositions, setImagePositions] = useState([]);

  useEffect(() => {
    const updateImagePositions = () => {
      if (!chartRef.current) return;

      const chartSvg = chartRef.current.querySelector("svg");
      if (!chartSvg) return;

      const bbox = chartSvg.getBoundingClientRect();
      const markers = chartRef.current.querySelectorAll(".apexcharts-series path");

      if (markers.length === 0) return;

      const positions = [];
      markers.forEach((marker, index) => {
        if (!mockTweets[index]) return;
        const markerBox = marker.getBoundingClientRect();
        positions.push({
          x: markerBox.left - bbox.left,
          y: markerBox.top - bbox.top,
          tweet: mockTweets[index]
        });
      });

      setImagePositions(positions);
    };

    setTimeout(updateImagePositions, 500);
  }, []);

  return (
    <div ref={chartRef} className="relative p-6 rounded-xl bg-[#0A0F0A] border border-green-900/40 
      backdrop-blur-lg bg-opacity-90 shadow-[0px_0px_40px_rgba(34,197,94,0.15)]
      hover:shadow-[0px_0px_60px_rgba(34,197,94,0.3)] transition-all duration-300"
    >
      <h2 className="text-xl font-bold text-green-300 mb-4">Recent Tweets on {mockTweets[0].text.split(" ")[2]}</h2>

      {/* Render Chart */}
      <ReactApexChart
        options={{
          chart: {
            type: "scatter",
            height: 350,
            animations: { enabled: false },
            zoom: { enabled: false },
            toolbar: { show: false },
            background: "transparent"
          },
          colors: ["transparent"], // Hide default markers
          xaxis: {
            type: "datetime",
            labels: {
              datetimeUTC: false,
              style: { colors: "#22C55E", fontSize: "12px", fontFamily: "Inter, sans-serif" }
            }
          },
          yaxis: {
            title: { text: "Followers", style: { color: "#22C55E", fontSize: "14px" } },
            labels: {
              formatter: val => val.toLocaleString(),
              style: { colors: "#22C55E", fontSize: "12px", fontFamily: "Inter, sans-serif" }
            }
          },
          markers: { size: 0 }, // Remove default markers
          grid: {
            borderColor: "rgba(34, 197, 94, 0.2)",
            strokeDashArray: 4
          },
          legend: { show: false }
        }}
        series={[
          {
            name: "Tweets",
            data: mockTweets.map(tweet => [tweet.time, tweet.followers])
          }
        ]}
        type="scatter"
        height={350}
      />

      {/* ✅ Render Images at Data Points (Inside the Chart) */}
      {imagePositions.length > 0 &&
        imagePositions.map(({ x, y, tweet }, index) => (
          <div
            key={index}
            className="absolute"
            style={{
              left: x,
              top: y,
              transform: "translate(-50%, -50%)",
              width: "24px", // ✅ Smaller images for data points
              height: "24px",
              borderRadius: "50%",
              overflow: "hidden",
              border: "2px solid #22C55E",
              cursor: "pointer"
            }}
            onMouseEnter={e =>
              setTooltip({
                x: x,
                y: y - 80, // Offset above image
                lineY: 350, // Align to x-axis
                text: tweet.text,
                profilePic: tweet.profilePic
              })
            }
            onMouseLeave={() => setTooltip(null)}
          >
            <img src={tweet.profilePic} width="24" height="24" style={{ borderRadius: "50%" }} />
          </div>
        ))}

      {/* ✅ Tooltip & Dashed Line */}
      {tooltip && (
        <>
          {/* Dashed Line to X-Axis */}
          <svg
            className="absolute"
            width="1"
            height={tooltip.lineY - tooltip.y}
            style={{
              left: tooltip.x + "px",
              top: tooltip.y + 20 + "px",
              zIndex: 9999,
              pointerEvents: "none"
            }}
          >
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="100%"
              stroke="rgba(255,255,255,0.5)"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
          </svg>

          {/* Tooltip Box (Rounded Corners, Dark Theme) */}
          <div
            className="absolute bg-black text-white p-2 rounded-lg border border-gray-700 shadow-lg flex items-center gap-3"
            style={{
              left: tooltip.x - 50 + "px",
              top: tooltip.y + "px",
              padding: "6px 12px",
              borderRadius: "8px", // ✅ Rounded corners
              fontSize: "12px",
              lineHeight: "1.4",
              zIndex: 99999,
              maxWidth: "220px",
              whiteSpace: "normal"
            }}
          >
            <img src={tooltip.profilePic} className="w-6 h-6 rounded-full border border-gray-500" />
            <span>{tooltip.text}</span>
          </div>
        </>
      )}
    </div>
  );
};

export default TweetScatterChart;

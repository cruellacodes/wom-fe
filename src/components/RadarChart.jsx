import React from "react";
import ReactApexChart from "react-apexcharts";

const RadarChart = ({ tokens }) => {
  if (!tokens || tokens.length === 0) return null;

  const categories = ["Hour -6", "Hour -5", "Hour -4", "Hour -3", "Hour -2", "Hour -1"];

  // Mock data for last 6-hour volume (Replace with real data)
  const chartSeries = tokens.map((token) => ({
    name: token.Token,
    data: [
      token.VolumeLast6h[0],
      token.VolumeLast6h[1],
      token.VolumeLast6h[2],
      token.VolumeLast6h[3],
      token.VolumeLast6h[4],
      token.VolumeLast6h[5],
    ],
  }));

  const chartOptions = {
    chart: { type: "radar", background: "transparent" },
    title: { text: "Top 3 Tokens - Volume in Last 6H", style: { color: "#22C55E" } },
    xaxis: { categories, labels: { style: { colors: "#22C55E", fontSize: "12px" } } },
    yaxis: { labels: { style: { colors: "#22C55E", fontSize: "12px" } } },
    stroke: { width: 2 },
    fill: { opacity: 0.2 },
    markers: { size: 4 },
    legend: { labels: { colors: "#22C55E" } },
    colors: ["#8A2BE2", "#22C55E", "#FFA500"], // Neon Purple, Green, Orange
  };

  return (
    <div className="w-full p-6 bg-[#050A0A] border border-green-800/40 rounded-lg shadow-lg">
      <h2 className="text-lg font-semibold text-green-300 uppercase tracking-wide mb-4">
        Top 3 Tokens - Volume (Last 6H)
      </h2>
      <ReactApexChart options={chartOptions} series={chartSeries} type="radar" height={350} />
    </div>
  );
};

export default RadarChart;

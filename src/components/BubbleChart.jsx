import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { ArrowPathIcon } from "@heroicons/react/24/solid";

// Helper function to generate bubble sizes within a controlled range
const generateBubbleSize = () => Math.floor(Math.random() * (60 - 10 + 1)) + 10; // Between 10 and 60

// Placeholder function to simulate backend fetching (replace with real API call)
const fetchBubbleChartData = async () => {
  return [
    { Token: "WOM", Tweet: "This token is mooning 🚀", WomScore: 1.8, Time: "2024-02-13T14:30:00Z" },
    { Token: "ETH", Tweet: "Massive whale just bought in! 🐳", WomScore: 1.2, Time: "2024-02-13T16:45:00Z" },
    { Token: "BTC", Tweet: "Bitcoin dominance rising again ⚡", WomScore: 0.9, Time: "2024-02-13T18:00:00Z" },
    { Token: "WOM", Tweet: "This is the next big thing! 🔥", WomScore: 2.0, Time: "2024-02-13T19:15:00Z" }
  ];
};

const BubbleChart = () => {
  const [bubbleData, setBubbleData] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const data = await fetchBubbleChartData();
    setBubbleData(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // ✅ Adjusted bubble sizes similar to working example
  const chartSeries = [
    {
      name: "Tweets",
      data: bubbleData.map(tweet => ({
        x: new Date(tweet.Time).getTime(), // Convert Time to Timestamp
        y: tweet.WomScore,
        z: generateBubbleSize(), // ✅ Random bubble size between 10-60
        text: tweet.Tweet
      }))
    }
  ];

  const chartOptions = {
    chart: {
      type: "bubble",
      zoom: { enabled: false },
      background: "transparent"
    },
    xaxis: {
      type: "datetime",
      tickAmount: 12,
      labels: { style: { colors: "#22C55E", fontSize: "12px" } }
    },
    yaxis: {
      max: 2,
      labels: { style: { colors: "#22C55E", fontSize: "12px" } },
      title: { text: "WOM Score", style: { color: "#22C55E" } }
    },
    tooltip: {
      custom: ({ seriesIndex, dataPointIndex }) => {
        const tweet = bubbleData[dataPointIndex];
        return `
          <div style="padding:8px; background:#050A0A; border-radius:6px; color:white; font-size:12px;">
            <strong>${tweet.Token}</strong>
            <p style="margin-top: 4px; font-size: 12px;">${tweet.Tweet}</p>
            <span style="font-size: 10px;">WOM Score: ${tweet.WomScore.toFixed(2)}</span>
          </div>
        `;
      }
    },
    colors: ["#8A2BE2"], // Neon Purple for bubbles
    dataLabels: { enabled: false },
    fill: {
      opacity: 0.8
    }
  };

  return (
    <div className="mt-6">
      <h2 className="text-lg font-semibold text-green-300 uppercase tracking-wide mb-4">
        Tweet WOM Score (Last 24H)
      </h2>

      {/* Refresh Button */}
      <button
        onClick={loadData}
        disabled={loading}
        className="flex items-center gap-2 px-6 py-2 rounded-lg bg-green-900/20 shadow-lg hover:bg-green-800/40 transition duration-300 hover:scale-105 active:scale-95 mb-6"
      >
        <ArrowPathIcon className={`h-5 w-5 ${loading ? "animate-spin" : ""} text-green-300`} />
        <span className="text-sm font-semibold text-green-300">{loading ? "Refreshing..." : "Refresh"}</span>
      </button>

      {/* ✅ Bubble Chart */}
      <ReactApexChart options={chartOptions} series={chartSeries} type="bubble" height={350} />
    </div>
  );
};

export default BubbleChart;

import React, { useState, useEffect } from "react";
import ReactApexChart from "react-apexcharts";

// A simple Tailwind CSS spinner
const Loader = () => (
  <div className="flex justify-center items-center py-6">
    <div className="w-5 h-5 border-2 border-green-300 border-t-transparent animate-spin rounded-full" />
    <span className="ml-2 text-sm text-green-300">Loading tweet volume...</span>
  </div>
);

const RadarChart = ({ tokens }) => {
  const [seriesData, setSeriesData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  const categories = ["Hour -6", "Hour -5", "Hour -4", "Hour -3", "Hour -2", "Hour -1"];
  const colorPalette = [
    "#8A2BE2", "#FFD700", "#00BFFF", "#FF69B4", "#7FFF00", "#FF4500", "#00CED1"
  ];

  useEffect(() => {
    if (!tokens || tokens.length === 0) return;
    setLoading(true);
    setHasError(false);

    Promise.all(
      tokens.map((token, index) =>
        fetch(`${import.meta.env.VITE_BACKEND_URL}/tweet-volume/?token_symbol=${encodeURIComponent(token.token_symbol)}`)
          .then(res => {
            if (!res.ok) throw new Error(`Error fetching volume for ${token.token_symbol}`);
            return res.json();
          })
          .then(data => {
            const volumeObj = data.tweet_volume || {};
            const volume = categories.map(cat => volumeObj[cat] ?? 0);

            // Skip completely empty series (optional)
            if (volume.every(v => v === 0)) return null;

            return {
              name: token.token_symbol,
              data: volume,
              color: colorPalette[index % colorPalette.length]
            };
          })
          .catch(err => {
            console.error(err);
            return null;
          })
      )
    )
      .then(results => {
        const filtered = results.filter(r => r !== null);
        setSeriesData(filtered);
        setHasError(filtered.length === 0);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching tweet volumes:", err);
        setHasError(true);
        setLoading(false);
      });
  }, [tokens]);

  const chartOptions = {
    chart: {
      type: "radar",
      background: "transparent",
      toolbar: { show: false },
    },
    plotOptions: {
      radar: {
        size: 90,
        polygons: {
          strokeColors: "rgba(255,255,255,0.3)",
          fill: {
            colors: ["rgba(255,255,255,0.05)", "transparent"],
          },
        },
      },
    },
    xaxis: {
      categories,
      labels: {
        style: { fontSize: "11px", colors: "#FFFFFF" },
      },
    },
    yaxis: {
      labels: { style: { colors: "#ffffff", fontSize: "10px" } },
    },
    stroke: {
      width: 2,
      colors: seriesData.map(d => d.color),
    },
    fill: { opacity: 0.3 },
    markers: { size: 4 },
    legend: {
      position: "bottom",
      horizontalAlign: "center",
      floating: false,
      useSeriesColors: false,
      offsetY: 10,
      itemMargin: { top: 15 },
      labels: {
        colors: seriesData.map(d => d.color),
        fontSize: "10px",
      },
    },
    colors: seriesData.map(d => d.color),
    tooltip: {
      theme: "dark",
      style: { fontSize: "11px" },
      fillSeriesColor: false,
      marker: { show: false },
      background: "#000000",
      borderColor: "rgba(255,255,255,0.2)",
      opacity: 0.8,
    },
  };

  if (loading) return <Loader />;
  if (hasError) return <div className="text-red-400 text-sm text-center py-4">No tweet volume data available.</div>;

  return (
    <div className="p-2 rounded-md bg-[#0A0F0A] border border-green-800/40 backdrop-blur-lg 
      bg-opacity-90 shadow-md hover:shadow-lg transition-all duration-300 max-w-md mx-auto w-full h-auto">
      <h2 className="text-s font-semibold text-green-300 text-center mb-2">
        Tweet Volume (Last 6H)
      </h2>

      <div className="w-[90%] mx-auto">
        <ReactApexChart
          options={chartOptions}
          series={seriesData}
          type="radar"
          height={240}
        />
      </div>
    </div>
  );
};

export default RadarChart;

import React, { useState, useEffect } from "react";
import ReactApexChart from "react-apexcharts";

const RadarChart = ({ tokens }) => {
  const [seriesData, setSeriesData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Define categories matching the backend keys
  const categories = ["Hour -6", "Hour -5", "Hour -4", "Hour -3", "Hour -2", "Hour -1"];

  useEffect(() => {
    if (!tokens || tokens.length === 0) return;
    setLoading(true);
    Promise.all(
      tokens.map(token =>
        fetch(`http://127.0.0.1:8000/tweet-volume/?token=${token.Token}`)
          .then(res => {
            if (!res.ok) {
              throw new Error(`Error fetching volume for ${token.Token}`);
            }
            return res.json();
          })
          .then(data => {
            const volumeObj = data.tweet_volume;
            const volume = categories.map(cat => volumeObj[cat] !== undefined ? volumeObj[cat] : 0);
            return { name: token.Token, data: volume };
          })
          .catch(err => {
            console.error(err);
            return null;
          })
      )
    )
      .then(results => {
        const validResults = results.filter(r => r !== null);
        setSeriesData(validResults);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching tweet volumes:", err);
        setLoading(false);
      });
  }, [tokens]);

  const chartOptions = {
    chart: { type: "radar", background: "transparent", toolbar: { show: false } },
    xaxis: { categories, labels: { style: { colors: "#22C55E", fontSize: "12px" } } },
    yaxis: { labels: { style: { colors: "#22C55E", fontSize: "12px" } } },
    stroke: { width: 2 },
    fill: { opacity: 0.2 },
    markers: { size: 4 },
    legend: { labels: { colors: "#22C55E" } },
    colors: ["#8A2BE2", "#22C55E", "#FFA500"],
  };

  if (seriesData.length === 0) return <div>No tweet volume data available.</div>;

  return (
    <div className="p-3 rounded-md bg-[#0A0F0A] border border-green-800/40 backdrop-blur-lg 
      bg-opacity-90 shadow-md hover:shadow-lg transition-all duration-300 max-w-md mx-auto"
    >
      <h2 className="text-sm font-semibold text-green-300 text-center mb-1">
        Tweet Volume (Last 6H)
      </h2>

      <div className="w-[90%] mx-auto">
        <ReactApexChart options={chartOptions} series={seriesData} type="radar" height={220} />
      </div>
    </div>
  );
};

export default RadarChart;

import React, { useState, useEffect } from "react";
import ReactApexChart from "react-apexcharts";

const RadarChart = ({ tokens }) => {
  const [seriesData, setSeriesData] = useState([]);
  const [loading, setLoading] = useState(false);

  const categories = ["Hour -6", "Hour -5", "Hour -4", "Hour -3", "Hour -2", "Hour -1"];

  useEffect(() => {
    if (!tokens || tokens.length === 0) return;
    setLoading(true);

    Promise.all(
      tokens.map(token =>
        fetch(`http://127.0.0.1:8000/tweet-volume/?token=${token.Token}`)
          .then(res => {
            if (!res.ok) throw new Error(`Error fetching volume for ${token.Token}`);
            return res.json();
          })
          .then(data => {
            const volumeObj = data.tweet_volume;
            const volume = categories.map(cat => volumeObj[cat] ?? 0);
            return { name: token.Token, data: volume };
          })
          .catch(err => {
            console.error(err);
            return null;
          })
      )
    )
      .then(results => {
        setSeriesData(results.filter(r => r !== null));
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching tweet volumes:", err);
        setLoading(false);
      });
  }, [tokens]);

  const chartOptions = {
    chart: { 
      type: "radar", 
      background: "transparent",
      width: "100%", 
      height: "100%", 
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
        style: { fontSize: "11px", colors: "#FFFFFF" } 
      } 
    },
    yaxis: { 
      labels: { style: { colors: "#ffffff", fontSize: "10px" } } 
    },
    stroke: { width: 2, colors: ["#FFFFFF"] }, 
    fill: { opacity: 0.7, colors: ["#8A2BE2", "#FFD700", "#00BFFF"] }, 
    markers: { size: 4, colors: ["#FFFFFF"] }, 
    legend: { 
      labels: { colors: ["#8A2BE2", "#FFD700", "#00BFFF"], fontSize: "10px" },  
      position: "bottom",
      horizontalAlign: "center", 
      floating: false, 
      useSeriesColors: true,
      offsetY: 10, 
      itemMargin: { top: 15 }, 
    },
    tooltip: {
      theme: "dark",
      style: { fontSize: "11px" }, 
      fillSeriesColor: false, 
      marker: { show: false },
      background: "#000000",  
      borderColor: "rgba(255,255,255,0.2)",  
      opacity: 0.8,  
    },
    colors: ["#8A2BE2", "#FFD700", "#00BFFF"], 
  };
  

  if (seriesData.length === 0) return <div>No tweet volume data available.</div>;

  return (
    <div className="p-2 rounded-md bg-[#0A0F0A] border border-green-800/40 backdrop-blur-lg 
      bg-opacity-90 shadow-md hover:shadow-lg transition-all duration-300 max-w-md mx-auto w-full h-auto"
    >
      <h2 className="text-s font-semibold text-green-300 text-center mb-0">
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

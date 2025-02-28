import React from "react";
import ReactApexChart from "react-apexcharts";

const BubbleChart = ({ tokens = [], tweets = [] }) => {  
  // Define unique colors for each token
  const tokenColors = [
    "#FFD700", "#FF5733", "#00FFFF", "#FF00FF", "#22C55E", "#FFA500", "#007BFF", "#FF1493"
  ];

  // Assign a unique color to each token
  const tokenColorMap = tokens.reduce((acc, token, index) => {
    acc[token.Token] = tokenColors[index % tokenColors.length];
    return acc;
  }, {});

  // Transform data into ApexCharts format
  const chartData = tokens.map((token) => ({
    name: token.Token,
    data: tweets
      .filter((tweet) => tweet.wom_score > 0 && tweet.token === token.Token)
      .map((tweet) => ({
        x: new Date(tweet.created_at).getTime(),
        y: tweet.wom_score,
        z: Math.max(10, Math.log1p(tweet.followers_count) * 6),
        tweetData: tweet, 
      })),
  })).filter(series => series.data.length > 0);

  const chartOptions = {
    chart: {
      type: "bubble",
      background: "transparent",
      toolbar: { show: false },
      animations: {
        enabled: true,
        easing: "easeinout",
        speed: 800,
      },
    },
    xaxis: {
      type: "datetime",
      title: { text: "Time (UTC)", style: { color: "#ffffff", fontSize: "14px" } },
      labels: { style: { colors: "#A3A3A3", fontSize: "12px" } },
      axisBorder: { color: "#333333" },
    },
    yaxis: {
      title: { text: "WOM Score", style: { color: "#ffffff", fontSize: "14px" } },
      min: 0,
      max: 2,
      tickAmount: 4,
      labels: {
        style: { colors: "#A3A3A3", fontSize: "12px" },
        formatter: (value) => value.toFixed(1),
      },
    },
    tooltip: {
      theme: "dark",
      custom: ({ series, seriesIndex, dataPointIndex, w }) => {
        const seriesData = w.config.series[seriesIndex]?.data || [];
        const dataPoint = seriesData[dataPointIndex]; 
        const tweet = dataPoint?.tweetData;

        if (!tweet) {
          console.warn("Tooltip Data Missing for Index:", dataPointIndex, seriesData);
          return `<div class="tooltip-container">No Data</div>`;
        }

        return `
          <div style="padding: 10px; background: #101417; border-radius: 8px; color: #ffffff; font-size: 12px;
          box-shadow: 0px 0px 10px rgba(34,197,94,0.3);">
            <strong style="color:#22C55E;">${tweet.user_name}</strong>
            <p style="margin-top: 6px; font-size: 10px; color: #bbb;">Followers: ${tweet.followers_count}</p>
            <p style="font-weight: bold; color: ${tokenColorMap[tweet.token]};">WOM Score: ${tweet.wom_score.toFixed(2)}</p>
          </div>
        `;
      },
    },
    fill: { opacity: 0.85 },
    stroke: { show: true, width: 1, colors: ["#ffffff"] },
    grid: {
      borderColor: "#222222",
      xaxis: { lines: { show: true } },
      yaxis: { lines: { show: true } },
      padding: { left: 10, right: 10 },
    },
    dataLabels: { enabled: false },
    colors: tokens.map((token) => tokenColorMap[token.Token]),
  };

  return (
    <div className="p-6 rounded-xl text-green-300 shadow-lg bg-gradient-to-br from-[#101417] via-[#092523] to-[#031715] 
      border border-green-800/40 backdrop-blur-md mt-8">
      
      {/* Title Section */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-green-400 uppercase tracking-wide">
          Tweet Sentiment Analysis
        </h2>
        <p className="text-xs text-gray-400 italic">
          Bubble size represents <span className="text-green-300 font-bold">followers count</span>
        </p>
      </div>

      {/* Chart Container */}
      <div className="w-full h-[500px] flex justify-center items-center">
        {chartData.length > 0 ? (
          <div className="w-full h-full">
            <ReactApexChart
              options={chartOptions}
              series={chartData}
              type="bubble"
              height="100%"
              width="100%"
            />
          </div>
        ) : (
          <p className="text-center text-gray-400">No data available.</p>
        )}
      </div>
    </div>
  );
};

export default BubbleChart;

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
        tweetData: tweet, // ✅ Store tweet object for tooltip
      })),
  })).filter(series => series.data.length > 0);

  const chartOptions = {
    chart: {
      type: "bubble",
      background: "transparent",
      toolbar: { show: false },
    },
    xaxis: {
      type: "datetime",
      title: { text: "Time (UTC)", style: { color: "#ffffff" } },
      labels: { style: { colors: "#ffffff" } },
    },
    yaxis: {
      title: { text: "WOM Score", style: { color: "#ffffff" } },
      min: 0,
      max: 2,
      tickAmount: 4,
      labels: {
        style: { colors: "#ffffff" },
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
          console.warn("❌ Tooltip Data Missing for Index:", dataPointIndex, seriesData);
          return `<div class="tooltip-container">No Data</div>`;
        }

        return `
          <div style="padding: 10px; background: #050A0A; border-radius: 6px; color: #ffffff; font-size: 12px;">
            <strong style="color:#22C55E;">${tweet.user_name}</strong>
            <p style="margin-top: 6px; font-size: 10px; color: #999;">Followers: ${tweet.followers_count}</p>
            <p style="font-weight: bold; color: ${tokenColorMap[tweet.token]};">WOM Score: ${tweet.wom_score.toFixed(2)}</p>
          </div>
        `;
      },
    },
    fill: { opacity: 0.85 },
    stroke: { show: true, width: 1, colors: ["#ffffff"] },
    dataLabels: { enabled: false },
    colors: tokens.map((token) => tokenColorMap[token.Token]),
    grid: {
      padding: { left: 10, right: 10 },
      borderColor: "transparent",
    },
  };

  return (
    <div className="p-6 rounded-xl text-green-300 shadow-lg bg-gradient-to-br from-[#050A0A] via-[#092523] to-[#031715] mt-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-green-300 uppercase tracking-wide">
          Tweet Sentiment Analysis
        </h2>
        <p className="text-xs text-gray-400 italic">
          Bubble size represents <span className="text-green-300 font-bold">followers count</span>
        </p>
      </div>

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

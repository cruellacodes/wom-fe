import React from "react";
import ReactApexChart from "react-apexcharts";

const BubbleChart = ({ tokens = [], tweets = [] }) => {
  const tokenColors = [
    "#FFD700", "#FF5733", "#00FFFF", "#FF00FF", "#22C55E", "#FFA500", "#007BFF", "#FF1493"
  ];

  const tokenColorMap = tokens.reduce((acc, token, index) => {
    acc[token.Token] = tokenColors[index % tokenColors.length];
    return acc;
  }, {});

  const now = new Date().getTime();
  const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000;

  const chartData = tokens.map((token) => ({
    name: token.Token,
    data: tweets
      .filter((tweet) => tweet.wom_score > 0 && tweet.token === token.Token && new Date(tweet.created_at).getTime() >= twentyFourHoursAgo)
      .map((tweet) => ({
        x: new Date(tweet.created_at).getTime(),
        y: parseFloat(tweet.wom_score.toFixed(1)),
        z: Math.max(10, Math.log1p(tweet.followers_count) * 6),
        tweetData: tweet,
      })),
  })).filter(series => series.data.length > 0);

  const chartOptions = {
    chart: {
      type: "bubble",
      background: "transparent",
      toolbar: { show: false },
      animations: { enabled: true, easing: "easeinout", speed: 800 },
    },
    xaxis: {
      type: "datetime",
      title: { text: "Time (UTC)", style: { color: "#ffffff", fontSize: "14px" } },
      labels: { style: { colors: "#A3A3A3", fontSize: "12px" } },
      axisBorder: { color: "#444" },
      min: twentyFourHoursAgo,
      max: now,
    },
    yaxis: {
      title: { text: "WOM Score", style: { color: "#ffffff", fontSize: "14px" } },
      min: 0,
      max: 2,
      tickAmount: 4,
      labels: { style: { colors: "#A3A3A3", fontSize: "12px" }, formatter: (value) => value.toFixed(1) },
    },
    tooltip: {
      theme: "dark",
      custom: ({ series, seriesIndex, dataPointIndex, w }) => {
        const seriesData = w.config.series[seriesIndex]?.data || [];
        const dataPoint = seriesData[dataPointIndex];
        const tweet = dataPoint?.tweetData;

        if (!tweet) return `<div class='tooltip-container'>No Data</div>`;

        return `
          <div style="padding: 10px; background: #0A0F0A; border-radius: 8px; 
          color: #ffffff; font-size: 12px;">
            <strong style="color:#22C55E;">${tweet.user_name}</strong>
            <p style="margin-top: 6px; font-size: 10px; color: #bbb;">Followers: ${tweet.followers_count}</p>
            <p style="font-weight: bold; color: ${tokenColorMap[tweet.token]};">WOM Score: ${tweet.wom_score.toFixed(1)}</p>
          </div>
        `;
      },
    },
    fill: { opacity: 0.85 },
    stroke: { show: true, width: 1, colors: ["#ffffff"] },
    grid: {
      borderColor: "#333",
      xaxis: { lines: { show: true } },
      yaxis: { lines: { show: true } },
      padding: { left: 10, right: 10 },
    },
    dataLabels: { enabled: false },
    colors: tokens.map((token) => tokenColorMap[token.Token]),
  };

  return (
    <div className="p-6 rounded-xl text-green-300 shadow-lg bg-gradient-to-br from-[#0A0F0A] to-[#031715] 
      backdrop-blur-md mt-8 transition-all duration-300">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-green-400 uppercase tracking-wide">
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
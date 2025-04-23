import React from "react";
import ReactApexChart from "react-apexcharts";

const StackedAreaChart = ({ tokens = [], tweets = [] }) => {
  const now = new Date().getTime();
  const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000;

  const chartData = tokens.map((token) => {
    const tokenSymbol = token.token_symbol?.toLowerCase() || token.Token?.toLowerCase();

    const tokenTweets = tweets.filter(
      (tweet) =>
        tweet.token_symbol === tokenSymbol &&
        new Date(tweet.created_at).getTime() >= twentyFourHoursAgo
    );

    const seriesData = tokenTweets.map((tweet) => ({
      x: new Date(tweet.created_at).getTime(),
      y: parseFloat(tweet.wom_score?.toFixed(2) || 1.0),
    }));

    return {
      name: tokenSymbol.toUpperCase(),
      data: seriesData.sort((a, b) => a.x - b.x),
    };
  }).filter(series => series.data.length > 0);

  const chartOptions = {
    chart: {
      type: "area",
      stacked: false,
      zoom: { enabled: false },
      toolbar: { show: false },
      background: "transparent",
      animations: {
        enabled: true,
        easing: "easeinout",
        speed: 700,
      },
    },
    colors: ["#22C55E", "#00E396", "#3B82F6", "#A855F7", "#F97316", "#F43F5E", "#06B6D4"],
    stroke: { curve: "smooth", width: 2 },
    dataLabels: { enabled: false },
    fill: {
      type: "gradient",
      gradient: {
        opacityFrom: 0.3,
        opacityTo: 0.8,
      },
    },
    xaxis: {
      type: "datetime",
      title: {
        text: "Time of Tweet (UTC)",
        style: { color: "#ffffff", fontSize: "14px" },
      },
      labels: {
        style: { colors: "#A3A3A3", fontSize: "12px" },
        datetimeUTC: true,
      },
      min: twentyFourHoursAgo,
      max: now,
    },
    yaxis: {
      min: 0,
      max: 2,
      tickAmount: 4,
      title: {
        text: "WOM Score",
        style: { color: "#ffffff", fontSize: "14px" },
      },
      labels: {
        style: { colors: "#A3A3A3", fontSize: "12px" },
      },
    },
    grid: {
      borderColor: "#333",
      xaxis: { lines: { show: true } },
      yaxis: { lines: { show: true } },
    },
    tooltip: {
      theme: "dark",
      x: { format: "dd MMM HH:mm" },
    },
    legend: {
      position: "top",
      horizontalAlign: "left",
      labels: {
        colors: "#22C55E",
      },
    },
  };

  return (
    <div className="p-6 rounded-xl text-green-300 shadow-lg bg-gradient-to-br from-[#0A0F0A] to-[#031715] backdrop-blur-md mt-8 transition-all duration-300">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-green-400 uppercase tracking-wide">
          Tweet Sentiment
        </h2>
        <p className="text-xs text-gray-400 italic">
          Each dot represents a tweet. The higher the dot, the more bullish the sentiment.
        </p>
      </div>
      <div className="w-full h-[500px] flex justify-center items-center">
        {chartData.length > 0 ? (
          <div className="w-full h-full">
            <ReactApexChart
              options={chartOptions}
              series={chartData}
              type="area"
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

export default StackedAreaChart;

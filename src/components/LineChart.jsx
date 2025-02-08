import React from "react";
import ReactApexChart from "react-apexcharts";

const LineChart = () => {
  const options = {
    chart: {
      type: "scatter",
      zoom: {
        enabled: true,
        type: "xy",
      },
      background: "#0A0F0A", // Matches dark theme
      toolbar: {
        show: false,
      },
    },
    xaxis: {
      type: "datetime",
      labels: {
        style: {
          colors: "#33FF00", // Green labels
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: "#33FF00", // Green labels
        },
      },
    },
    markers: {
      size: 6,
      colors: ["#00E396"], // Custom neon green marker color
      strokeColors: "#000", // Outline color for contrast
      strokeWidth: 2,
    },
    grid: {
      borderColor: "#800080", // Cyberpunk grid color
      strokeDashArray: 4, // Dashed grid
    },
    tooltip: {
      theme: "dark",
      x: {
        format: "dd MMM yyyy", // Format for time-based x-axis
      },
    },
  };

  const series = [
    {
      name: "Token Sentiment",
      data: [
        [new Date("2024-01-01").getTime(), 10],
        [new Date("2024-02-01").getTime(), 25],
        [new Date("2024-03-01").getTime(), 15],
        [new Date("2024-04-01").getTime(), 30],
        [new Date("2024-05-01").getTime(), 20],
      ],
    },
  ];

  return (
    <div className="p-6 rounded-xl bg-[#0A0F0A] border border-green-900/20 backdrop-blur-lg bg-opacity-90 shadow-[0px_0px_30px_rgba(34,197,94,0.1)]">
      <h2 className="text-lg font-semibold text-green-300 mb-4 text-center">
        Token Sentiment Analysis
      </h2>
      <ReactApexChart options={options} series={series} type="scatter" height={350} />
    </div>
  );
};

export default LineChart;

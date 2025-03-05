import React from "react";
import ReactApexChart from "react-apexcharts";

const PolarChart = ({ tokens }) => {
  // Ensure tokens is defined and has at least one element.
  const tokenLabels = tokens.map((token) => token.Token);
  const tokenSeries = tokens.map((token) => token.WomScore);

  const chartOptions = {
    chart: {
      type: "polarArea",
      background: "transparent",
      toolbar: { show: false }, // 🔥 Removes the burger menu (export options)
    },
    labels: tokenLabels,
    fill: {
      opacity: 0.85,
      colors: ["#22C55E"],
    },
    stroke: {
      colors: ["#000"],
    },
    yaxis: {
      labels: { style: { colors: "#22C55E", fontSize: "10px" } },
    },
    legend: {
      labels: { colors: "#22C55E" },
      position: "bottom",
      fontSize: "10px",
    },
    plotOptions: {
      polarArea: {
        rings: {
          strokeWidth: 1,
        },
        spokes: {
          strokeWidth: 1,
        },
      },
    },
    theme: {
      monochrome: {
        enabled: true,
        color: "#22C55E",
        shadeTo: "dark",
        shadeIntensity: 0.7,
      },
    },
  };

  return (
    <div className="p-2 rounded-md bg-[#0A0F0A] border border-green-800/40 backdrop-blur-lg 
      bg-opacity-90 shadow-md hover:shadow-lg transition-all duration-300 max-w-md mx-auto"
    >
      <h2 className="text-s font-semibold text-green-300 text-center mb-1">
        Top 5 WOM Score Tokens
      </h2>
  
      <div className="w-[90%] mx-auto">
        <ReactApexChart options={chartOptions} series={tokenSeries} type="polarArea" height={255} /> 
      </div>
    </div>
  );
};

export default PolarChart;
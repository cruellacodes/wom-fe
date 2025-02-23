import React from "react";
import ReactApexChart from "react-apexcharts";

const PolarChart = ({ tokens }) => {
  // Ensure tokens is defined and has at least one element.
  const tokenLabels = tokens.map(token => token.Token);
  const tokenSeries = tokens.map(token => token.WomScore);

  const chartOptions = {
    chart: {
      type: "polarArea",
      background: "transparent",
    },
    labels: tokenLabels,
    fill: {
      opacity: 0.9,
      colors: ["#22C55E"],
    },
    stroke: {
      colors: ["#000"],
    },
    yaxis: {
      labels: { style: { colors: "#22C55E", fontSize: "12px" } },
    },
    legend: {
      labels: { colors: "#22C55E" },
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
        shadeIntensity: 0.65,
      },
    },
  };

  return (
    <div className="w-full p-6 bg-[#050A0A] border border-green-800/40 rounded-lg shadow-lg">
      <h2 className="text-lg font-semibold text-green-300 uppercase tracking-wide mb-4">
        Top 5 WOM Score Tokens
      </h2>
      <ReactApexChart
        options={chartOptions}
        series={tokenSeries}
        type="polarArea"
        height={350}
      />
    </div>
  );
};

export default PolarChart;

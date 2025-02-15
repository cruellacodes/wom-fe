import React from "react";
import ReactApexChart from "react-apexcharts";

const PolarChart = () => {
  const chartOptions = {
    chart: {
      type: "polarArea",
      background: "transparent",
    },
    labels: ["Liquidity", "Volume", "Wom Score", "Market Cap", "Age"],
    fill: {
      opacity: 0.9,
      colors: ["#22C55E"], // Green Theme
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

  const chartSeries = [85, 70, 90, 75, 60];

  return (
    <div className="w-full p-6 bg-[#050A0A] border border-green-800/40 rounded-lg shadow-lg">
      <h2 className="text-lg font-semibold text-green-300 uppercase tracking-wide mb-4">
        Monochrome Polar Chart
      </h2>
      <ReactApexChart options={chartOptions} series={chartSeries} type="polarArea" height={350} />
    </div>
  );
};

export default PolarChart;

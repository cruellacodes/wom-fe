import React from "react";
import ReactApexChart from "react-apexcharts";

const PolarChart = ({ tokens }) => {
  // Ensure we handle missing or malformed data safely
  const filteredTokens = tokens.filter(
    (token) => token.token_symbol && typeof token.wom_score === "number"
  );

  const tokenLabels = filteredTokens.map((token) => token.token_symbol);
  const tokenSeries = filteredTokens.map((token) => token.wom_score);

  const chartOptions = {
    chart: {
      type: "polarArea",
      background: "transparent",
      toolbar: { show: false },
      animations: { enabled: true },
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
      labels: { style: { colors: "#A3A3A3", fontSize: "10px" } },
    },
    legend: {
      labels: { colors: "#22C55E" },
      position: "bottom",
      fontSize: "10px",
    },
    plotOptions: {
      polarArea: {
        rings: { strokeWidth: 1 },
        spokes: { strokeWidth: 1 },
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
    tooltip: {
      theme: "dark",
      style: { fontSize: "11px" },
    },
  };

  return (
    <div className="p-2 rounded-md bg-[#0A0F0A] border border-green-800/40 backdrop-blur-lg 
      bg-opacity-90 shadow-md hover:shadow-lg transition-all duration-300 max-w-md mx-auto"
    >
      <h2 className="text-sm font-semibold text-green-300 text-center mb-1">
        Top 5 Tokens by WOM Score
      </h2>

      {tokenSeries.length > 0 ? (
        <div className="w-[90%] mx-auto">
          <ReactApexChart
            options={chartOptions}
            series={tokenSeries}
            type="polarArea"
            height={255}
          />
        </div>
      ) : (
        <p className="text-center text-gray-400 text-sm mt-6">No data available.</p>
      )}
    </div>
  );
};

export default PolarChart;

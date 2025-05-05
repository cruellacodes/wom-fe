/* eslint-disable react/prop-types */
import React, { useMemo } from "react";
import ReactApexChart from "react-apexcharts";
import { motion } from "framer-motion";

const PolarChart = React.memo(function PolarChart({ tokens = [] }) {
  const filteredTokens = useMemo(() => {
    return tokens
      .filter((token) => token.token_symbol && typeof token.wom_score === "number")
      .sort((a, b) => b.wom_score - a.wom_score)
      .slice(0, 5);
  }, [tokens]);

  const tokenLabels = useMemo(
    () => filteredTokens.map((token) => token.token_symbol),
    [filteredTokens]
  );

  const tokenSeries = useMemo(
    () => filteredTokens.map((token) => token.wom_score),
    [filteredTokens]
  );

  const chartOptions = useMemo(
    () => ({
      chart: {
        type: "polarArea",
        background: "transparent",
        toolbar: { show: false },
        animations: { enabled: true },
      },
      labels: tokenLabels,
      fill: {
        opacity: 0.75,
        colors: Array(tokenLabels.length).fill("#22C55E"),
      },
      stroke: {
        colors: ["#000"],
      },
      yaxis: {
        labels: { style: { colors: "#A3A3A3", fontSize: "10px" } },
      },
      legend: {
        position: "bottom",
        labels: {
          colors: "#22C55E",
          useSeriesColors: false,
        },
      },
      plotOptions: {
        polarArea: {
          rings: { strokeWidth: 1 },
          spokes: { strokeWidth: 1 },
        },
      },
      tooltip: {
        theme: "dark",
        style: { fontSize: "11px" },
      },
    }),
    [tokenLabels]
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, type: "spring", bounce: 0.3 }}
      className="p-3 rounded-md bg-[#0A0F0A] border border-green-800/40 backdrop-blur-lg 
        bg-opacity-90 shadow-md hover:shadow-lg transition-all duration-300 max-w-md mx-auto w-full"
    >
      <h2 className="text-sm font-semibold text-green-300 text-center mb-1">
        Hottest WOM Scores
      </h2>
      <p className="text-center text-gray-400 text-xs italic mb-3">
        Based on latest tweet sentiment
      </p>

      {tokenSeries.length > 0 ? (
        <div className="w-[90%] mx-auto">
          <ReactApexChart
            options={chartOptions}
            series={tokenSeries}
            type="polarArea"
            height={230}
          />
        </div>
      ) : (
        <p className="text-center text-gray-400 text-sm mt-6">No data available.</p>
      )}
    </motion.div>
  );
});

export default PolarChart;

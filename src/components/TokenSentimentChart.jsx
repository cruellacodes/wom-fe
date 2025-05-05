/* eslint-disable react/prop-types */
// eslint-disable-next-line no-unused-vars
import React, { useMemo, useState } from "react";
import ApexCharts from "react-apexcharts";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";

const TIME_FILTERS = {
  "24h": 86400000,
  all: null,
};

function prepareData(tokens, tweets, since) {
  const topTokens = tokens
    .filter((t) => typeof t.wom_score === "number")
    .sort((a, b) => b.wom_score - a.wom_score)
    .slice(0, 10);

  return topTokens.map((token) => {
    const symbol = token.token_symbol?.toLowerCase();
    if (!symbol) return null;

    const filtered = tweets.filter((tweet) => {
      return (
        tweet.token_symbol?.toLowerCase() === symbol &&
        (!since || new Date(tweet.created_at).getTime() >= since)
      );
    });

    const scores = filtered
      .map((t) => parseFloat(t.wom_score))
      .filter((s) => !isNaN(s))
      .sort((a, b) => a - b);

    if (!scores.length) return null;

    const q1 = scores[Math.floor(scores.length / 4)];
    const q3 = scores[Math.floor((scores.length * 3) / 4)];
    const mid = scores[Math.floor(scores.length / 2)];
    const iqr = q3 - q1;
    const low = q1 - 1.5 * iqr;
    const high = q3 + 1.5 * iqr;

    return {
      x: symbol.toUpperCase(),
      y: [scores[0], q1, mid, q3, scores[scores.length - 1]],
      outliers: scores.filter((s) => s < low || s > high),
    };
  }).filter(Boolean);
}

const TokenSentimentChart = ({ tokens = [], tweets = [] }) => {
  const [filter, setFilter] = useState("24h");
  const since = TIME_FILTERS[filter];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const data = useMemo(() => prepareData(tokens, tweets, since), [tokens, tweets, filter]);

  const series = useMemo(() => [
    { name: "Sentiment", type: "boxPlot", data },
    {
      name: "Outliers",
      type: "scatter",
      data: data.flatMap((d) => d.outliers.map((y) => ({ x: d.x, y }))),
    },
  ].filter((s) => s.data.length > 0), [data]);

  const chartOptions = useMemo(() => ({
    chart: {
      type: "boxPlot",
      height: 320,
      background: "transparent",
      toolbar: { show: false },
    },
    plotOptions: {
      boxPlot: {
        colors: {
          upper: "#a855f7",
          lower: "#8b5cf6",
        },
        median: { strokeColor: "#fff", strokeWidth: 2 },
      },
    },
    colors: ["#e070fa", "#fde047"],
    tooltip: {
      theme: "dark",
      y: { formatter: (v) => v.toFixed(2) },
    },
    xaxis: {
      type: "category",
      title: { text: "TOKEN", style: { color: "#e0f2fe" } },
      labels: { style: { colors: "#f5f5f5" }, rotate: -45 },
    },
    yaxis: {
      min: 0,
      max: 2,
      title: { text: "SENTIMENT", style: { color: "#e0f2fe" } },
      labels: { style: { colors: "#f5f5f5" } },
    },
    grid: { borderColor: "#374151" },
    legend: { show: false },
  }), []);

  if (!data.length) {
    return (
      <div className="flex flex-col items-center justify-center h-48 rounded-xl bg-gradient-to-br from-gray-900 via-gray-950 to-black animate-pulse">
        <div className="w-10 h-10 border-4 border-dashed rounded-full border-purple-400 animate-spin" />
        <p className="mt-4 text-sm text-purple-300">Analyzing data...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      className="pt-10 px-2 sm:px-6 w-full"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl sm:text-2xl font-semibold tracking-wide uppercase text-white">
          <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
            Token Sentiment
          </span>
        </h2>
        <a
          href="https://github.com/cruellacodes/wom-fe/blob/main/src/docs/BoxPlotDoc.md"
          target="_blank"
          rel="noopener noreferrer"
          className="group"
        >
          <InformationCircleIcon className="w-6 h-6 text-gray-400 group-hover:text-blue-400 transition-colors duration-200" />
        </a>
      </div>

      <div className="flex justify-end gap-2 mb-4">
        {Object.keys(TIME_FILTERS).map((key) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-3 py-1 text-sm border rounded-md transition-all ${
              filter === key
                ? "border-green-400 text-green-300 bg-green-900/30"
                : "border-green-800 text-green-500 hover:border-green-600 hover:text-green-300"
            }`}
          >
            {key === "all" ? "All Time" : "Last 24h"}
          </button>
        ))}
      </div>

      <ApexCharts options={chartOptions} series={series} type="boxPlot" height={320} />

      <p className="mt-6 text-xs text-center text-gray-400">
        Sentiment distribution across top tokens
        {filter === "24h" ? " (past 24h)" : " (all time)"}
      </p>
    </motion.div>
  );
};

export default TokenSentimentChart;

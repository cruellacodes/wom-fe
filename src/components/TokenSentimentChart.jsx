/* eslint-disable react/prop-types */
// eslint-disable-next-line no-unused-vars
import React, { useMemo, useState } from "react";
import ApexCharts from "react-apexcharts";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";

const TIME_FILTERS = {
  "24h": 86400000,
  "12h": 43200000,
  "6h": 21600000,
};

function prepareData(tokens, tweets, since) {
  const now = Date.now();

  const tweetMap = tweets.reduce((acc, tweet) => {
    const sym = tweet.token_symbol?.toLowerCase();
    if (!sym) return acc;
    if (!acc[sym]) acc[sym] = [];
    acc[sym].push(tweet);
    return acc;
  }, {});

  const topTokens = tokens
    .filter((t) => typeof t.wom_score === "number")
    .sort((a, b) => b.wom_score - a.wom_score)
    .slice(0, 20);

  const boxPlotData = [];
  const outlierData = [];

  for (const token of topTokens) {
    const symbol = token.token_symbol?.toLowerCase();
    if (!symbol) continue;

    const tokenTweets = tweetMap[symbol]?.filter((tweet) => {
      return !since || new Date(tweet.created_at).getTime() >= now - since;
    }) || [];

    const scores = tokenTweets
      .map((t) => parseFloat(t.wom_score))
      .filter((s) => !isNaN(s))
      .sort((a, b) => a - b);

    if (scores.length < 5) continue;

    const q1 = scores[Math.floor(scores.length / 4)];
    const q3 = scores[Math.floor((scores.length * 3) / 4)];
    const median = scores[Math.floor(scores.length / 2)];
    const stats = [scores[0], q1, median, q3, scores[scores.length - 1]];

    if (stats.some((v) => isNaN(v)) || new Set(stats).size < 2) {
      console.warn("Skipping flat or invalid box plot for", symbol.toUpperCase(), stats);
      continue;
    }

    const iqr = q3 - q1;
    const low = q1 - 1.5 * iqr;
    const high = q3 + 1.5 * iqr;

    boxPlotData.push({ x: symbol.toUpperCase(), y: stats });

    outlierData.push(
      ...scores.filter((s) => s < low || s > high).map((y) => ({
        x: symbol.toUpperCase(),
        y,
      }))
    );
  }

  return { boxPlotData, outlierData };
}

const TokenSentimentChart = ({ tokens = [], tweets = [] }) => {
  const [filter, setFilter] = useState("24h");
  const since = TIME_FILTERS[filter];

  const { boxPlotData, outlierData } = useMemo(
    () => prepareData(tokens, tweets, since),
    [tokens, tweets, filter]
  );

  const hasData = boxPlotData.length > 0;

  const series = useMemo(() => [
    {
      name: "Sentiment",
      type: "boxPlot",
      data: boxPlotData,
    },
    {
      name: "Outliers",
      type: "scatter",
      data: outlierData,
    },
  ], [boxPlotData, outlierData]);

  const chartOptions = useMemo(() => ({
    chart: {
      type: "boxPlot",
      height: 360,
      background: "transparent",
      toolbar: { show: false },
      zoom: { enabled: false },
      animations: { enabled: false },
    },
    plotOptions: {
      boxPlot: {
        colors: {
          upper: "#6b21a8",  // deep purple
          lower: "#8b5cf6",  // lilac
        },
        median: {
          strokeColor: "#ffffff", 
          strokeWidth: 3,
        },
        whisker: {
          strokeColor: "#ffffff", 
          strokeWidth: 2,
        },
        barHeight: "50%",
      },
    },
    colors: ["#e070fa", "#fde047"],
    tooltip: {
      theme: "dark",
      y: {
        formatter: (v) => (typeof v === "number" ? v.toFixed(1) : v),
      },
    },
    xaxis: {
      type: "category",
      title: { text: "TOKEN", style: { color: "#e0f2fe" } },
      labels: {
        style: { colors: "#f5f5f5", fontSize: "11px" },
        rotate: -45,
        rotateAlways: true,
        trim: false,
      },
    },
    yaxis: {
      min: 0,
      tickAmount: 5,
      title: { text: "WOM SCORE", style: { color: "#e0f2fe" } },
      labels: {
        style: { colors: "#f5f5f5" },
        formatter: (val) => val.toFixed(0),
      },
    },
    grid: {
      borderColor: "#1f2937",
      strokeDashArray: 2,
      yaxis: { lines: { show: true } },
      xaxis: { lines: { show: true } },
    },
    legend: { show: false },
  }), []);

  if (!hasData) {
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
      className="pt-10 px-2 sm:px-6 w-full min-h-[500px]"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl sm:text-2xl font-semibold tracking-wide uppercase text-[#38bdf8]">
          Token Sentiment
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
            Last {key}
          </button>
        ))}
      </div>

      <ApexCharts
        key={boxPlotData.map((d) => d.x).join("-")}
        options={chartOptions}
        series={series}
        type="boxPlot"
        height={360}
      />

      <p className="mt-6 text-xs text-center text-gray-400">
        Sentiment distribution (0–100 WOM score)
        {filter === "24h" ? " (past 24h)" : filter === "12h" ? " (past 12h)" : " (past 6h)"}
      </p>
    </motion.div>
  );
};

export default TokenSentimentChart;

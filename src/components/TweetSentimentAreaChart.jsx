import React, { useMemo, useState } from "react";
import ApexCharts from "react-apexcharts";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";

const DAY_MS = 86400000;

function prepareData(tokens, tweets, filter) {
  const since = Date.now() - DAY_MS;

  const topTokens = [...tokens]
    .filter((t) => typeof t.wom_score === "number")
    .sort((a, b) => b.wom_score - a.wom_score)
    .slice(0, 20);

  return topTokens
    .map((tk) => {
      const symbol = (tk.token_symbol || tk.Token || "").toLowerCase();
      if (!symbol) return null;

      const scores = tweets
        .filter((t) => {
          const validTime = filter === "24h"
            ? new Date(t.created_at).getTime() >= since
            : true;
          return t.token_symbol === symbol && validTime;
        })
        .map((t) => +parseFloat(t.wom_score ?? 1).toFixed(2))
        .sort((a, b) => a - b);

      if (!scores.length) return null;

      const mid = Math.floor(scores.length / 2);
      const q1 = scores[Math.floor(scores.length / 4)];
      const q3 = scores[Math.floor((scores.length * 3) / 4)];
      const iqr = q3 - q1;
      const lo = q1 - 1.5 * iqr;
      const hi = q3 + 1.5 * iqr;

      return {
        x: symbol.toUpperCase(),
        y: [scores[0], q1, scores[mid], q3, scores.at(-1)],
        outliers: scores.filter((v) => v < lo || v > hi),
      };
    })
    .filter(Boolean);
}

const StackedAreaChart = ({ tokens = [], tweets = [] }) => {
  const [filter, setFilter] = useState("24h");
  const data = useMemo(() => prepareData(tokens, tweets, filter), [tokens, tweets, filter]);

  if (!data.length) {
    return (
      <div className="flex flex-col items-center justify-center h-48 rounded-xl bg-gradient-to-br from-gray-900 via-gray-950 to-black animate-pulse">
        <div className="w-10 h-10 border-4 border-dashed rounded-full border-purple-400 animate-spin" />
        <p className="mt-4 text-sm text-purple-300">Analyzing data...</p>
      </div>
    );
  }

  const series = [
    { name: "Sentiment", type: "boxPlot", data },
    {
      name: "Outliers",
      type: "scatter",
      data: data.flatMap((d) => d.outliers.map((y) => ({ x: d.x, y }))),
    },
  ].filter((s) => s.data.length);

  const options = {
    chart: {
      type: "boxPlot",
      height: 320,
      background: "transparent",
      toolbar: { show: false },
      dropShadow: {
        enabled: true,
        top: 3,
        left: 0,
        blur: 10,
        opacity: 0.15,
      },
      animations: {
        enabled: true,
        speed: 800,
        easing: "easeOutQuad",
      },
    },
    plotOptions: {
      boxPlot: {
        colors: {
          upper: "#a855f7",
          lower: "#8b5cf6",
        },
        lineWidth: 2,
        medianStroke: "#fff",
        boxShadow: {
          enabled: true,
          color: "rgba(107, 114, 128, 0.1)",
          blur: 8,
          offsetY: 2,
          opacity: 1,
        },
      },
    },
    colors: ["#e070fa", "#fde047"],
    stroke: {
      width: 1,
      curve: "smooth",
      colors: ["#f9fafb"],
    },
    grid: {
      borderColor: "#374151",
      yaxis: {
        lines: {
          show: true,
          color: "#4a5568",
        },
      },
      xaxis: {
        lines: {
          show: false,
        },
      },
    },
    tooltip: {
      theme: "dark",
      style: {
        fontSize: "12px",
        fontFamily:
          'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Courier New", monospace',
      },
      y: {
        formatter: (v) => v.toFixed(2),
      },
      x: {
        title: {
          formatter: (v) => `Token: ${v}`,
        },
      },
    },
    xaxis: {
      type: "category",
      title: {
        text: "TOKEN",
        style: {
          color: "#e0f2fe",
          fontWeight: 500,
          fontSize: "14px",
          fontFamily:
            'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Courier New", monospace',
          textTransform: "uppercase",
        },
      },
      labels: {
        style: {
          colors: "#f5f5f5",
          fontSize: "12px",
          fontFamily:
            'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Courier New", monospace',
        },
        rotation: -45,
        rotateAlways: true,
        offsetY: 12,
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      min: 0,
      max: 2,
      tickAmount: 4,
      title: {
        text: "SENTIMENT",
        style: {
          color: "#e0f2fe",
          fontWeight: 500,
          fontSize: "14px",
          fontFamily:
            'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Courier New", monospace',
          textTransform: "uppercase",
        },
      },
      labels: {
        style: {
          colors: "#f5f5f5",
          fontSize: "12px",
          fontFamily:
            'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Courier New", monospace',
        },
      },
    },
    legend: {
      show: false,
    },
    markers: {
      size: 7,
      colors: ["#fef08a"],
      strokeColors: "transparent",
      strokeWidth: 0,
      hover: {
        sizeOffset: 3,
        fillColor: "#fff",
        strokeColor: "#fef08a",
        strokeWidth: 1.5,
      },
    },
    states: {
      hover: {
        filter: {
          type: "none",
        },
      },
    },
  };

  const containerClassName = "pt-10 px-2 sm:px-6 w-full";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className={containerClassName}
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
        {["24h", "all"].map((val) => (
          <button
            key={val}
            onClick={() => setFilter(val)}
            className={`px-3 py-1 text-sm border rounded-md transition-all
              ${filter === val
                ? "border-green-400 text-green-300 bg-green-900/30"
                : "border-green-800 text-green-500 hover:border-green-600 hover:text-green-300"}`}
          >
            {val === "all" ? "All Time" : "Last 24h"}
          </button>
        ))}
      </div>

      <div className="w-full">
        <div id="chart">
          <ApexCharts options={options} series={series} type="boxPlot" height={320} />
        </div>
      </div>

      <p className="mt-6 text-xs text-center text-gray-400">
        Sentiment distribution across top 20 tokens
        {filter === "24h" ? " (past 24h)" : " (all time)"}
      </p>
    </motion.div>
  );
};

export default StackedAreaChart;

import React, { useMemo } from "react";
import ReactApexChart from "react-apexcharts";
import { InformationCircleIcon } from "@heroicons/react/24/outline";

const DAY_MS = 86400000;

/* helper: prepare data */
function prepareData(tokens, tweets) {
  const since = Date.now() - DAY_MS;

  return tokens
    .map((tk) => {
      const symbol = (tk.token_symbol || tk.Token || "").toLowerCase();
      if (!symbol) return null;

      const scores = tweets
        .filter(
          (t) =>
            t.token_symbol === symbol &&
            new Date(t.created_at).getTime() >= since
        )
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

const StaackedAreaChart = ({ tokens = [], tweets = [] }) => {
  const data = useMemo(() => prepareData(tokens, tweets), [tokens, tweets]);

  if (!data.length) {
    return (
      <div className="flex flex-col items-center justify-center h-48 rounded-xl bg-[#0A0F0A]">
        <div className="w-8 h-8 border-4 border-dashed rounded-full border-purple-500 animate-spin" />
        <p className="mt-3 text-xs text-purple-300 animate-pulse">Loading data...</p>
      </div>
    );
  }

  const series = [
    { name: "Distribution", type: "boxPlot", data },
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
      animations: { enabled: true, speed: 700, easing: 'easeInOut' },
    },
    plotOptions: {
      boxPlot: {
        colors: {
          upper: "#9d4edd",
          lower: "#3b82f6",
        },
        lineWidth: 2,
      },
    },
    colors: ["#9d4edd", "#ffdb58"],
    stroke: {
      width: 1,
      curve: 'smooth',
      colors: ["#e0e7ff"],
    },
    grid: {
      borderColor: "#374151",
      yaxis: {
        lines: {
          show: true,
        },
      },
      xaxis: {
        lines: {
          show: false
        }
      }
    },
    tooltip: {
      theme: "dark",
      style: {
        fontSize: '12px',
        fontFamily: 'Monospace',
      },
      y: {
        formatter: (v) => v.toFixed(2),
      },
    },
    xaxis: {
      type: "category",
      title: {
        text: "TOKEN",
        style: {
          color: "#6ee7b7",
          fontWeight: 600,
          fontSize: "12px",
          fontFamily: 'Monospace',
          textTransform: "uppercase",
        },
      },
      labels: {
        style: {
          colors: "#f9fafb",
          fontSize: "12px",
          fontFamily: 'Monospace',
        },
        rotate: -45,
        rotateAlways: true,
        offsetY: 10,
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      min: 0,
      max: 2,
      tickAmount: 4,
      title: {
        text: "WOM SCORE",
        style: {
          color: "#6ee7b7",
          fontWeight: 600,
          fontSize: "12px",
          fontFamily: 'Monospace',
          textTransform: "uppercase",
        },
      },
      labels: {
        style: {
          colors: "#f9fafb",
          fontSize: "11px",
          fontFamily: 'Monospace',
        },
      },
    },
    legend: {
      show: false,
    },
    markers: {
      size: 6,
      colors: ['#fef08a'],
      strokeColors: '#3b82f6',
      strokeWidth: 0,
      hover: {
        sizeOffset: 3
      }
    }
  };

  return (
    <div className="p-6 rounded-xl bg-[#0A0F0A] border-green-800/40 backdrop-blur-lg bg-opacity-90 shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-green-400 uppercase tracking-wide">
          Tweet Sentiment
        </h2>
        <a
          href="/docs/BoxPlotDoc.md"
          target="_blank"
          rel="noopener noreferrer"
          className="text-green-400 hover:text-green-300 transition-colors"
        >
          <InformationCircleIcon className="w-6 h-6" />
        </a>
      </div>

      <div className="w-full">
        <ReactApexChart
          options={options}
          series={series}
          type="boxPlot"
          height={320}
        />
      </div>
      <p className="mt-4 text-xs text-gray-500 text-center">
        Distribution of WOM Sentiment Scores (Last 24 Hours)
      </p>
    </div>
  );
};

export default StaackedAreaChart;
/* eslint-disable react/display-name */
/* eslint-disable react/prop-types */
import React, { useMemo } from "react";
import ReactApexChart from "react-apexcharts";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import isBetween from "dayjs/plugin/isBetween";
import { motion } from "framer-motion";

dayjs.extend(utc);
dayjs.extend(isBetween);

const colorPalette = ["#8A2BE2", "#FFD700", "#00BFFF", "#7FFF00", "#FF69B4"];

const RadarChart = React.memo(({ tokens = [], tweets = [] }) => {
  const now = useMemo(() => dayjs.utc().startOf("hour"), []);

  const seriesData = useMemo(() => {
    if (!tokens.length || !tweets.length) return [];

    const buckets = [];
    for (let i = 6; i > 0; i--) {
      buckets.push({
        start: now.subtract(i, "hour"),
        end: now.subtract(i - 1, "hour"),
      });
    }

    return tokens.map((token, idx) => {
      const symbol = token.token_symbol?.toLowerCase();
      const counts = Array(6).fill(0);

      tweets.forEach((tweet) => {
        if (tweet.token_symbol?.toLowerCase() !== symbol) return;

        const createdAt = dayjs.utc(tweet.created_at);
        buckets.forEach((bucket, i) => {
          if (createdAt.isBetween(bucket.start, bucket.end, null, "[)")) {
            counts[i]++;
          }
        });
      });

      if (counts.every((v) => v === 0)) return null;

      return {
        name: `${symbol}`,
        data: counts,
        color: colorPalette[idx % colorPalette.length],
      };
    }).filter(Boolean);
  }, [tokens, tweets, now]);

  const chartOptions = useMemo(() => ({
    chart: {
      type: "radar",
      background: "transparent",
      toolbar: { show: false },
      offsetY: -10,
    },
    plotOptions: {
      radar: {
        size: 95,
        polygons: {
          strokeColors: "rgba(255,255,255,0.3)",
          fill: {
            colors: ["rgba(255,255,255,0.05)", "transparent"],
          },
        },
      },
    },
    xaxis: {
      categories: ["Hour -6", "Hour -5", "Hour -4", "Hour -3", "Hour -2", "Hour -1"],
      labels: { style: { fontSize: "11px", colors: "#FFFFFF" } },
    },
    yaxis: {
      labels: { style: { fontSize: "10px", colors: "#FFFFFF" } },
    },
    stroke: {
      width: 2,
      colors: seriesData.map((s) => s.color),
    },
    fill: { opacity: 0.3 },
    markers: { size: 4 },
    legend: {
      position: "bottom",
      horizontalAlign: "center",
      offsetY: 30,
      fontSize: "13px",
      itemMargin: { horizontal: 10, vertical: 35 },
      labels: {
        colors: "#22C55E",
        useSeriesColors: true,
      },
    },
    colors: seriesData.map((s) => s.color),
    tooltip: {
      theme: "dark",
      style: { fontSize: "11px" },
      fillSeriesColor: false,
      markers: { size: 2 },
    },
  }), [seriesData]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, type: "spring", bounce: 0.3 }}
      className="p-3 pb-6 min-h-[230px] rounded-md bg-[#0A0F0A] border border-green-800/40 backdrop-blur-lg 
      bg-opacity-90 shadow-md hover:shadow-lg transition-all duration-300 max-w-md mx-auto w-full"
    >
      <h2 className="text-sm font-semibold text-green-300 text-center mb-1">
        Tweet Pulse (Last 6H UTC)
      </h2>
      <p className="text-center text-gray-400 text-xs italic mb-3">
        Hourly tweet bursts by token
      </p>

      {seriesData.length > 0 ? (
        <div className="w-full mx-auto min-h-[230px] overflow-visible">
          <ReactApexChart
            options={chartOptions}
            series={seriesData}
            type="radar"
            height={230}
          />
        </div>
      ) : (
        <p className="text-center text-gray-400 text-sm">No tweet data available.</p>
      )}
    </motion.div>
  );
});

export default RadarChart;

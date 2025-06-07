/* eslint-disable react/prop-types */
// eslint-disable-next-line no-unused-vars
import React, { useRef, useEffect, useMemo, useState } from "react";
import * as d3 from "d3";
import Logo from "../assets/logo.png";
import { ArrowsPointingOutIcon } from "@heroicons/react/24/solid";

const TweetScatterChart = ({ searchedToken, tweets, isFetchingTweets, isAnalyzingSentiment }) => {
  const svgRef = useRef();
  const chartWrapperRef = useRef();
  const delayTimeout = useRef(null);

  const [showSentimentLoader, setShowSentimentLoader] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(0); // 0: 24h, 1: 6h, 2: 1h

  const now = useMemo(() => Date.now(), []);

  const zoomLevels = useMemo(
    () => [
      { label: "24h", range: [now - 24 * 60 * 60 * 1000, now] },
      { label: "6h", range: [now - 6 * 60 * 60 * 1000, now] },
      { label: "1h", range: [now - 1 * 60 * 60 * 1000, now] },
    ],
    [now]
  );

  const timeDomain = zoomLevels[zoomLevel].range;

  const recentTweets = useMemo(() => {
    return tweets.filter(t => new Date(t.created_at).getTime() >= timeDomain[0]);
  }, [tweets, timeDomain]);

  const chartData = useMemo(() => {
    const transform = (val) => {
      if (val <= 500) return val / 500;
      if (val <= 1000) return 1 + (val - 500) / 500;
      if (val <= 5000) return 2 + (val - 1000) / 4000;
      if (val <= 10000) return 3 + (val - 5000) / 5000;
      if (val <= 50000) return 4 + (val - 10000) / 40000;
      return 5 + (val - 50000) / 50000;
    };

    return recentTweets.map((tweet) => ({
      date: new Date(tweet.created_at),
      originalFollowers: tweet.followers_count,
      transformedFollowers: transform(Math.min(tweet.followers_count, 100000)),
      text: tweet.text,
      username: tweet.user_name,
      profilePic: tweet.profile_pic || "https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png",
      tweetUrl: `https://x.com/${tweet.user_name}/status/${tweet.tweet_id}`,
    }));
  }, [recentTweets]);

  useEffect(() => {
    if (isFetchingTweets) {
      setShowSentimentLoader(false);
      delayTimeout.current = setTimeout(() => {
        if (isAnalyzingSentiment) setShowSentimentLoader(true);
      }, 3000);
    }
    return () => clearTimeout(delayTimeout.current);
  }, [isFetchingTweets, isAnalyzingSentiment]);

  useEffect(() => {
    if (!isFetchingTweets && !isAnalyzingSentiment) setShowSentimentLoader(false);
  }, [isFetchingTweets, isAnalyzingSentiment]);

  useEffect(() => {
    if (!svgRef.current || chartData.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    d3.select("body").selectAll(".tooltip").remove();

    const width = 800;
    const height = 400;
    const margin = { top: 40, right: 20, bottom: 60, left: 60 };

    svg
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .style("width", "100%")
      .style("height", "auto");

    const defs = svg.append("defs");

    const gradient = defs.append("linearGradient")
      .attr("id", "gradient-axis")
      .attr("x1", "0%").attr("y1", "0%")
      .attr("x2", "100%").attr("y2", "0%");
    gradient.append("stop").attr("offset", "0%").attr("stop-color", "#ff6fe7");
    gradient.append("stop").attr("offset", "100%").attr("stop-color", "#00f5ff");

    svg.append("image")
      .attr("xlink:href", Logo)
      .attr("x", width / 2 - 90)
      .attr("y", height / 2 - 90)
      .attr("width", 180)
      .attr("height", 180)
      .attr("opacity", 0.04);

    const x = d3.scaleTime()
      .domain(timeDomain)
      .range([margin.left, width - margin.right]);

    const y = d3.scaleLinear().domain([0, 6]).range([height - margin.bottom, margin.top]);

    const xAxis = d3.axisBottom(x).ticks(6).tickFormat(d3.utcFormat("%H:%M"));
    const yAxis = d3.axisLeft(y).tickValues([0, 1, 2, 3, 4, 5, 6])
      .tickFormat(d => ({ 0: "0", 1: "500", 2: "1K", 3: "5K", 4: "10K", 5: "50K", 6: "100K+" }[d]));

    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(xAxis)
      .append("text")
      .attr("x", width / 2)
      .attr("y", 40)
      .attr("fill", "#aaa")
      .style("text-anchor", "middle")
      .style("font-size", "12px")
      .text("Tweet Time (UTC)");

    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(yAxis)
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -40)
      .attr("fill", "#aaa")
      .style("text-anchor", "middle")
      .style("font-size", "12px")
      .text("Follower Count");

    y.ticks(6).forEach(tick => {
      for (let i = margin.left + 5; i < width - margin.right; i += 10) {
        svg.append("circle").attr("cx", i).attr("cy", y(tick)).attr("r", 0.6).attr("fill", "url(#gradient-axis)");
      }
    });

    const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("background", "rgba(25,25,35,0.9)")
      .style("border", "1px solid #9992aa")
      .style("color", "#fff")
      .style("padding", "10px 14px")
      .style("border-radius", "8px")
      .style("font-size", "12px")
      .style("pointer-events", "none")
      .style("opacity", 0)
      .style("max-width", "240px");

    chartData.forEach((d, i) => {
      defs.append("pattern")
        .attr("id", `pattern-${i}`)
        .attr("width", 1)
        .attr("height", 1)
        .append("image")
        .attr("href", d.profilePic)
        .attr("width", 24)
        .attr("height", 24);
    });

    svg.selectAll("a.tweet-link")
      .data(chartData)
      .join("a")
      .attr("xlink:href", d => d.tweetUrl)
      .attr("target", "_blank")
      .attr("rel", "noopener noreferrer")
      .append("circle")
      .attr("cx", d => x(d.date))
      .attr("cy", height - margin.bottom)
      .attr("r", 0)
      .style("fill", (d, i) => `url(#pattern-${i})`)
      .attr("stroke", "#8884d8")
      .attr("stroke-width", 1)
      .on("mouseover", (event, d) => {
        tooltip.style("opacity", 1).html(`
          <div style="color:#ff6fe7;font-weight:bold">@${d.username}</div>
          <hr style="border-top:1px solid #555;margin:6px">
          <div>${d.text}</div>
          <div style="color:#aaa;font-style:italic;margin-top:4px">Followers: ${d.originalFollowers.toLocaleString()}</div>
        `).style("left", event.pageX + 12 + "px").style("top", event.pageY - 26 + "px");
      })
      .on("mousemove", event => tooltip.style("left", event.pageX + 12 + "px").style("top", event.pageY - 26 + "px"))
      .on("mouseout", () => tooltip.style("opacity", 0))
      .transition()
      .duration(700)
      .delay((_, i) => i * 60)
      .ease(d3.easeCubicOut)
      .attr("cy", d => y(d.transformedFollowers))
      .attr("r", 12);
  }, [chartData, timeDomain]);

  const handleZoomToggle = () => {
    setZoomLevel(prev => (prev + 1) % zoomLevels.length);
  };

  if (isFetchingTweets && !showSentimentLoader) {
    return (
      <div className="flex flex-col items-center justify-center h-64 font-mono text-[#14f195] space-y-2">
        <div className="loader-spin border-t-[#14f195]" />
        <p className="text-sm">Fetching tweets from X...</p>
      </div>
    );
  }

  if (showSentimentLoader) {
    return (
      <div className="flex flex-col items-center justify-center h-64 font-mono text-[#9945FF] space-y-2">
        <div className="loader-spin border-t-[#9945FF]" />
        <p className="text-sm">Analyzing sentiment...</p>
      </div>
    );
  }

  return (
    <div
      ref={chartWrapperRef}
      className="relative p-5 rounded-lg shadow-md transition-transform duration-300"
      style={{
        background: "linear-gradient(160deg, #1a0033 0%, #0e1a2a 50%, #000000 100%)",
        border: "1px solid #ffffff0a",
        transformOrigin: "top right",
      }}
    >
      <div className="absolute top-3 right-3 flex gap-2 z-10">
        <button onClick={handleZoomToggle} title="Zoom" className="p-1 rounded-md bg-[#111] hover:bg-[#222] border border-[#333]">
          <ArrowsPointingOutIcon className="w-4 h-4 text-[#aaa]" />
        </button>
      </div>

      <h2 className="text-lg font-semibold text-[#ff6fe7] mb-3 font-mono uppercase tracking-widest">
        Recent Tweets for {searchedToken?.token_symbol?.toUpperCase()} — {zoomLevels[zoomLevel].label}
      </h2>

      <svg ref={svgRef}></svg>

      {chartData.length === 0 && (
        <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 text-center text-[#00ffcc] font-mono text-sm fade-in">
          <p className="mb-1">No tweets found</p>
          <p className="opacity-60">Try another token or check back later</p>
        </div>
      )}

      <style>{`
        .fade-in {
          animation: fadeInTerminal 1.2s ease-out forwards;
          opacity: 0;
        }
        @keyframes fadeInTerminal {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .loader-spin {
          border: 4px solid rgba(255, 255, 255, 0.1);
          border-radius: 9999px;
          width: 32px;
          height: 32px;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default TweetScatterChart;

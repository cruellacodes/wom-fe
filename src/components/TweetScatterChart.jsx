/* eslint-disable react/prop-types */
// eslint-disable-next-line no-unused-vars
import React, { useRef, useEffect, useMemo } from "react";
import * as d3 from "d3";
import Logo from "../assets/logo.jpg";

const TweetScatterChart = ({ searchedToken, tweets }) => {
  const svgRef = useRef();

  const recentTweets = useMemo(() => {
    const now = Date.now();
    const limit = now - 24 * 60 * 60 * 1000;
    return tweets.filter(t => new Date(t.created_at).getTime() >= limit);
  }, [tweets]);

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
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    d3.select("body").selectAll(".tooltip").remove();

    if (!chartData.length) return;

    const width = 800;
    const height = 400;
    const margin = { top: 20, right: 20, bottom: 50, left: 60 };

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
      .domain([Date.now() - 24 * 60 * 60 * 1000, Date.now()])
      .range([margin.left, width - margin.right]);

    const y = d3.scaleLinear().domain([0, 6]).range([height - margin.bottom, margin.top]);

    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).ticks(6).tickFormat(d3.utcFormat("%H:%M")))
      .selectAll("text").style("fill", "#e0e0ff").style("font-size", "11px");

    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).tickValues([0, 1, 2, 3, 4, 5, 6])
        .tickFormat(d =>
          ({ 0: "0", 1: "500", 2: "1K", 3: "5K", 4: "10K", 5: "50K", 6: "100K+" }[d])
        ))
      .selectAll("text").style("fill", "#e0e0ff").style("font-size", "11px");

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
      .style("max-width", "240px") 
      .style("word-break", "break-word") 
      .style("white-space", "normal"); 


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
      .on("mousemove", (event) => {
        tooltip.style("left", event.pageX + 12 + "px").style("top", event.pageY - 26 + "px");
      })
      .on("mouseout", () => tooltip.style("opacity", 0))
      .transition()
      .duration(700)
      .delay((_, i) => i * 60)
      .ease(d3.easeCubicOut)
      .attr("cy", d => y(d.transformedFollowers))
      .attr("r", 12);

  }, [chartData]);

  return (
    <div className="relative p-5 rounded-lg shadow-md" style={{
      background: "linear-gradient(160deg, #1a0033 0%, #0e1a2a 50%, #000000 100%)",
      border: "1px solid #ffffff0a",
    }}>
      <h2 className="text-lg font-semibold text-[#ff6fe7] mb-3 font-mono uppercase tracking-widest">
        Recent Tweets for {searchedToken?.token_symbol?.toUpperCase()}
      </h2>
      <svg ref={svgRef}></svg>

      {chartData.length === 0 && (
        <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 text-center text-[#00ffcc] font-mono text-sm fade-in">
          <p className="mb-1"> No tweets found in the last 24h</p>
          <p className="opacity-60"> Try another token or check back later</p>
        </div>
      )}

      <style>{`
        .fade-in {
          animation: fadeInTerminal 1.2s ease-out forwards;
          opacity: 0;
        }

        @keyframes fadeInTerminal {
          0% {
            opacity: 0;
            transform: translateY(10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default TweetScatterChart;

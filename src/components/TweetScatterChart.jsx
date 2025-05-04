/* eslint-disable react/prop-types */
// eslint-disable-next-line no-unused-vars
import React, { useRef, useEffect } from "react";
import * as d3 from "d3";
import Logo from "../assets/logo.jpg";

const TweetScatterChart = ({ searchedToken, tweets }) => {
  const svgRef = useRef();

  useEffect(() => {
    const width = 800;
    const height = 400;
    const margin = { top: 20, right: 20, bottom: 50, left: 60 };

    d3.select(svgRef.current).selectAll("*").remove();
    d3.select("body").selectAll(".tooltip").remove();

    const svg = d3
      .select(svgRef.current)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .style("width", "100%")
      .style("height", "auto")
      .style("background", "transparent"); // SVG transparent, outer div handles bg

    const defs = svg.append("defs");

    // Gradient stroke for axes
    const axisGradient = defs
      .append("linearGradient")
      .attr("id", "gradient-axis")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "0%");
    axisGradient
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#ff6fe7");
    axisGradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#00f5ff");

    // watermark logo
    const logoSize = 180;
    svg
      .append("image")
      .attr("xlink:href", Logo)
      .attr("x", width / 2 - logoSize / 2)
      .attr("y", height / 2 - logoSize / 2)
      .attr("width", logoSize)
      .attr("height", logoSize)
      .attr("opacity", 0.04);

    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const recentTweets = tweets.filter(
      (tweet) => new Date(tweet.created_at) >= twentyFourHoursAgo
    );

    const transformFollowers = (val) => {
      if (val <= 500) return val / 500;
      if (val <= 1000) return 1 + (val - 500) / 500;
      if (val <= 5000) return 2 + (val - 1000) / 4000;
      if (val <= 10000) return 3 + (val - 5000) / 5000;
      if (val <= 50000) return 4 + (val - 10000) / 40000;
      return 5 + (val - 50000) / 50000;
    };

    const data = recentTweets.map((tweet) => ({
      date: new Date(tweet.created_at),
      originalFollowers: tweet.followers_count,
      transformedFollowers: transformFollowers(
        Math.min(tweet.followers_count, 100000)
      ),
      text: tweet.text,
      username: tweet.user_name,
      profilePic:
        tweet.profile_pic ||
        "https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png",
      tweetUrl: `https://x.com/${tweet.user_name}/status/${tweet.tweet_id}`,
    }));

    const xScale = d3
      .scaleTime()
      .domain([twentyFourHoursAgo, now])
      .range([margin.left, width - margin.right]);
    const yScale = d3
      .scaleLinear()
      .domain([0, 6])
      .range([height - margin.bottom, margin.top]);

    const xAxis = d3.axisBottom(xScale).ticks(6).tickFormat(d3.utcFormat("%H:%M"));
    const yAxis = d3
      .axisLeft(yScale)
      .tickValues([0, 1, 2, 3, 4, 5, 6])
      .tickFormat((d) =>
        ({
          0: "0",
          1: "500",
          2: "1K",
          3: "5K",
          4: "10K",
          5: "50K",
          6: "100K+",
        }[d])
      );

    svg
      .append("g")
      .attr("transform", `translate(0, ${height - margin.bottom})`)
      .call(xAxis)
      .selectAll("text")
      .style("fill", "#e0e0ff")
      .style("font-size", "11px")
      .style("font-family", "JetBrains Mono, Fira Code, monospace");

    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", height - margin.bottom + 40)
      .attr("text-anchor", "middle")
      .style("fill", "#b6b6c4")
      .style("font-size", "12px")
      .style("font-family", "JetBrains Mono, Fira Code, monospace")
      .text("Time (UTC)");

    svg
      .append("g")
      .attr("transform", `translate(${margin.left}, 0)`)
      .call(yAxis)
      .selectAll("text")
      .style("fill", "#e0e0ff")
      .style("font-size", "11px")
      .style("font-family", "JetBrains Mono, Fira Code, monospace");

    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", margin.left - 45)
      .attr("text-anchor", "middle")
      .style("fill", "#b6b6c4")
      .style("font-size", "12px")
      .style("font-family", "JetBrains Mono, Fira Code, monospace")
      .text("Followers");

    // Gradient axes line stroke
    svg.selectAll(".domain").attr("stroke", "url(#gradient-axis)");
    svg.selectAll(".tick line").attr("stroke", "#333b50");

    const yTicks = yScale.ticks(6);
    const dotSpacing = 10;
    yTicks.forEach((tick) => {
      const y = yScale(tick);
      for (let x = margin.left + 5; x < width - margin.right; x += dotSpacing) {
        svg
          .append("circle")
          .attr("cx", x)
          .attr("cy", y)
          .attr("r", 0.7)
          .attr("fill", "url(#gradient-axis)");
      }
    });

    const tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("background", "rgba(25, 25, 35, 0.9)")
      .style("border", "1px solid #9992aa")
      .style("backdrop-filter", "blur(6px)")
      .style("color", "#fff")
      .style("padding", "10px 14px")
      .style("border-radius", "8px")
      .style("font-family", "JetBrains Mono, Fira Code, monospace")
      .style("font-size", "12px")
      .style("pointer-events", "none")
      .style("opacity", 0)
      .style("max-width", "260px")
      .style("word-wrap", "break-word")           
      .style("white-space", "normal")             
      .style("overflow-wrap", "break-word");     


    data.forEach((d, i) => {
      defs
        .append("pattern")
        .attr("id", `pattern-${i}`)
        .attr("patternUnits", "objectBoundingBox")
        .attr("width", 1)
        .attr("height", 1)
        .append("image")
        .attr("href", d.profilePic)
        .attr("width", 24)
        .attr("height", 24)
        .attr("preserveAspectRatio", "xMidYMid slice");
    });

    data.forEach((d, i) => {
      svg
        .append("a")
        .attr("xlink:href", d.tweetUrl)
        .attr("target", "_blank")
        .attr("rel", "noopener noreferrer")
        .append("circle")
        .attr("cx", xScale(d.date))
        .attr("cy", height - margin.bottom)
        .attr("r", 0)
        .style("fill", `url(#pattern-${i})`)
        .attr("stroke", "#8884d8")
        .attr("stroke-width", 1)
        .on("mouseover", (event) => {
          tooltip.transition().duration(150).style("opacity", 1);
          tooltip
            .html(
              `<div style="font-weight: bold; color: #ff6fe7;">@${d.username}</div>
             <hr style="border: none; border-top: 1px solid #555; margin: 6px;">
             <div style="color: #eee;">${d.text}</div>
             <div style="font-style: italic; color: #aaa; margin-top: 4px;">Followers: ${d.originalFollowers.toLocaleString()}</div>`
            )
            .style("left", event.pageX + 12 + "px")
            .style("top", event.pageY - 26 + "px");
        })
        .on("mousemove", (event) => {
          tooltip
            .style("left", event.pageX + 12 + "px")
            .style("top", event.pageY - 26 + "px");
        })
        .on("mouseout", () => {
          tooltip.transition().duration(100).style("opacity", 0);
        })
        .transition()
        .duration(700)
        .delay(i * 60)
        .ease(d3.easeCubicOut)
        .attr("cy", yScale(d.transformedFollowers))
        .attr("r", 12);
    });
  }, [tweets]);

  return (
    <div
      className="relative p-5 rounded-lg shadow-md"
      style={{
        background:
          "linear-gradient(160deg, #1a0033 0%, #0e1a2a 50%, #000000 100%)",
        border: "1px solid #ffffff0a",
      }}
    >
      <h2 className="text-lg font-semibold text-[#ff6fe7] mb-3 font-mono uppercase tracking-widest">
        Recent Tweets for {searchedToken.token_symbol?.toUpperCase()}
      </h2>
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default TweetScatterChart;

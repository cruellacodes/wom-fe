import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

const TweetScatterChart = ({ searchedToken, tweets }) => {

  const svgRef = useRef();

  useEffect(() => {
    const width = 800,
          height = 400,
          margin = { top: 20, right: 20, bottom: 50, left: 60 };

    // Clear previous chart content and tooltips
    d3.select(svgRef.current).selectAll("*").remove();
    d3.select("body").selectAll(".tooltip").remove();

    const svg = d3.select(svgRef.current)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .style("width", "100%")
      .style("height", "auto");

    // Define the current time and 24 hours ago (UTC)
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Filter tweets to include only those from the last 24 hours
    const recentTweets = tweets.filter(
      tweet => new Date(tweet.created_at) >= twentyFourHoursAgo
    );

    // Function to transform followers count
    function transformFollowers(value) {
      if (value <= 500) return value / 500;
      if (value <= 1000) return 1 + (value - 500) / 500;
      if (value <= 5000) return 2 + (value - 1000) / 4000;
      if (value <= 10000) return 3 + (value - 5000) / 5000;
      if (value <= 50000) return 4 + (value - 10000) / 40000;
      return 5 + (value - 50000) / 50000;
    }

    const data = recentTweets.map(tweet => ({
      date: new Date(tweet.created_at),
      originalFollowers: Math.min(tweet.followers_count, 100000),
      transformedFollowers: transformFollowers(Math.min(tweet.followers_count, 100000)),
      text: tweet.text,
      username: tweet.user_name,
      profilePic: tweet.profile_pic || "https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png"
    }));

    // Set the xScale to always span the last 24 hours
    const xScale = d3.scaleTime()
                     .domain([twentyFourHoursAgo, now])
                     .range([margin.left, width - margin.right]);

    const yScale = d3.scaleLinear()
                     .domain([0, 6])
                     .range([height - margin.bottom, margin.top]);

    // Use d3.utcFormat to display time in UTC (hours and minutes)
    const xAxis = d3.axisBottom(xScale)
                    .ticks(6)
                    .tickFormat(d3.utcFormat("%H:%M"));

    const yAxis = d3.axisLeft(yScale)
                    .tickValues([0, 1, 2, 3, 4, 5, 6])
                    .tickFormat(d => ({
                      0: "0", 1: "500", 2: "1K", 3: "5K",
                      4: "10K", 5: "50K", 6: "100K+"
                    }[d]));

    // Append x-axis
    svg.append("g")
       .attr("transform", `translate(0, ${height - margin.bottom})`)
       .call(xAxis)
       .selectAll("text")
       .style("fill", "#22C55E")
       .style("font-size", "11px");

    // Append x-axis title
    svg.append("text")
       .attr("x", width / 2)
       .attr("y", height - margin.bottom + 40)
       .attr("text-anchor", "middle")
       .style("fill", "#22C55E")
       .style("font-size", "12px")
       .text("Time (UTC)");

    // Append y-axis
    svg.append("g")
       .attr("transform", `translate(${margin.left}, 0)`)
       .call(yAxis)
       .selectAll("text")
       .style("fill", "#22C55E")
       .style("font-size", "11px");

    // Append grid lines for y-axis
    svg.append("g")
       .attr("class", "grid")
       .attr("transform", `translate(${margin.left}, 0)`)
       .call(d3.axisLeft(yScale)
               .tickSize(-width + margin.left + margin.right)
               .tickFormat(""))
       .selectAll("line")
       .attr("stroke", "rgba(34,197,94,0.4)")
       .attr("stroke-dasharray", "3");

    // Create tooltip element
    const tooltip = d3.select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("background", "#0A0F0A")
      .style("border", "1px solid #22C55E")
      .style("color", "#fff")
      .style("padding", "8px 12px")
      .style("border-radius", "8px")
      .style("box-shadow", "0 3px 10px rgba(0, 0, 0, 0.6)")
      .style("font-size", "12px")
      .style("pointer-events", "none")
      .style("opacity", 0)
      .style("transition", "opacity 0.15s ease-in-out")
      .style("max-width", "250px");

    // Create definitions for profile picture patterns
    const defs = svg.append("defs");
    data.forEach((d, i) => {
      defs.append("pattern")
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

    // Plot the tweet circles
    svg.selectAll("circle.data-point")
       .data(data)
       .enter()
       .append("circle")
       .attr("class", "data-point")
       .attr("cx", d => xScale(d.date))
       .attr("cy", d => yScale(d.transformedFollowers))
       .attr("r", 12) // Reduced from 15 for a more compact look
       .style("fill", (d, i) => `url(#pattern-${i})`)
       .attr("stroke", "#22C55E")
       .attr("stroke-width", 1.5)
       .on("mouseover", (event, d) => {
         tooltip.transition().duration(150).style("opacity", 1);
         tooltip.html(
           `<div style="font-weight: bold; color: #22C55E;">@${d.username}</div>
            <hr style="border: none; border-top: 1px solid #22C55E; margin: 6px;">
            <div style="color: #fff;">${d.text}</div>
            <div style="font-style: italic; color: #bbb; margin-top: 4px;">Followers: ${d.originalFollowers.toLocaleString()}</div>`
         )
         .style("left", event.pageX + 12 + "px")
         .style("top", event.pageY - 26 + "px");
       })
       .on("mousemove", (event) => {
         tooltip.style("left", event.pageX + 12 + "px")
                .style("top", event.pageY - 26 + "px");
       })
       .on("mouseout", () => {
         tooltip.transition().duration(100).style("opacity", 0);
       });

  }, [tweets]);

  return (
    <div className="relative p-5 rounded-lg bg-[#0A0F0A] border border-green-900/30 shadow-md">
      <h2 className="text-lg font-semibold text-green-300 mb-3">
        Recent Tweets for {searchedToken.token_symbol}
      </h2>
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default TweetScatterChart;

import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

const TweetScatterChart = ({ searchedToken, tweets }) => {
  const svgRef = useRef();

  useEffect(() => {
    // Clear previous content.
    d3.select(svgRef.current).selectAll("*").remove();
    d3.select("body").selectAll(".tooltip").remove();

    // Dimensions and margins.
    const width = 800,
          height = 400,
          margin = { top: 20, right: 20, bottom: 50, left: 60 };

    // Create SVG container.
    const svg = d3.select(svgRef.current)
                  .attr("width", width)
                  .attr("height", height);

    // Transformation function: maps raw follower counts into a 0–6 scale.
    function transformFollowers(value) {
      if (value <= 500) {
        return value / 500; // [0,500] -> [0,1]
      } else if (value <= 1000) {
        return 1 + (value - 500) / 500; // (500,1000] -> [1,2]
      } else if (value <= 5000) {
        return 2 + (value - 1000) / 4000; // (1000,5000] -> [2,3]
      } else if (value <= 10000) {
        return 3 + (value - 5000) / 5000; // (5000,10000] -> [3,4]
      } else if (value <= 50000) {
        return 4 + (value - 10000) / 40000; // (10000,50000] -> [4,5]
      } else {
        return 5 + (value - 50000) / 50000; // (50000,100000] -> [5,6]
      }
    }

    // Process data: parse dates, cap follower counts at 100K, and compute transformed value.
    const data = tweets.map(tweet => {
      const originalFollowers = Math.min(tweet.followers_count, 100000);
      return {
        date: new Date(tweet.created_at),
        originalFollowers,
        transformedFollowers: transformFollowers(originalFollowers),
        text: tweet.text,
        username: tweet.user_name,
        profilePic: tweet.profile_pic ||
                    "https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png"
      };
    });

    // Create x-scale: time scale from tweet dates.
    const xScale = d3.scaleTime()
                     .domain(d3.extent(data, d => d.date))
                     .range([margin.left, width - margin.right]);

    // Create y-scale using the transformed values (0 to 6).
    const yScale = d3.scaleLinear()
                     .domain([0, 6])
                     .range([height - margin.bottom, margin.top]);

    // Define x-axis.
    const xAxis = d3.axisBottom(xScale)
                    .ticks(6)
                    .tickFormat(d3.timeFormat("%H:%M"));

    // Define y-axis with custom tick values and labels.
    const yTickValues = [0, 1, 2, 3, 4, 5, 6];
    const yAxis = d3.axisLeft(yScale)
                    .tickValues(yTickValues)
                    .tickFormat(d => {
                      if (d === 0) return "0";
                      if (d === 1) return "500";
                      if (d === 2) return "1K";
                      if (d === 3) return "5K";
                      if (d === 4) return "10K";
                      if (d === 5) return "50K";
                      if (d === 6) return "100K+";
                      return d;
                    });

    // Append x-axis.
    svg.append("g")
       .attr("transform", `translate(0, ${height - margin.bottom})`)
       .call(xAxis)
       .selectAll("text")
       .style("fill", "#22C55E")
       .style("font-size", "12px");

    // Append y-axis.
    svg.append("g")
       .attr("transform", `translate(${margin.left}, 0)`)
       .call(yAxis)
       .selectAll("text")
       .style("fill", "#22C55E")
       .style("font-size", "12px");

    // Append y-axis gridlines.
    svg.append("g")
       .attr("class", "grid")
       .attr("transform", `translate(${margin.left}, 0)`)
       .call(d3.axisLeft(yScale)
               .tickValues(yTickValues)
               .tickSize(-width + margin.left + margin.right)
               .tickFormat(""))
       .selectAll("line")
       .attr("stroke", "rgba(34,197,94,0.5)")
       .attr("stroke-dasharray", "2");

    const tooltip = d3.select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("background", "#0A0F0A")             
      .style("border", "1px solid #22C55E")         
      .style("color", "#fff")                       
      .style("padding", "8px 12px")
      .style("border-radius", "6px")                
      .style("box-shadow", "0 2px 8px rgba(0, 0, 0, 0.6)")
      .style("font-size", "13px")
      .style("pointer-events", "none")
      .style("opacity", 0)
      .style("transition", "opacity 0.2s ease-in-out")
      .style("max-width", "300px")
      .style("white-space", "normal");


    // Create a defs container for patterns.
    const defs = svg.append("defs");

    // For each data point, create a unique pattern.
    data.forEach((d, i) => {
      defs.append("pattern")
          .attr("id", `pattern-${i}`)
          .attr("patternUnits", "objectBoundingBox")
          .attr("width", 1)
          .attr("height", 1)
          .append("image")
          .attr("href", d.profilePic)
          .attr("width", 30)
          .attr("height", 30)
          .attr("preserveAspectRatio", "xMidYMid slice");
    });

    // Draw circles filled with the corresponding pattern.
    svg.selectAll("circle.data-point")
       .data(data)
       .enter()
       .append("circle")
       .attr("class", "data-point")
       .attr("cx", d => xScale(d.date))
       .attr("cy", d => yScale(d.transformedFollowers))
       .attr("r", 15) // Larger circle (30x30 equivalent)
       .style("fill", (d, i) => `url(#pattern-${i})`)
       .attr("stroke", "#22C55E")
       .attr("stroke-width", 2)
       .on("mouseover", (event, d) => {
        tooltip.transition().duration(200).style("opacity", 1);
        tooltip.html(
          `<div style="font-weight: bold; color: #22C55E;">@${d.username}</div>
           <hr style="border: none; border-top: 1px solid #22C55E; margin: 4px 6px;">
           <div style="color: #fff;">${d.text}</div>
           <div style="font-style: italic; color: #ccc; margin-top: 4px;">Followers: ${d.originalFollowers.toLocaleString()}</div>`
        )
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 28 + "px");
      })
      .on("mousemove", (event) => {
        tooltip.style("left", event.pageX + 10 + "px")
               .style("top", event.pageY - 28 + "px");
      })
      .on("mouseout", () => {
        tooltip.transition().duration(100).style("opacity", 0);
      });
      
  }, [tweets]);

  return (
    <div className="relative p-6 rounded-xl bg-[#0A0F0A] border border-green-900/40">
      <h2 className="text-xl font-bold text-green-300 mb-4">
        Recent Tweets for {searchedToken.Token}
      </h2>
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default TweetScatterChart;

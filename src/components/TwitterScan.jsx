// TwitterScan.jsx
// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect, useRef } from "react";
import html2canvas from "html2canvas";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
} from "chart.js";
import {
  XMarkIcon,
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/solid";
import { supabase } from "../lib/supabaseClient";
import logo from "../assets/logo.png";
import { fetchTopActiveTokensByTweetCount } from "../utils/fetchTopActiveTokensByTweetCount";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

const WATCHLIST_KEY = "twitterScanWatchlist";

const TwitterScan = () => {
  const [watchlist, setWatchlist] = useState([]);
  const [tokenOptions, setTokenOptions] = useState([]);
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const cardRefs = useRef({});

  useEffect(() => {
    const stored = localStorage.getItem(WATCHLIST_KEY);
    if (stored) {
      try {
        setWatchlist(JSON.parse(stored));
      } catch {
        console.error("Invalid watchlist in localStorage");
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(watchlist));
  }, [watchlist]);

  useEffect(() => {
    const fetchTokens = async () => {
      const { data, error } = await supabase
        .from("tokens")
        .select("token_symbol, token_name")
        .eq("is_active", true);
      if (!error && data) {
        setTokenOptions(data);
        setFilteredOptions(data);
      }
    };
    fetchTokens();
  }, []);

  useEffect(() => {
    let mounted = true;

    const preloadTrending = async () => {
      const stored = localStorage.getItem(WATCHLIST_KEY);
      if (!mounted || (stored && JSON.parse(stored)?.length > 0)) return;

      setLoading(true);
      try {
        const trendingTokens = await fetchTopActiveTokensByTweetCount(24, 1);
        for (const token of trendingTokens) {
          if (!mounted) return;
          await handleSelectToken(token, true);
        }
      } catch (err) {
        console.error("Failed to preload trending tokens", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    preloadTrending();

    return () => {
      mounted = false;
    };
  }, []);

  const groupIntoBuckets = (tweets) => {
    const now = Date.now();
    const buckets = {
      "1h": 0,
      "3h": 0,
      "6h": 0,
      "12h": 0,
      "24h": 0,
      "48h": 0,
    };

    tweets.forEach((tweet) => {
      const ageH = (now - new Date(tweet.created_at).getTime()) / 36e5;

      if (ageH <= 1) buckets["1h"]++;
      else if (ageH <= 3) buckets["3h"]++;
      else if (ageH <= 6) buckets["6h"]++;
      else if (ageH <= 12) buckets["12h"]++;
      else if (ageH <= 24) buckets["24h"]++;
      else if (ageH <= 48) buckets["48h"]++;
    });

    return buckets;
  };

  const handleSelectToken = async (token_symbol, fromTrending = false) => {
    const raw = token_symbol;
    const symbol = raw.toUpperCase();
    const normalized = symbol.toLowerCase();
    if (watchlist.some((t) => t.token === symbol)) return;

    const { data: tokenData } = await supabase
      .from("tokens")
      .select("is_active")
      .eq("token_symbol", normalized)
      .maybeSingle();

    if (!tokenData?.is_active) return;

    try {
      let tweets = [];

      const { data: supabaseTweets } = await supabase
        .from("tweets")
        .select("created_at")
        .eq("token_symbol", normalized)
        .gte("created_at", new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString());

      if (supabaseTweets?.length > 0) {
        tweets = supabaseTweets;
      } else {
        const fallbackRes = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/tweets/${normalized}`
        );
        const fallbackData = await fallbackRes.json();
        tweets = fallbackData?.tweets || [];
      }

      if (tweets.length === 0) {
        alert("No tweet data found for this token.");
        return;
      }

      const buckets = groupIntoBuckets(tweets);

      setWatchlist((prev) => [
        ...prev,
        {
          token: symbol,
          total: Object.values(buckets).reduce((a, b) => a + b, 0),
          intervals: buckets,
          history: ["1h", "3h", "6h", "12h", "24h", "48h"].map((k) => buckets[k]),
          preloaded: fromTrending,
        },
      ]);
    } catch (err) {
      console.error("Token selection failed:", err);
    }

    setSearchInput("");
    setFilteredOptions(tokenOptions);
  };

  const handleSearchInput = (e) => {
    const val = e.target.value;
    setSearchInput(val);
    setFilteredOptions(
      tokenOptions.filter((t) =>
        t.token_symbol.toLowerCase().includes(val.toLowerCase())
      )
    );
    setHighlightedIndex(-1);
  };

  const handleRemoveToken = (symbol) => {
    setWatchlist((prev) => prev.filter((t) => t.token !== symbol));
  };

  const handleShare = async (token) => {
    const cardEl = cardRefs.current[token];
    if (!cardEl) return;

    try {
      const button = cardEl.querySelector("button[title='Download card']");
      if (button) button.style.visibility = "hidden";

      const canvas = await html2canvas(cardEl, {
        backgroundColor: null,
        useCORS: true,
      });

      const ctx = canvas.getContext("2d");
      const watermark = new Image();
      watermark.src = logo;
      watermark.crossOrigin = "anonymous";
      await new Promise((resolve, reject) => {
        watermark.onload = resolve;
        watermark.onerror = reject;
      });

      const padding = 12;
      const scale = 0.25;
      const w = watermark.width * scale;
      const h = watermark.height * scale;

      ctx.drawImage(
        watermark,
        canvas.width - w - padding,
        canvas.height - h - padding,
        w,
        h
      );

      if (button) button.style.visibility = "visible";

      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `${token}-twittercard.png`;
      link.click();
    } catch (err) {
      console.error("Image capture failed:", err);
    }
  };

  return (
    <div className="bg-[#0A0A0E] min-h-screen text-white font-mono tracking-widest">
      <Header />
      <div className="text-center pt-10 pb-6 px-4">
        <h1 className="text-2xl sm:text-3xl font-semibold">TwitterScan</h1>
        <p className="text-sm text-[#AAA] mt-2 font-light">
          Realtime tweet tracking for Solana tokens.
        </p>
      </div>

      <div className="flex justify-center mb-12 px-4">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            value={searchInput}
            onChange={handleSearchInput}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setHighlightedIndex((prev) =>
                  Math.min(prev + 1, filteredOptions.length - 1)
                );
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setHighlightedIndex((prev) => Math.max(prev - 1, 0));
              } else if (e.key === "Enter" && highlightedIndex >= 0) {
                e.preventDefault();
                handleSelectToken(filteredOptions[highlightedIndex].token_symbol);
              } else if (e.key === "Escape") {
                setHighlightedIndex(-1);
              }
            }}
            placeholder="Search token..."
            className="w-full px-4 py-2.5 rounded-full bg-[#14141A] border border-[#2A2A2A] text-white placeholder-[#777] focus:ring-2 focus:ring-[#FF4DFF] outline-none font-mono tracking-widest"
          />
          <MagnifyingGlassIcon className="w-5 h-5 absolute right-4 top-2.5 text-[#FF4DFF]" />
          {searchInput && (
            <div className="absolute w-full bg-[#1A1A1A] border border-[#2A2A2A] mt-2 rounded-lg shadow-xl z-20 max-h-60 overflow-y-auto">
              {filteredOptions.map((token, i) => (
                <div
                  key={i}
                  onClick={() => handleSelectToken(token.token_symbol)}
                  className={`px-4 py-2 text-sm flex justify-between font-mono cursor-pointer ${
                    i === highlightedIndex
                      ? "bg-[#333] text-[#FF4DFF]"
                      : "hover:bg-[#2C2C2C]"
                  }`}
                >
                  <span>{token.token_symbol}</span>
                  <span className="text-[#FF4DFF]">({token.token_name})</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="px-6 max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
        {loading ? (
          <div className="col-span-full text-center text-[#999] italic animate-pulse">
            Fetching trending tokens...
          </div>
        ) : watchlist.length === 0 ? (
          <div className="col-span-full text-center text-[#777] italic mt-8">
            Your watchlist is empty. Search for a token above to get started.
          </div>
        ) : (
          watchlist.map(({ token, total, intervals, history, preloaded }, index) => (
            <div key={index} className="relative">
                {preloaded && (
                  <div className="absolute -top-4 left-1 z-10">
                    <span className="text-xs bg-[#1A1A1A] px-3 py-1 rounded-full border border-[#FF4DFF] text-[#FF4DFF] w-fit">
                      🔥 Trending — Top 24h Volume
                    </span>
                  </div>
                )}
                <div
                  ref={(el) => (cardRefs.current[token] = el)}
                  className="relative bg-[#13131A] border border-[#2A2A2A] p-5 rounded-xl transition-all hover:shadow-[0_0_15px_#FF4DFF40]"
                >

                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-base font-normal">{token}</h2>
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleShare(token)}
                        title="Download card"
                        className="text-[#888] hover:text-white transition-all"
                      >
                        <ArrowDownTrayIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRemoveToken(token)}
                        title="Remove"
                        className="text-[#888] hover:text-red-500 transition-all"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="text-xs text-[#FF4DFF] mt-1">
                      {total.toLocaleString()} <span className="text-[#AAA]">tweets</span>
                    </div>
                  </div>
                </div>

                <ul className="text-sm text-[#AAA] space-y-1 mb-4">
                  {Object.entries(intervals).map(([label, value]) => (
                    <li key={label} className="flex justify-between">
                      <span>{label}</span>
                      <span>{value.toLocaleString()}</span>
                    </li>
                  ))}
                </ul>

                <Bar
                  data={{
                    labels: ["1h", "3h", "6h", "12h", "24h", "48h"],
                    datasets: [
                      {
                        label: "Tweet Volume",
                        data: history,
                        backgroundColor: "rgba(255, 77, 255, 0.5)",
                        borderRadius: 6,
                      },
                    ],
                  }}
                  options={{
                    plugins: { legend: { display: false } },
                    responsive: true,
                    animation: { duration: 800, easing: "easeOutQuart" },
                    scales: {
                      x: {
                        ticks: { color: "#EAEAEA" },
                        grid: { color: "#222" },
                      },
                      y: {
                        ticks: { color: "#EAEAEA" },
                        grid: { color: "#222" },
                      },
                    },
                  }}
                  height={180}
                />
              </div>
            </div>
          ))
        )}
      </div>

      <Footer />
    </div>
  );
};

export default TwitterScan;

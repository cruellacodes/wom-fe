/* eslint-disable no-unused-vars */
// TwitterScan.jsx
// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from "react";
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
import { XMarkIcon, PlusIcon } from "@heroicons/react/24/solid";
import { supabase } from "../lib/supabaseClient";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

const WATCHLIST_KEY = "twitterScanWatchlist";

const TwitterScan = () => {
  const [watchlist, setWatchlist] = useState([]);
  const [tokenOptions, setTokenOptions] = useState([]);
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [, setTopToken] = useState(null);
  const [, setLoadingToken] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(WATCHLIST_KEY);
    if (stored) {
      try {
        setWatchlist(JSON.parse(stored));
      } catch (e) {
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
      if (error) console.error("Error fetching tokens:", error);
      else {
        setTokenOptions(data);
        setFilteredOptions(data);
      }
    };
    fetchTokens();

    const fetchTopToken = async () => {
      const { data, error } = await supabase
        .from("tokens")
        .select("token_symbol")
        .eq("is_active", true)
        .order("tweet_count", { ascending: false })
        .limit(1)
        .single();
      if (!error && data && !watchlist.some((t) => t.token === data.token_symbol)) {
        handleSelectToken(data.token_symbol);
        setTopToken(data.token_symbol);
      }
    };
    fetchTopToken();
  }, []);

  const groupIntoBuckets = (tweets) => {
    const now = Date.now();
    const buckets = { "1h": 0, "6h": 0, "12h": 0, "24h": 0, "48h": 0 };
    tweets.forEach((tweet) => {
      const ageH = (now - new Date(tweet.created_at).getTime()) / 36e5;
      if (ageH <= 1) buckets["1h"]++;
      if (ageH <= 6) buckets["6h"]++;
      if (ageH <= 12) buckets["12h"]++;
      if (ageH <= 24) buckets["24h"]++;
      if (ageH <= 48) buckets["48h"]++;
    });
    return buckets;
  };

  const fetchLiveBuckets = async (token_symbol) => {
    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/live-tweet-buckets/?token_symbol=${encodeURIComponent(token_symbol)}`
    );
    const data = await res.json();
    return data?.bucket_data || null;
  };

  const handleSelectToken = async (token_symbol) => {
    const symbol = token_symbol.toUpperCase();
    if (watchlist.some((t) => t.token === symbol)) return;
    setLoadingToken(true);
    try {
      const { data: tweets } = await supabase
        .from("tweets")
        .select("created_at")
        .eq("token_symbol", symbol.toLowerCase())
        .gte("created_at", new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString());

      const buckets = tweets?.length
        ? groupIntoBuckets(tweets)
        : await fetchLiveBuckets(symbol);

      if (buckets) {
        setWatchlist((prev) => [
          ...prev,
          {
            token: symbol,
            total: Object.values(buckets).reduce((a, b) => a + b, 0),
            intervals: buckets,
            history: ["1h", "6h", "12h", "24h", "48h"].map((k) => buckets[k]),
          },
        ]);
      } else {
        alert("No tweet data found for this token.");
      }
    } catch (err) {
      console.error("Token selection failed:", err);
    }
    setSearchInput("");
    setFilteredOptions(tokenOptions);
    setLoadingToken(false);
  };

  const handleSearchInput = (e) => {
    const val = e.target.value;
    setSearchInput(val);
    setFilteredOptions(
      tokenOptions.filter((t) =>
        t.token_symbol.toLowerCase().includes(val.toLowerCase())
      )
    );
  };

  const handleRemoveToken = (tokenSymbol) => {
    setWatchlist((prev) => prev.filter((t) => t.token !== tokenSymbol));
  };

  return (
    <div className="bg-[#0A0A0E] min-h-screen text-white font-sans">
      <Header />
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="text-center mb-10">
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#E5E5E5] tracking-tight mb-2">
            Discover What’s Poppin’ on Solana 🚀
          </h1>
          <p className="text-sm sm:text-base text-[#A0A0A0] max-w-md mx-auto">
            Real-time token trends based on tweet volume. No bots. No hype. Just signal.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                placeholder="Search token..."
                value={searchInput}
                onChange={handleSearchInput}
                className="w-full px-4 py-2 rounded-lg bg-[#0F1117] border border-[#00F5A0]/40 
                text-white placeholder-[#777] focus:outline-none focus:ring-2 focus:ring-[#00F5A0] 
                shadow-[0_0_8px_#00F5A040] transition"
              />
              {searchInput && (
                <div className="absolute left-0 right-0 z-20 mt-1 bg-[#0F1117] border border-[#00F5A0]/30 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {filteredOptions.map((token, i) => (
                    <div
                      key={i}
                      onClick={() => handleSelectToken(token.token_symbol)}
                      className="px-4 py-2 cursor-pointer hover:bg-[#1F2230] text-sm text-white flex justify-between transition-all duration-150"
                    >
                      <span>{token.token_symbol}</span>
                      <span className="text-[#00F5A0]">({token.token_name})</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 h-1 w-48 mx-auto bg-gradient-to-r from-transparent via-[#00F5A0] to-transparent animate-pulse" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {watchlist.map(({ token, total, intervals, history }, index) => (
            <div
              key={index}
              className="relative p-5 rounded-2xl backdrop-blur-sm bg-[#101216]/70 border border-[#00F5A0]/10 
              shadow-[0_0_12px_#00F5A020] transition-transform hover:scale-[1.015]"
            >
              <button
                onClick={() => handleRemoveToken(token)}
                className="absolute top-2 right-2 text-[#94a1b2] hover:text-red-500"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">{token}</h2>
                <span className="text-sm text-[#00F5A0]">{total.toLocaleString()} tweets</span>
              </div>
              <ul className="text-xs text-[#AAA] space-y-1 mb-4">
                {Object.entries(intervals).map(([label, value]) => (
                  <li key={label} className="flex justify-between">
                    <span>{label}</span>
                    <span>{value.toLocaleString()}</span>
                  </li>
                ))}
              </ul>
              <Bar
                data={{
                  labels: ["1h", "6h", "12h", "24h", "48h"],
                  datasets: [
                    {
                      label: "Tweet Volume",
                      data: history,
                      backgroundColor: "rgba(0, 245, 160, 0.6)",
                      borderRadius: 6,
                    },
                  ],
                }}
                options={{
                  plugins: { legend: { display: false } },
                  responsive: true,
                  animation: { duration: 1000, easing: "easeOutBounce" },
                  scales: {
                    x: {
                      ticks: { color: "#E5E5E5" },
                      grid: { color: "#222" },
                    },
                    y: {
                      ticks: { color: "#E5E5E5" },
                      grid: { color: "#222" },
                    },
                  },
                }}
                height={180}
              />
            </div>
          ))}

          {/* Empty Add Card */}
          <div className="flex flex-col items-center justify-center p-5 rounded-2xl border border-dashed border-[#00F5A0]/30 text-[#00F5A0] bg-[#101216]/50 hover:bg-[#141820]/50 transition cursor-pointer">
            <PlusIcon className="w-10 h-10 mb-2" />
            <span className="text-sm">Add Token</span>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TwitterScan;

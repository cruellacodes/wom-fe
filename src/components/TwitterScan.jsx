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
import { XMarkIcon, MagnifyingGlassIcon, ArrowUpRightIcon } from "@heroicons/react/24/solid";
import { supabase } from "../lib/supabaseClient";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

const WATCHLIST_KEY = "twitterScanWatchlist";

const TwitterScan = () => {
  const [watchlist, setWatchlist] = useState([]);
  const [tokenOptions, setTokenOptions] = useState([]);
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [searchInput, setSearchInput] = useState("");

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
    const fetchTopToken = async () => {
      const { data, error } = await supabase
        .from("tokens")
        .select("token_symbol")
        .eq("is_active", true)
        .order("tweet_count", { ascending: false })
        .limit(1)
        .single();
      if (!error && data) {
        const topToken = data.token_symbol.toUpperCase();
        if (mounted && !watchlist.find((t) => t.token === topToken)) {
          await handleSelectToken(topToken);
        }
      }
    };
    fetchTopToken();
    return () => {
      mounted = false;
    };
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

  const handleRemoveToken = (symbol) => {
    setWatchlist((prev) => prev.filter((t) => t.token !== symbol));
  };

  const handleShare = (token, total) => {
    const tweetText = encodeURIComponent(
      `📈 $${token} got ${total.toLocaleString()} tweets in the last 48h!\n\nTrack token trends live at 👇`
    );
    const tweetUrl = `https://twitter.com/intent/tweet?text=${tweetText}&url=${encodeURIComponent("https://yourdashboardurl.com/twitter-scan")}`;
    window.open(tweetUrl, "_blank");
  };

  return (
    <div className="bg-[#0A0A0E] min-h-screen text-white font-mono">
      <Header />

      <div className="px-6 max-w-5xl mx-auto pt-8 pb-4 text-left">
        <h1 className="text-xl sm:text-2xl text-white font-light tracking-tight">
          TwitterScan Dashboard
        </h1>
        <p className="text-sm text-[#999] mt-1">
          Realtime tweet tracking for Solana tokens.
          <span className="text-[#00FF88] ml-1">powered by on-chain vibes</span>
        </p>
      </div>

      <div className="px-6 max-w-5xl mx-auto mt-2 mb-10">
        <div className="relative">
          <input
            type="text"
            value={searchInput}
            onChange={handleSearchInput}
            placeholder="Search token..."
            className="w-full px-5 py-3 bg-[#14141A] border border-[#2A2A2A] rounded-lg text-white placeholder-[#777] focus:ring-2 focus:ring-[#FF4DFF] outline-none"
          />
          <MagnifyingGlassIcon className="w-5 h-5 absolute right-4 top-3 text-[#FF4DFF]" />
          {searchInput && (
            <div className="absolute w-full bg-[#1A1A1A] border border-[#2A2A2A] mt-2 rounded-lg shadow-xl z-20 max-h-60 overflow-y-auto">
              {filteredOptions.map((token, i) => (
                <div
                  key={i}
                  onClick={() => handleSelectToken(token.token_symbol)}
                  className="px-4 py-2 text-sm hover:bg-[#2C2C2C] cursor-pointer flex justify-between"
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
        {watchlist.length === 0 && (
          <div className="col-span-full text-center text-[#777] italic mt-8">
            Your watchlist is empty. Search for a token above to get started.
          </div>
        )}

        {watchlist.map(({ token, total, intervals, history }, index) => (
          <div
            key={index}
            className="relative bg-[#13131A] border border-[#2A2A2A] p-5 rounded-xl transition-all hover:shadow-[0_0_15px_#FF4DFF40]"
          >
            <button
              onClick={() => handleRemoveToken(token)}
              className="absolute top-3 right-3 text-[#888] hover:text-red-500"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>

            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base text-white font-normal">{token}</h2>
              <span className="text-sm text-[#FF4DFF]">
                {total.toLocaleString()} tweets
              </span>
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
                labels: ["1h", "6h", "12h", "24h", "48h"],
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
                  x: { ticks: { color: "#EAEAEA" }, grid: { color: "#222" } },
                  y: { ticks: { color: "#EAEAEA" }, grid: { color: "#222" } },
                },
              }}
              height={180}
            />

            <button
              onClick={() => handleShare(token, total)}
              className="mt-4 flex items-center gap-2 bg-[#1DA1F2] hover:bg-[#1A91DA] text-white text-sm py-2 px-4 rounded-lg transition-all"
            >
              <ArrowUpRightIcon className="w-4 h-4" />
              Share to Twitter
            </button>
          </div>
        ))}
      </div>

      <Footer />
    </div>
  );
};

export default TwitterScan;

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
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { supabase } from "../lib/supabaseClient";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

const TwitterScan = () => {
  const [watchlist, setWatchlist] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [tokenOptions, setTokenOptions] = useState([]);
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [, setLoadingToken] = useState(false);
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    const fetchTokens = async () => {
      try {
        const { data, error } = await supabase
          .from("tokens")
          .select("token_symbol, token_name")
          .eq("is_active", true);

        if (error) throw error;
        if (data) {
          setTokenOptions(data);
          setFilteredOptions(data);
        }
      } catch (err) {
        console.error("Error fetching tokens from Supabase:", err);
      }
    };
    fetchTokens();
  }, []);

  const groupIntoBuckets = (tweets) => {
    const now = Date.now();
    const buckets = {
      "1h": 0,
      "6h": 0,
      "12h": 0,
      "24h": 0,
      "48h": 0,
    };

    tweets.forEach((tweet) => {
      const ageMs = now - new Date(tweet.created_at).getTime();
      const ageH = ageMs / (1000 * 60 * 60);
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
    if (watchlist.some((t) => t.token === token_symbol)) return;
    setLoadingToken(true);

    try {
      const { data: tweets } = await supabase
        .from("tweets")
        .select("created_at")
        .eq("token_symbol", token_symbol.toLowerCase())
        .gte("created_at", new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString());

      let buckets;
      if (tweets?.length) {
        buckets = groupIntoBuckets(tweets);
      } else {
        console.warn("No tweets found in Supabase. Using live fallback.");
        buckets = await fetchLiveBuckets(token_symbol);
      }

      if (buckets) {
        const tokenData = {
          token: token_symbol,
          total: Object.values(buckets).reduce((a, b) => a + b, 0),
          intervals: buckets,
          history: [buckets["1h"], buckets["6h"], buckets["12h"], buckets["24h"], buckets["48h"]],
        };
        setWatchlist((prev) => [...prev, tokenData]);
      } else {
        alert("No tweet data found for this token.");
      }
    } catch (err) {
      console.error("Error handling token selection:", err);
    }

    setModalOpen(false);
    setLoadingToken(false);
    setSearchInput("");
    setFilteredOptions(tokenOptions);
  };

  const handleSearchInput = (e) => {
    const val = e.target.value;
    setSearchInput(val);
    const filtered = tokenOptions.filter((t) =>
      t.token_symbol.toLowerCase().includes(val.toLowerCase())
    );
    setFilteredOptions(filtered);
  };

  const handleRemoveToken = (tokenSymbol) => {
    setWatchlist((prev) => prev.filter((t) => t.token !== tokenSymbol));
  };

  return (
    <div className="bg-[#010409] min-h-screen text-[#C8FECB]">
      <Header />
      <div className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-[#00FF00] mb-2 text-center">TwitterScan</h1>
        <p className="text-center text-sm text-[#7FFF7F] mb-2">
          Track Tweet Volume Over Time for Any Token
        </p>
        <p className="text-center text-xs text-[#39FF14] italic mb-6">
          Tweets shown here are filtered for relevance – spam and shill posts are removed.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <div
            onClick={() => setModalOpen(true)}
            className="cursor-pointer p-5 rounded-xl bg-gradient-to-br from-[#112B11] to-[#0B1F0B] border border-[#00FF00]/20 shadow-inner hover:shadow-[#00FF00]/10 hover:scale-105 transition-all duration-300 flex flex-col justify-center items-center text-[#8AFF8A]"
          >
            <PlusIcon className="w-10 h-10 mb-2" />
            <p className="text-sm font-medium">Add Token</p>
          </div>

          {watchlist.map(({ token, total, intervals, history }, index) => (
            <div
              key={index}
              className="relative p-5 rounded-xl bg-gradient-to-br from-[#0D1A0D] to-[#071707] border border-[#00FF00]/20 shadow-xl hover:shadow-[#00FF00]/10 transition"
            >
              <button
                onClick={() => handleRemoveToken(token)}
                className="absolute top-2 right-2 text-[#8AFF8A] hover:text-red-400 transition"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-[#C8FECB]">{token}</h2>
                <span className="text-sm text-[#A0FFA0]">{total.toLocaleString()} tweets</span>
              </div>
              <ul className="text-xs text-[#90FF90] space-y-1 mb-4">
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
                      backgroundColor: "rgba(0, 255, 0, 0.5)",
                      borderRadius: 8,
                    },
                  ],
                }}
                options={{
                  plugins: { legend: { display: false } },
                  responsive: true,
                  scales: {
                    x: {
                      ticks: { color: "#C8FECB" },
                      grid: { color: "#133113" },
                    },
                    y: {
                      ticks: { color: "#C8FECB" },
                      grid: { color: "#133113" },
                    },
                  },
                }}
                height={180}
              />
            </div>
          ))}
        </div>
      </div>

      <Footer />

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-[#071707] p-6 rounded-lg border border-[#00FF00]/20 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-semibold text-[#C8FECB] mb-4 text-center">
              Search Token
            </h3>
            <input
              type="text"
              placeholder="Type token symbol..."
              value={searchInput}
              onChange={handleSearchInput}
              className="w-full px-4 py-2 mb-4 rounded-md bg-[#102610] border border-[#00FF00]/20 text-[#C8FECB] placeholder-[#80FF80]"
            />
            <div className="max-h-72 overflow-y-auto space-y-2">
              {filteredOptions.map((token, i) => (
                <button
                  key={i}
                  onClick={() => handleSelectToken(token.token_symbol)}
                  className="w-full text-left px-4 py-2 bg-[#102610] hover:bg-[#1B3B1B]/30 rounded-md text-[#C8FECB] text-sm"
                >
                  {token.token_symbol} <span className="text-[#A0FFA0]">({token.token_name})</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => setModalOpen(false)}
              className="mt-6 block w-full text-sm text-center text-[#90FF90] hover:text-[#D2FFD2]"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TwitterScan;

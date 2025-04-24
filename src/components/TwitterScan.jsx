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

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

const TwitterScan = () => {
  const [watchlist, setWatchlist] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [tokenOptions, setTokenOptions] = useState([]);
  const [loadingToken, setLoadingToken] = useState(false);
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    const fetchTokens = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/tokens?only_active=true`);
        const data = await res.json();
        if (data?.tokens) setTokenOptions(data.tokens);
      } catch (err) {
        console.error("Error fetching tokens:", err);
      }
    };
    fetchTokens();
  }, []);

  const fetchTokenBuckets = async (token_symbol) => {
    const encoded_symbol = encodeURIComponent(token_symbol);
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/tweet-buckets/?token_symbol=${encoded_symbol}`);
    const data = await res.json();
    return data?.bucket_data || null;
  };

  const fetchLiveBuckets = async (token_symbol) => {
    const encoded_symbol = encodeURIComponent(token_symbol);
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/live-tweet-buckets/?token_symbol=${encoded_symbol}`);
    const data = await res.json();
    return data?.bucket_data || null;
  };

  const handleSelectToken = async (token_symbol, isLive = false) => {
    if (watchlist.some((t) => t.token === token_symbol)) return;
    setLoadingToken(true);

    try {
      const buckets = isLive
        ? await fetchLiveBuckets(token_symbol)
        : await fetchTokenBuckets(token_symbol);

      if (buckets) {
        const tokenData = {
          token: token_symbol,
          total: Object.values(buckets).reduce((a, b) => a + b, 0),
          intervals: {
            "1h": buckets["1h"] ?? 0,
            "6h": buckets["6h"] ?? 0,
            "12h": buckets["12h"] ?? 0,
            "24h": buckets["24h"] ?? 0,
            "48h": buckets["48h"] ?? 0,
          },
          history: [
            buckets["1h"] ?? 0,
            buckets["6h"] ?? 0,
            buckets["12h"] ?? 0,
            buckets["24h"] ?? 0,
            buckets["48h"] ?? 0,
          ],
        };
        setWatchlist((prev) => [...prev, tokenData]);
      } else {
        alert("No tweet data found for this token.");
      }
    } catch (err) {
      console.error("Error fetching token tweet buckets:", err);
    }

    setModalOpen(false);
    setLoadingToken(false);
  };

  const handleSearch = async () => {
    if (!searchInput.trim()) return;
    await handleSelectToken(searchInput.trim(), true);
    setSearchInput("");
  };

  const handleRemoveToken = (tokenSymbol) => {
    setWatchlist((prev) => prev.filter((t) => t.token !== tokenSymbol));
  };

  return (
    <div className="bg-[#010409] min-h-screen text-gray-300">
      <Header />

      <div className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-green-400 mb-2 text-center">
          TwitterScan
        </h1>
        <p className="text-center text-sm text-gray-400 mb-2">
          Track Tweet Volume Over Time for Any Token
        </p>
        <p className="text-center text-xs text-green-500 italic mb-6">
          Tweets shown here are filtered for relevance – spam and shill posts are removed.
        </p>

        {/* Search bar */}
        <div className="flex justify-center mb-8 gap-3">
          <input
            type="text"
            placeholder="Search any token (e.g. $TOFI)"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            className="px-4 py-2 bg-green-900/10 border border-green-700/40 text-green-300 rounded-md w-64 placeholder-green-500 focus:outline-none focus:ring focus:ring-green-500"
          />
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-600 transition"
          >
            Scan
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {/* Add Token Card */}
          <div
            onClick={() => setModalOpen(true)}
            className="cursor-pointer p-5 rounded-xl bg-gradient-to-br from-green-900/20 to-green-800/10 border border-green-600/40 shadow-inner hover:shadow-green-400/10 hover:scale-105 transition-all duration-300 flex flex-col justify-center items-center text-green-300"
          >
            <PlusIcon className="w-10 h-10 mb-2" />
            <p className="text-sm font-medium">Add Token</p>
          </div>

          {/* Watchlist Cards */}
          {watchlist.map(({ token, total, intervals, history }, index) => (
            <div
              key={index}
              className="relative p-5 rounded-xl bg-gradient-to-br from-[#0A0F0A] to-[#031715] border border-green-700/30 shadow-xl hover:shadow-green-400/10 transition"
            >
              <button
                onClick={() => handleRemoveToken(token)}
                className="absolute top-2 right-2 text-green-400 hover:text-red-400 transition"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-green-300">{token}</h2>
                <span className="text-sm text-gray-400">{total.toLocaleString()} tweets</span>
              </div>
              <ul className="text-xs text-green-400 space-y-1 mb-4">
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
                      backgroundColor: "#22C55E99",
                      borderRadius: 6,
                    },
                  ],
                }}
                options={{
                  plugins: { legend: { display: false } },
                  responsive: true,
                  scales: {
                    x: {
                      ticks: { color: "#9AE6B4" },
                      grid: { color: "#1F2937" },
                    },
                    y: {
                      ticks: { color: "#9AE6B4" },
                      grid: { color: "#1F2937" },
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

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-[#0A0F0A] p-6 rounded-lg border border-green-700/30 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-semibold text-green-300 mb-4 text-center">
              Select a Token
            </h3>
            <div className="max-h-72 overflow-y-auto space-y-2">
              {tokenOptions.map((token, i) => (
                <button
                  key={i}
                  onClick={() => handleSelectToken(token.token_symbol)}
                  className="w-full text-left px-4 py-2 bg-green-900/10 hover:bg-green-700/20 rounded-md text-green-300 text-sm"
                >
                  {token.token_symbol}{" "}
                  <span className="text-gray-400">({token.token_name})</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => setModalOpen(false)}
              className="mt-6 block w-full text-sm text-center text-green-400 hover:text-green-200"
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

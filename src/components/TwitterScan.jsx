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
import { PlusIcon } from "@heroicons/react/24/solid";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

const TwitterScan = () => {
  const [watchlist, setWatchlist] = useState([
    {
      token: "$VIBE",
      total: 9600,
      intervals: { "1h": 200, "6h": 1500, "12h": 3200, "24h": 6000, "48h": 9600 },
      history: [50, 70, 90, 110, 140, 160, 180],
    },
  ]);
  const [modalOpen, setModalOpen] = useState(false);
  const [tokenOptions, setTokenOptions] = useState([]);
  const [loadingToken, setLoadingToken] = useState(false);

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

  const handleSelectToken = async (token_symbol) => {
        if (watchlist.some((t) => t.token === token_symbol)) return;
        setLoadingToken(true);

        try {
        
            const encoded_symbol = encodeURIComponent(token_symbol); 
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/tweet-buckets/?token_symbol=${encoded_symbol}`);

            const data = await res.json();

            if (data?.buckets) {
                const tokenData = {
                token: token_symbol,
                total: Object.values(data.buckets).reduce((a, b) => a + b, 0),
                intervals: {
                    "1h": data.buckets["1h"] ?? 0,
                    "6h": data.buckets["6h"] ?? 0,
                    "12h": data.buckets["12h"] ?? 0,
                    "24h": data.buckets["24h"] ?? 0,
                    "48h": data.buckets["48h"] ?? 0,
                },
                history: Object.values(data.buckets).slice(0, 7),
                };
                setWatchlist((prev) => [...prev, tokenData]);
            }
        } catch (err) {
            console.error("Error fetching token tweet buckets:", err);
        }

        setModalOpen(false);
        setLoadingToken(false);
    };

  return (
    <div className="bg-[#010409] min-h-screen text-gray-300">
      <Header />

      <div className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-green-400 mb-2 text-center">
          TwitterScan
        </h1>
        <p className="text-center text-sm text-gray-400 mb-6">
          Track Tweet Volume Over Time for Any Token
        </p>

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
              className="p-5 rounded-xl bg-gradient-to-br from-[#0A0F0A] to-[#031715] border border-green-700/30 shadow-xl hover:shadow-green-400/10 transition"
            >
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
                  labels: history.map((_, i) => `T-${i + 1}`),
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

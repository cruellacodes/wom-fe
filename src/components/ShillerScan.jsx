// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect, useRef } from "react";
import Header from "./Header";
import Footer from "./Footer";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { supabase } from "../lib/supabaseClient";



const ShillerScan = () => {
  const [searchInput, setSearchInput] = useState("");
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [allUsernames, setAllUsernames] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const cardRefs = useRef({});

  useEffect(() => {
    const fetchUsernames = async () => {
      const { data, error } = await supabase
        .from("tweets")
        .select("user_name");

      if (error) {
        console.error("Error fetching usernames:", error);
        return;
      }

      const usernames = [...new Set(
        data.map((t) => t.user_name?.trim().toLowerCase()).filter(Boolean)
      )];

      setAllUsernames(usernames);
    };

    fetchUsernames();
  }, []);

  useEffect(() => {
    if (!searchInput.trim()) {
      setSuggestions([]);
      return;
    }

    const normalizedSearch = searchInput.trim().toLowerCase().replace(/^@/, "");
    const matches = allUsernames
      .map((u) => u?.trim().toLowerCase())
      .filter(Boolean)
      .filter((u) => u.includes(normalizedSearch));

    setSuggestions(matches.slice(0, 5));
  }, [searchInput, allUsernames]);

  const handleSelectUser = async (usernameInput) => {
    const username = usernameInput.toLowerCase().replace(/^@/, "");
    setLoading(true);

    try {
      const { data: tweets, error } = await supabase
        .from("tweets")
        .select("tweet_url, token_symbol, user_name, profile_pic")
        .ilike("user_name", username);

      if (error || !tweets || tweets.length === 0) {
        alert("No tweets found for this user");
        return;
      }

      const tokenToUrls = {};
      let profile = "";

      tweets.forEach((t) => {
        const token = t.token_symbol?.toLowerCase();
        if (token) {
          if (!tokenToUrls[token]) tokenToUrls[token] = [];
          tokenToUrls[token].push(t.tweet_url);
        }
        if (t.profile_pic) profile = t.profile_pic;
      });

      setWatchlist((prev) => [
        ...prev,
        {
          username,
          profile,
          tokenToUrls,
        },
      ]);
    } catch (err) {
      console.error("User scan failed:", err);
    } finally {
      setLoading(false);
      setSearchInput("");
      setSuggestions([]);
    }
  };

  const handleRemove = (username) => {
    setWatchlist((prev) => prev.filter((u) => u.username !== username));
  };

  return (
    <div className="bg-[#0A0A0E] min-h-screen text-white font-mono tracking-widest relative">
      <Header />

      {/* BETA badge */}
      <div className="absolute top-3 right-4 bg-[#1E1E26] border border-[#2A2A2A] text-[10px] px-2 py-1 rounded-full text-[#4DFFFD] font-bold tracking-widest shadow-md">
        BETA
      </div>

      <div className="text-center pt-10 pb-6 px-4">
        <h1 className="text-2xl sm:text-3xl font-semibold">ShillerScan</h1>
        <p className="text-sm text-[#AAA] mt-2 font-light">
          Find if trending tokens are being promoted by your favorite shillers.
        </p>
      </div>

      <div className="flex justify-center mb-12 px-4">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSelectUser(searchInput.trim());
            }}
            placeholder="Search by Twitter username..."
            className="w-full px-4 py-2.5 rounded-full bg-[#14141A] border border-[#2A2A2A] text-white placeholder-[#777] focus:ring-2 focus:ring-cyan-300 outline-none font-mono tracking-widest"
          />
          {suggestions.length > 0 && (
            <ul className="absolute z-10 w-full bg-[#14141A] border border-[#2A2A2A] rounded-md mt-2 text-left overflow-hidden shadow-lg">
              {suggestions.map((s, i) => (
                <li
                  key={i}
                  onClick={() => handleSelectUser(s)}
                  className="px-4 py-2 cursor-pointer hover:bg-[#1F1F26] text-sm"
                >
                  @{s}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="px-6 max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-[#13131A] border border-[#2A2A2A] p-5 rounded-xl animate-pulse h-60 flex flex-col justify-between space-y-4"
            >
              <div className="h-4 w-24 bg-[#2A2A2A] rounded" />
              <div className="h-12 w-12 bg-[#2A2A2A] rounded-full" />
              <div className="space-y-2">
                <div className="h-3 w-28 bg-[#2A2A2A] rounded" />
                <div className="h-3 w-32 bg-[#2A2A2A] rounded" />
              </div>
            </div>
          ))
        ) : watchlist.length === 0 ? (
          <div className="col-span-full text-center text-[#777] italic mt-8">
            Search for a Twitter username to view their shilled tokens.
          </div>
        ) : (
          watchlist.map(({ username, profile, tokenToUrls }, index) => (
            <div
              key={index}
              ref={(el) => (cardRefs.current[username] = el)}
              className="relative bg-[#13131A] border border-[#2A2A2A] p-5 rounded-2xl shadow-md hover:shadow-[0_0_20px_#4DFFFD40] transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <img
                    src={profile}
                    alt={username}
                    className="w-10 h-10 rounded-full border border-[#444]"
                  />
                  <h2 className="text-base font-medium text-white">@{username}</h2>
                </div>
                <button
                  onClick={() => handleRemove(username)}
                  title="Remove"
                  className="text-[#888] hover:text-red-500 transition-all"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                {Object.entries(tokenToUrls).map(([token, links]) => (
                  <div
                    key={token}
                    className="flex justify-between items-center border-b border-[#2A2A2A] pb-1"
                  >
                    <div className="text-sm font-mono text-[#4DFFFD]">
                      {token}
                    </div>
                    <div className="flex gap-2">
                      {links.map((url, idx) => (
                        <a
                          key={idx}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:scale-110 transition-transform text-[#aaa] hover:text-white"
                          title="View tweet"
                        >
                          🔗
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      <Footer />
    </div>
  );
};

export default ShillerScan;

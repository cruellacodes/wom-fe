import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

export function useStoredTweets(tokens) {
  const [storedTweets, setStoredTweets] = useState([]);

  // Initial load
  useEffect(() => {
    if (!tokens.length) return;

    const fetchTweets = async () => {
      try {
        const tweetData = await Promise.all(
          tokens.map(async (token) => {
            const symbol = encodeURIComponent((token.token_symbol || token.Token)?.toLowerCase());
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/stored-tweets/?token_symbol=${symbol}`);
            const data = await res.json();
            return data.tweets?.map(tweet => ({
              ...tweet,
              token_symbol: decodeURIComponent(symbol),
            })) || [];
          })
        );
        setStoredTweets(tweetData.flat());
      } catch (err) {
        console.error("Error fetching tweets", err);
        setStoredTweets([]);
      }
    };

    fetchTweets();
  }, [tokens]);

  // Realtime tweet subscription
  useEffect(() => {
    const channel = supabase
      .channel("realtime-tweets")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "tweets" }, (payload) => {
        setStoredTweets((prev) => [...prev, payload.new]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return storedTweets;
}

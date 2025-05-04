import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import toast from "react-hot-toast";

export function useSupabaseSubscriptions() {
  const [tokens, setTokens] = useState([]);
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1️⃣ Initial fetch – only tweets from last 24h (UTC)
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const nowUTC = new Date().toISOString(); // current UTC time
        const twentyFourHoursAgoUTC = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

        const [{ data: initialTokens }, { data: initialTweets }] = await Promise.all([
          supabase.from("tokens").select("*").throwOnError(),
          supabase
            .from("tweets")
            .select("*")
            .gte("created_at", twentyFourHoursAgoUTC)
            .lt("created_at", nowUTC)
            .limit(1000)
            .throwOnError(),
        ]);

        setTokens(initialTokens || []);
        setTweets(initialTweets || []);
      } catch (err) {
        console.error("❌ Supabase fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // 2️⃣ Realtime token updates
  useEffect(() => {
    const channel = supabase
      .channel("realtime-tokens")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tokens" },
        ({ eventType, new: newToken, old: oldToken }) => {
          setTokens((prev) => {
            let updated = [...prev];
            switch (eventType) {
              case "INSERT":
                if (!updated.some((t) => t.token_symbol === newToken.token_symbol)) {
                  toast.success(`New token added: $${newToken.token_symbol.toUpperCase()}`);
                  updated.push(newToken);
                }
                break;
              case "UPDATE":
                updated = updated.map((t) =>
                  t.token_symbol === newToken.token_symbol ? newToken : t
                );
                break;
              case "DELETE":
                updated = updated.filter((t) => t.token_symbol !== oldToken.token_symbol);
                break;
            }
            return updated;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // 3️⃣ Realtime tweet inserts – 24h UTC filter
  useEffect(() => {
    const channel = supabase
      .channel("realtime-tweets")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "tweets" },
        ({ new: newTweet }) => {
          const tweetTimeUTC = new Date(newTweet.created_at).getTime();
          const now = Date.now();
          const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000;

          if (tweetTimeUTC >= twentyFourHoursAgo && tweetTimeUTC <= now) {
            setTweets((prev) => {
              const alreadyExists = prev.some((t) => t.id === newTweet.id);
              return alreadyExists ? prev : [...prev, newTweet];
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { tokens, tweets, loading };
}

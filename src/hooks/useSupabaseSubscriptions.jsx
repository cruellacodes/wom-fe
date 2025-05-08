import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import toast from "react-hot-toast";

const PAGE_SIZE = 500;

export function useSupabaseSubscriptions() {
  const [tokens, setTokens] = useState([]);
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1️. Initial fetch – only active tokens + paginated tweets
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch only active tokens
        const { data: initialTokens } = await supabase
          .from("tokens")
          .select("*")
          .eq("is_active", true)
          .throwOnError();
        setTokens(initialTokens || []);

        // Fetch tweets paginated
        let page = 0;
        let finished = false;

        const { data: firstPage } = await supabase
          .rpc("get_recent_tweets_for_active_tokens", {
            limit_count: PAGE_SIZE,
            offset_count: 0,
          })
          .throwOnError();
        setTweets(firstPage || []);

        page = 1;
        while (!finished) {
          const { data: nextPage } = await supabase
            .rpc("get_recent_tweets_for_active_tokens", {
              limit_count: PAGE_SIZE,
              offset_count: page * PAGE_SIZE,
            })
            .throwOnError();

          if (!nextPage || nextPage.length === 0) {
            finished = true;
          } else {
            setTweets((prev) => [...prev, ...nextPage]);
            page++;
          }
        }
      } catch (err) {
        console.error("Supabase fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // 2️. Realtime token updates
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
                if (newToken.is_active && !updated.some(t => t.token_symbol === newToken.token_symbol)) {
                  toast.custom(() => (
                    <div className="bg-[#0A0F0A] border border-green-400 text-green-300 px-4 py-3 rounded-lg shadow-md text-sm flex items-center space-x-2 animate-fadeIn">
                      <span>🚀</span>
                      <span>
                        New token added: <strong>${newToken.token_symbol.toUpperCase()}</strong>
                      </span>
                    </div>
                  ));
                  updated.push(newToken);
                }
                break;

              case "UPDATE":
                if (!newToken.is_active) {
                  updated = updated.filter(t => t.token_symbol !== newToken.token_symbol);
                } else {
                  updated = updated.map(t =>
                    t.token_symbol === newToken.token_symbol ? newToken : t
                  );
                }
                break;

              case "DELETE":
                updated = updated.filter(t => t.token_symbol !== oldToken.token_symbol);
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

  // 3️. Realtime tweet inserts – 24h filter
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

  return {
    tokens: tokens.filter((t) => t.is_active), // defensive filter
    tweets,
    loading,
  };
}

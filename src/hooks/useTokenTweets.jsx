import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const PAGE_SIZE = 500;

export function useTokenTweets() {
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTweets = async () => {
      try {
        let allTweets = [];
        let page = 0;
        let finished = false;

        while (!finished) {
          const { data } = await supabase
            .rpc("get_recent_tweets_for_active_tokens", {
              limit_count: PAGE_SIZE,
              offset_count: page * PAGE_SIZE,
            })
            .throwOnError();

          if (!data || data.length === 0) {
            finished = true;
          } else {
            allTweets = [...allTweets, ...data];
            page++;
          }
        }

        setTweets(allTweets);
      } catch (err) {
        console.error("Tweet fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTweets();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("realtime-tweets")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "tweets" },
        ({ new: newTweet }) => {
          const tweetTimeUTC = new Date(newTweet.created_at).getTime();
          const now = Date.now();
          const fortyEightHoursAgo = now - 48 * 60 * 60 * 1000; 
          if (tweetTimeUTC >= fortyEightHoursAgo && tweetTimeUTC <= now) {
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

  return { tweets, loading };
}

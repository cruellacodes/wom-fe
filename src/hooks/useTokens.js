import { useState, useEffect } from "react";
import { sortTokens } from "../utils";
import { supabase } from "../lib/supabaseClient";
import toast from "react-hot-toast";


export function useTokens(page = 1, onTopTokenFetched) {
    const [tokens, setTokens] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasFetched, setHasFetched] = useState(false);
  
    // 1. Fetch once and own the base dataset
    useEffect(() => {
      const fetchTokens = async () => {
        setLoading(true);
        try {
          const limit = 100;
          const query = `page=${page}&limit=${limit}&only_active=true`;
          const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/tokens?${query}`);
          const data = await res.json();
          if (data.tokens?.length) {
            setTokens(data.tokens); // ⬅️ base dataset
            setHasFetched(true);
          }
        } catch (err) {
          console.error("Token fetch error", err);
        }
        setLoading(false);
      };
  
      fetchTokens();
    }, [page]);
  
    // 2. Safe post-fetch callback
    useEffect(() => {
      if (hasFetched && tokens.length && onTopTokenFetched) {
        const sorted = sortTokens(tokens, "wom_score", -1);
        onTopTokenFetched(sorted[0]);
      }
    }, [hasFetched, tokens, onTopTokenFetched]);
  
    // 3. Live update patching — merge into current list, don't replace
    useEffect(() => {
      const channel = supabase
        .channel("realtime-tokens")
        .on("postgres_changes", { event: "*", schema: "public", table: "tokens" }, (payload) => {
          const { eventType, new: newToken, old: oldToken } = payload;
          console.log("[SUPABASE EVENT]", payload);
  
          setTokens((prev) => {
            let updated = [...prev];
            switch (eventType) {
              case "INSERT":
                if (!updated.some((t) => t.token_symbol === newToken.token_symbol)) {
                  toast.success(`New token added: $${newToken.token_symbol.toUpperCase()}`, {
                    position: "bottom-right",
                    style: {
                      background: "#0A0F0A",
                      color: "#00FFB2",
                      border: "1px solid #00FFB2",
                    },
                  });
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
        })
        .subscribe();
  
      return () => {
        supabase.removeChannel(channel);
      };
    }, []);
  
    return { tokens, loading, hasFetched };
  }
  
// eslint-disable-next-line no-unused-vars
import React, { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import toast from "react-hot-toast";

export function useActiveTokens() {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const shownToastTokens = useRef(new Set());

  useEffect(() => {
    const fetchTokens = async () => {
      try {
        const { data } = await supabase
          .from("tokens")
          .select("*")
          .eq("is_active", true)
          .throwOnError();
        setTokens(data || []);
        data?.forEach(t => shownToastTokens.current.add(t.token_symbol)); // mark as seen
      } catch (err) {
        console.error("Token fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTokens();
  }, []);

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
                if (newToken.is_active && !shownToastTokens.current.has(newToken.token_symbol)) {
                  toast.custom(() => (
                    <div className="w-[320px] bg-[#121212] border border-green-500/40 text-white px-4 py-3 rounded-xl shadow-lg backdrop-blur-sm flex flex-col gap-1 animate-fadeIn transition-all">
                      <span className="text-sm font-semibold tracking-wide text-green-400">
                        New Token Added
                      </span>
                      <span className="text-xs uppercase text-gray-300 tracking-widest">
                        {newToken.token_symbol}
                      </span>
                    </div>
                  ));                  
                  shownToastTokens.current.add(newToken.token_symbol);
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

  return { tokens, loading };
}

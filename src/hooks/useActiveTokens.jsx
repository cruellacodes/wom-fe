import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import toast from "react-hot-toast";

export function useActiveTokens() {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTokens = async () => {
      try {
        const { data } = await supabase
          .from("tokens")
          .select("*")
          .eq("is_active", true)
          .throwOnError();
        setTokens(data || []);
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
                if (newToken.is_active && !updated.some(t => t.token_symbol === newToken.token_symbol)) {
                  toast.custom(() => (
                    <div className="bg-[#0A0F0A] border border-green-400 text-green-300 px-4 py-3 rounded-lg shadow-md text-sm flex items-center space-x-2 animate-fadeIn">
                      <span>
                        New token added: <strong>{newToken.token_symbol.toUpperCase()}</strong>
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

  return { tokens, loading };
}

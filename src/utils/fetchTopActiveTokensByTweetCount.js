// utils/fetchTopActiveTokensByTweetCount.js

import { supabase } from "../lib/supabaseClient";

export async function fetchTopActiveTokensByTweetCount(hours = 24, limit = 3) {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

  const { data: activeTokens } = await supabase
    .from("tokens")
    .select("token_symbol")
    .eq("is_active", true);

  const activeSymbols = activeTokens?.map((t) => t.token_symbol.toLowerCase()) || [];

  const { data: tweets } = await supabase
    .from("tweets")
    .select("token_symbol")
    .in("token_symbol", activeSymbols)
    .gte("created_at", since);

  const counts = {};
  tweets.forEach(({ token_symbol }) => {
    const symbol = token_symbol.toUpperCase();
    counts[symbol] = (counts[symbol] || 0) + 1;
  });

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([symbol]) => symbol);
}

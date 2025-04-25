export const getTopTokensByTweetCount = (tokens, count = 3) => {
  return [...tokens]
    .sort((a, b) => (b.tweet_count ?? 0) - (a.tweet_count ?? 0))
    .slice(0, count);
};

export const getTopTokensByWomScore = (tokens, count = 5) => {
  return [...tokens]
    .sort((a, b) => (b.wom_score ?? 0) - (a.wom_score ?? 0))
    .slice(0, count);
};

export const sortTokens = (tokens, sortBy = "wom_score", sortOrder = -1) => {
  return [...tokens].sort((a, b) => {
    const aVal = a[sortBy] ?? 0;
    const bVal = b[sortBy] ?? 0;

    if (typeof aVal === "string" && typeof bVal === "string") {
      return sortOrder * aVal.localeCompare(bVal);
    }

    return sortOrder * (aVal - bVal);
  });
};

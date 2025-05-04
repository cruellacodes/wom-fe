import dayjs from "dayjs";

export const getTopTokensByTweetCount = (tokens, count = 3, tweets = [], filterLastHours = null) => {
// filter tweets to only include recent ones
  const filteredTweets = filterLastHours
    ? tweets.filter((t) => {
        const createdAt = dayjs.utc(t.created_at);
        return dayjs.utc().diff(createdAt, "hour") <= filterLastHours;
      })
    : tweets;

  // Count tweets per token
  const tweetMap = filteredTweets.reduce((acc, tweet) => {
    const symbol = tweet.token_symbol?.toLowerCase();
    if (!symbol) return acc;
    acc[symbol] = (acc[symbol] || 0) + 1;
    return acc;
  }, {});

  const enrichedTokens = tokens.map((token) => {
    const symbol = token.token_symbol?.toLowerCase();
    return {
      ...token,
      tweetVolume: tweetMap[symbol] || 0,
    };
  });

  return enrichedTokens
    .sort((a, b) => b.tweetVolume - a.tweetVolume)
    .slice(0, count);
};

export const getTopTokensByWomScore = (tokens, count = 5) => {
  return [...tokens]
    .sort((a, b) => (b.wom_score ?? 0) - (a.wom_score ?? 0))
    .slice(0, count);
};

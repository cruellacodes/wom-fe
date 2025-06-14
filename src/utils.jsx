// utils.jsx - Optimized version with native Date functions (NO dayjs)

export const getTopTokensByTweetCount = (tokens, count = 3, tweets = [], filterLastHours = null) => {
  // Filter tweets to only include recent ones
  const filteredTweets = filterLastHours
    ? tweets.filter((t) => {
        const createdAt = new Date(t.created_at);
        const now = new Date();
        const diffHours = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
        return diffHours <= filterLastHours;
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

// Additional utility functions for date handling
export const formatRelativeTime = (date) => {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffDays > 0) {
    return `${diffDays}d ago`;
  } else if (diffHours > 0) {
    return `${diffHours}h ago`;
  } else {
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    return diffMinutes > 0 ? `${diffMinutes}m ago` : 'Just now';
  }
};

export const isWithinLast24Hours = (date) => {
  const now = new Date();
  const diffHours = (now.getTime() - new Date(date).getTime()) / (1000 * 60 * 60);
  return diffHours <= 24;
};

export const formatDateString = (date, options = {}) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...options
  });
};
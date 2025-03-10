export const getTopTokensByTweetCount = (tokens, count = 3) => {
    return [...tokens]
      .sort((a, b) => b.TweetCount - a.TweetCount) // Sort by highest Tweet Count
      .slice(0, count); // Return top `count` tokens
};



export const getTopTokensByWomScore = (tokens, count = 5) => {
    return [...tokens]
      .sort((a, b) => b.WomScore - a.WomScore) // Sort by highest WOM Score
      .slice(0, count); // Return top `count` tokens
  };
  
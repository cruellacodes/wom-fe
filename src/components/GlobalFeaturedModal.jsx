/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useState, useEffect, useMemo, useRef } from 'react';
// eslint-disable-next-line no-unused-vars
import { XMarkIcon, StarIcon } from '@heroicons/react/24/outline';
import { Search } from 'lucide-react';
import solanaIcon from '../assets/solana.png';
import SimpleFeaturedPayment from './FeaturedPayment';

const GlobalFeaturedModal = ({ 
  isOpen, 
  onClose, 
  tokens = [], 
  featuredTokens = [], 
  onSelectToken, 
  onPaymentSuccess 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currentToken, setCurrentToken] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [waitingForAddress, setWaitingForAddress] = useState(false);
  const [lastSymbolAttempt, setLastSymbolAttempt] = useState('');
  const [isTokenFromAPI, setIsTokenFromAPI] = useState(false); // Track if token is from API
  
  const suggestionRefs = useRef([]);
  const searchIdRef = useRef(0);
  const lowerQuery = searchQuery.toLowerCase();

  const isProbablyAddress = (input) => input.length >= 30;

  // Filter out already featured tokens and create suggestions
  const availableTokens = useMemo(() => {
    const featuredAddresses = new Set(featuredTokens.map(ft => ft.address?.toLowerCase()));
    return tokens.filter(token => 
      !featuredAddresses.has(token.address?.toLowerCase())
    );
  }, [tokens, featuredTokens]);

  const matchedSuggestions = useMemo(() => {
    if (!lowerQuery) return [];
    
    return availableTokens
      .filter(({ token_symbol = "", token_name = "", address = "" }) =>
        token_symbol.toLowerCase().includes(lowerQuery) ||
        token_name.toLowerCase().includes(lowerQuery) ||
        address.toLowerCase().includes(lowerQuery)
      )
      .slice(0, 15);
  }, [availableTokens, lowerQuery]);

  useEffect(() => {
    setSuggestions(matchedSuggestions);
    setSelectedIndex(0);
  }, [matchedSuggestions]);

  useEffect(() => {
    const el = suggestionRefs.current[selectedIndex];
    if (el) {
      el.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [selectedIndex]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setWaitingForAddress(false);
      setLastSymbolAttempt("");
    }
  }, [searchQuery]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setSuggestions([]);
      setSelectedIndex(0);
      setShowPaymentModal(false);
      setCurrentToken(null);
      setIsSearching(false);
      setWaitingForAddress(false);
      setLastSymbolAttempt('');
      setIsTokenFromAPI(false);
    }
  }, [isOpen]);

  const fetchTokenInfo = async (input) => {
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/search-token/${input}`);
    if (!res.ok) throw new Error("Token not found");
    return await res.json();
  };

  // NEW: Function to add token to database after successful payment
  const addTokenToDatabase = async (tokenData) => {
    try {
      console.log('Adding token to database:', tokenData.token_symbol);
      
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/add-manual-tokens`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token_symbol: tokenData.token_symbol,
          address: tokenData.address,
          // Include other necessary data
          token_name: tokenData.token_name,
          market_cap_usd: tokenData.market_cap_usd,
          volume_usd: tokenData.volume_usd,
          liquidity_usd: tokenData.liquidity_usd,
          priceUsd: tokenData.priceUsd,
          dex_url: tokenData.dex_url,
          image_url: tokenData.image_url,
          age: tokenData.age,
          pricechange1h: tokenData.pricechange1h
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to add token: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✓ Token added to database successfully:', result);
      return result;

    } catch (error) {
      console.error('Failed to add token to database:', error);
      throw error;
    }
  };

  const handleSearch = async (input = searchQuery) => {
    if (!input) return;

    const lowerInput = input.toLowerCase();

    // First check if token exists in our database
    const match = availableTokens.find(
      (t) =>
        t.token_symbol?.toLowerCase() === lowerInput ||
        t.token_name?.toLowerCase() === lowerInput ||
        t.address?.toLowerCase() === lowerInput
    );

    if (match) {
      handleTokenSelect(match, false); // false = not from API
      return;
    }

    // If it's probably an address, fetch from backend
    if (isProbablyAddress(lowerInput)) {
      const currentId = ++searchIdRef.current;
      
      try {
        setIsSearching(true);
        const tokenData = await fetchTokenInfo(lowerInput);

        if (searchIdRef.current !== currentId) return;

        const tokenSymbolWithDollar = `$${tokenData.symbol.toLowerCase()}`;

        const fetchedToken = {
          token_symbol: tokenSymbolWithDollar,
          token_name: tokenData.token_name,
          address: tokenData.address,
          age: tokenData.age || "N/A",
          market_cap_usd: tokenData.marketCap || 0,
          volume_usd: tokenData.volume24h || 0,
          liquidity_usd: tokenData.liquidity || 0,
          priceUsd: tokenData.priceUsd || "N/A",
          dex_url: tokenData.dexUrl || "#",
          pricechange1h: tokenData.priceChange1h || 0,
          image_url: tokenData.imageUrl || solanaIcon,
          wom_score: 0, // Will be calculated after adding to DB
        };

        if (searchIdRef.current !== currentId) return;
        
        handleTokenSelect(fetchedToken, true); // true = from API
        setSearchQuery('');
        setSuggestions([]);
        setWaitingForAddress(false);
        setLastSymbolAttempt('');
        
      } catch (err) {
        if (searchIdRef.current === currentId) {
          console.error("Backend fetch failed:", err);
          setSuggestions([]);
          setWaitingForAddress(false);
          setLastSymbolAttempt('');
        }
      } finally {
        if (searchIdRef.current === currentId) {
          setIsSearching(false);
        }
      }
      return;
    }

    // If not an address and not found, show the waiting message
    setLastSymbolAttempt(input);
    setWaitingForAddress(true);
    setSuggestions([]);
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (suggestions.length > 0) {
        handleSearch(suggestions[selectedIndex].token_symbol);
      } else {
        handleSearch(searchQuery.trim());
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  // UPDATED: Track if token is from API
  const handleTokenSelect = (token, fromAPI = false) => {
    setCurrentToken(token);
    setIsTokenFromAPI(fromAPI);
    onSelectToken?.(token);
    setShowPaymentModal(true);
  };

  // UPDATED: Handle payment success with database addition and waiting queue
  const handlePaymentSuccess = async (paymentData) => {
    try {
      // If token was fetched from API, add it to database first
      if (isTokenFromAPI && currentToken) {
        console.log('Payment successful for API token, adding to database...');
        
        // Show loading state or notification here if needed
        await addTokenToDatabase(currentToken);
        
        console.log('✓ Token successfully added to database and tweet pipeline triggered');
      }

      // Check if all spots are full to determine if this goes to waiting queue
      const spotsAvailable = 3 - featuredTokens.length;
      const isWaitingQueue = spotsAvailable <= 0;
      
      if (isWaitingQueue) {
        console.log('All spots full - token will be added to waiting queue');
        // The payment component should handle this by setting spot_position to null
        // which puts it in the waiting queue for auto-promotion
      } else {
        console.log(`Token will be featured immediately in spot ${spotsAvailable}`);
      }
      
      // Close modals and reset state
      setShowPaymentModal(false);
      setCurrentToken(null);
      setIsTokenFromAPI(false);
      
      // Call the parent success handler
      onPaymentSuccess?.(paymentData);
      
    } catch (error) {
      console.error('Error in payment success flow:', error);
      
      // Still close the modals and notify parent, even if DB addition failed
      setShowPaymentModal(false);
      setCurrentToken(null);
      setIsTokenFromAPI(false);
      onPaymentSuccess?.(paymentData);
      
      // You might want to show an error message to the user here
      alert('Payment successful but failed to add token to database. Please contact support.');
    }
  };

  const handlePaymentClose = () => {
    setShowPaymentModal(false);
    setCurrentToken(null);
    setIsTokenFromAPI(false);
  };

  const handleClear = () => {
    setSearchQuery('');
    setSuggestions([]);
    setWaitingForAddress(false);
    setLastSymbolAttempt('');
    searchIdRef.current++;
    setIsSearching(false);
  };

  const formatMarketCap = (value) => {
    if (!value || value === 0) return 'N/A';
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(1)}K`;
    return `$${value.toFixed(2)}`;
  };

  const getWomScoreColor = (score) => {
    if (score >= 8) return 'text-green-400';
    if (score >= 6) return 'text-yellow-400';
    if (score >= 4) return 'text-orange-400';
    return 'text-red-400';
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-[#0A0F0A] border border-green-500/20 rounded-2xl p-6 max-w-2xl w-full relative shadow-2xl max-h-[90vh] overflow-hidden">
          
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition z-10"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>

          {/* Header - More minimal */}
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-green-300 mb-2">
              ⭐ Feature Token
            </h2>
            {featuredTokens.length < 3 ? (
              <p className="text-gray-400 text-sm">
                {3 - featuredTokens.length} spot{(3 - featuredTokens.length) !== 1 ? 's' : ''} available
              </p>
            ) : (
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-orange-900/20 border border-orange-500/30 rounded-full">
                  <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                  <span className="text-orange-300 text-sm font-medium">All Spots Currently Full</span>
                </div>
                <p className="text-gray-400 text-xs">
                  Pay now and your token will be automatically featured when the next spot opens!
                </p>
              </div>
            )}
          </div>

          {/* Search Bar - Cleaner design */}
          <div className="relative w-full mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="> search $token or paste address"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full pl-12 pr-12 py-3 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all duration-200 font-mono text-sm"
                autoFocus
                disabled={isSearching}
              />
              <Search
                size={18}
                className={`absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 ${isSearching ? 'animate-pulse' : ''}`}
              />
              
              {/* Clear button */}
              {searchQuery && (
                <button
                  onClick={handleClear}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-400 transition text-lg font-bold"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {/* Status Messages */}
          {isSearching && (
            <div className="mb-4 text-center">
              <div className="text-green-400 text-sm animate-pulse">
                🔍 Fetching token data...
              </div>
            </div>
          )}

          {waitingForAddress && (
            <div className="mb-4 text-center">
              <p className="text-xs text-yellow-400 font-mono">
                Couldn&apos;t find <span className="font-bold">${lastSymbolAttempt}</span>. Try pasting its token address.
              </p>
            </div>
          )}

          {/* Token List - More minimal */}
          <div className="max-h-80 overflow-y-auto">
            {suggestions.length > 0 ? (
              <div className="space-y-2">
                {suggestions.map((token, idx) => (
                  <div
                    key={token.address}
                    ref={(el) => (suggestionRefs.current[idx] = el)}
                    onClick={() => handleTokenSelect(token, false)}
                    className={`
                      cursor-pointer p-3 rounded-lg transition-all duration-200 border
                      hover:border-green-400/40 hover:bg-green-400/5
                      ${selectedIndex === idx 
                        ? 'border-green-400/40 bg-green-400/10' 
                        : 'border-[#2a2a2a] bg-[#1a1a1a]'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={token.image_url || solanaIcon}
                          alt={token.token_symbol}
                          className="w-8 h-8 rounded-full object-cover border border-gray-600"
                        />
                        <div>
                          <div className="text-white font-semibold text-sm">
                            {token.token_symbol}
                          </div>
                          <div className="text-gray-400 text-xs truncate max-w-40">
                            {token.token_name}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-white text-sm font-semibold">
                          {formatMarketCap(token.market_cap_usd)}
                        </div>
                        {token.wom_score !== undefined && (
                          <div className={`text-xs font-bold ${getWomScoreColor(token.wom_score)}`}>
                            WOM: {typeof token.wom_score === 'number' ? token.wom_score.toFixed(1) : token.wom_score}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-4xl mb-3 opacity-50">🔍</div>
                <div className="text-gray-400 text-sm mb-2">
                  {searchQuery ? 'No tokens found' : 'Start typing to search'}
                </div>
                <div className="text-gray-500 text-xs">
                  Search by symbol, name, or paste contract address
                </div>
              </div>
            )}
          </div>

          {/* Footer Info - Simplified */}
          {(suggestions.length > 0 || searchQuery) && (
            <div className="mt-4 pt-3 border-t border-[#2a2a2a]">
              <div className="text-center text-xs text-gray-500">
                ↑↓ navigate • Enter to select • Esc to close
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && currentToken && (
        <SimpleFeaturedPayment
          isOpen={showPaymentModal}
          onClose={handlePaymentClose}
          userToken={currentToken}
          onPaymentSuccess={handlePaymentSuccess}
          isTokenFromAPI={isTokenFromAPI} 
        />
      )}
    </>
  );
};

export default GlobalFeaturedModal;
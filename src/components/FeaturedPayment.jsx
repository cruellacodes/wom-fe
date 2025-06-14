/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
// components/SimpleFeaturedPayment.js 
import React, { useState, useEffect, useRef } from 'react';
import { XMarkIcon, StarIcon } from '@heroicons/react/24/outline';
import { supabase } from '../lib/supabaseClient';

const SimpleFeaturedPayment = ({ isOpen, onClose, userToken, onPaymentSuccess }) => {
  const [selectedDuration, setSelectedDuration] = useState(12);
  const [checkoutLoaded, setCheckoutLoaded] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [nextAvailableSlot, setNextAvailableSlot] = useState(null);
  const [availableSpots, setAvailableSpots] = useState(3);
  const [loading, setLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState(false);
  const checkoutRef = useRef(null);
  const newTabCheckoutRef = useRef(null);

  // Duration options with original and discounted pricing
  const durations = [
    { 
      hours: 3, 
      originalPrice: 1.6, 
      price: 0.80, 
      label: '3 hours', 
      popular: false,
      discountPercent: 50
    },
    { 
      hours: 6, 
      originalPrice: 3, 
      price: 1.50, 
      label: '6 hours', 
      popular: false,
      discountPercent: 50
    },
    { 
      hours: 12, 
      originalPrice: 5.6, 
      price: 2.80, 
      label: '12 hours', 
      popular: true,
      discountPercent: 50
    },
    { 
      hours: 24, 
      originalPrice: 9.5, 
      price: 4.75, 
      label: '24 hours', 
      popular: false,
      discountPercent: 50
    }
  ];

  const selectedOption = durations.find(d => d.hours === selectedDuration);
  const HELIO_PAY_LINK_ID = "684c58d54cae8220fb6ca9e3";

  // Check available spots and calculate next slot
  useEffect(() => {
    if (isOpen) {
      checkAvailableSpots();
    }
  }, [isOpen]);

  const checkAvailableSpots = async () => {
    try {
      const now = new Date().toISOString();
      
      // Get currently active featured spots
      const { data: activeSpots } = await supabase
        .from('featured_spots')
        .select('*')
        .eq('is_active', true)
        .gt('featured_until', now)
        .not('spot_position', 'is', null)
        .order('featured_until', { ascending: true });

      const activeSpotsCount = activeSpots?.length || 0;
      setAvailableSpots(3 - activeSpotsCount);

      // Calculate next available slot time
      if (activeSpotsCount >= 3) {
        // All spots full - find earliest expiring spot
        const earliestExpiring = activeSpots[0];
        setNextAvailableSlot(new Date(earliestExpiring.featured_until));
      } else {
        // Spots available now
        setNextAvailableSlot(null);
      }
    } catch (error) {
      console.error('Error checking available spots:', error);
    }
  };

  const calculateScheduledTime = () => {
    if (availableSpots > 0) {
      // Spot available now
      return new Date();
    } else {
      // Schedule after current spots expire
      return nextAvailableSlot;
    }
  };

  const getTimeUntilSlot = () => {
    if (availableSpots > 0) return null;
    
    if (!nextAvailableSlot) return null;
    
    const now = new Date();
    const diff = nextAvailableSlot - now;
    
    if (diff <= 0) return 'Available now';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // Load Helio checkout when component mounts
  useEffect(() => {
    if (showCheckout && !checkoutLoaded && !checkoutError) {
      loadHelioCheckout();
    }
  }, [showCheckout, checkoutLoaded, checkoutError]);

  // Reset when modal closes
  useEffect(() => {
    if (!isOpen) {
      setShowCheckout(false);
      setCheckoutLoaded(false);
      setCheckoutError(false);
    }
  }, [isOpen]);

  const loadHelioCheckout = () => {
    // Load Helio script dynamically
    const script = document.createElement('script');
    script.src = 'https://embed.hel.io/assets/index-v1.js';
    script.type = 'module';
    script.crossOrigin = 'anonymous';
    
    script.onload = () => {
      console.log('Helio script loaded');
      setTimeout(() => {
        initializeHelioCheckout();
      }, 500); // Small delay to ensure script is fully ready
    };

    script.onerror = (error) => {
      console.error('Failed to load Helio script:', error);
      setCheckoutError(true);
      setCheckoutLoaded(false);
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup script when component unmounts
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  };

  const initializeHelioCheckout = () => {
    if (window.helioCheckout && checkoutRef.current) {
      try {
        // Clear any existing content
        checkoutRef.current.innerHTML = '';

        // Initialize Helio embedded checkout
        window.helioCheckout(checkoutRef.current, {
          paylinkId: HELIO_PAY_LINK_ID,
          theme: { 
            themeMode: "dark",
            primaryColor: "#10b981"
          },
          amount: selectedOption?.price?.toString(),
          onSuccess: (data) => {
            console.log('Payment successful:', data);
            handlePaymentSuccess(data);
          },
          onError: (error) => {
            console.error('Payment failed:', error);
            setCheckoutError(true);
          }
        });

        setCheckoutLoaded(true);
        setCheckoutError(false);
      } catch (error) {
        console.error('Failed to initialize Helio checkout:', error);
        setCheckoutError(true);
        setCheckoutLoaded(false);
      }
    } else {
      console.error('Helio checkout not available or container not found');
      setTimeout(() => {
        if (window.helioCheckout && checkoutRef.current) {
          initializeHelioCheckout();
        } else {
          setCheckoutError(true);
        }
      }, 1000);
    }
  };

  const initializeNewTabCheckout = () => {
    if (window.helioCheckout && newTabCheckoutRef.current) {
      try {
        // Clear any existing content
        newTabCheckoutRef.current.innerHTML = '';

        // Initialize Helio new-tab checkout (this creates a button that opens a proper charge page)
        window.helioCheckout(newTabCheckoutRef.current, {
          paylinkId: HELIO_PAY_LINK_ID,
          display: "new-tab", // This is the key difference!
          theme: { 
            themeMode: "dark",
            primaryColor: "#10b981"
          },
          amount: selectedOption?.price?.toString(),
          onSuccess: (data) => {
            console.log('Payment successful:', data);
            handlePaymentSuccess(data);
          },
          onError: (error) => {
            console.error('Payment failed:', error);
          }
        });

        console.log('New tab checkout initialized');
      } catch (error) {
        console.error('Failed to initialize new tab checkout:', error);
      }
    }
  };

  const handlePaymentSuccess = async (paymentData) => {
    setLoading(true);
    
    try {
      const scheduledStart = calculateScheduledTime();
      const featuredUntil = new Date(scheduledStart.getTime() + (selectedDuration * 60 * 60 * 1000));
      
      // Insert into database
      const { data, error } = await supabase
        .from('featured_spots')
        .insert({
          token_symbol: userToken.token_symbol,
          token_data: userToken,
          featured_until: featuredUntil.toISOString(),
          duration_hours: selectedDuration,
          price_sol: selectedOption?.price,
          payment_signature: paymentData?.signature || 'helio_payment_' + Date.now(),
          spot_position: availableSpots > 0 ? (4 - availableSpots) : null // Assign position if available
        })
        .select()
        .single();

      if (error) throw error;

      // Call success callback
      onPaymentSuccess?.({
        token: userToken,
        duration: selectedDuration,
        price: selectedOption?.price,
        scheduledFor: scheduledStart,
        featuredUntil,
        paymentData
      });
      
      onClose();
    } catch (error) {
      console.error('Database insert failed:', error);
      alert('Payment processed but failed to update database. Please contact support.');
    } finally {
      setLoading(false);
    }
  };

  // Initialize new tab checkout when needed
  const setupNewTabCheckout = () => {
    if (window.helioCheckout) {
      setTimeout(() => {
        initializeNewTabCheckout();
      }, 100);
    } else {
      // Load script first if not available
      const script = document.createElement('script');
      script.src = 'https://embed.hel.io/assets/index-v1.js';
      script.type = 'module';
      script.crossOrigin = 'anonymous';
      
      script.onload = () => {
        setTimeout(() => {
          initializeNewTabCheckout();
        }, 500);
      };

      document.head.appendChild(script);
    }
  };

  // Retry checkout loading
  const retryCheckout = () => {
    setCheckoutError(false);
    setCheckoutLoaded(false);
    setTimeout(() => {
      loadHelioCheckout();
    }, 100);
  };

  if (!isOpen) return null;

  const price = selectedOption?.price;
  const timeUntilSlot = getTimeUntilSlot();
  const scheduledTime = calculateScheduledTime();

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0A0F0A] border border-[#1b1b1b] rounded-2xl p-6 max-w-md w-full relative shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition z-10"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>

        {!showCheckout ? (
          <>
            {/* Header */}
            <div className="text-center mb-6">
              <div className="text-2xl mb-2">⭐</div>
              <h3 className="text-xl font-bold text-green-300 mb-2">
                Feature Your Token
              </h3>
              <p className="text-gray-400 text-sm">
                Boost &quot;{userToken?.token_symbol?.toUpperCase()}&quot; to the top 3 featured spots
              </p>
            </div>

            {/* Launch Promo Banner */}
            <div className="mb-6 p-3 rounded-xl bg-gradient-to-r from-orange-600/20 to-yellow-600/20 border border-orange-500/30">
              <div className="text-center">
                <div className="text-orange-400 font-bold text-sm mb-1">
                  LAUNCH PROMO - LIMITED TIME
                </div>
                <div className="text-yellow-300 text-xs">
                  Save 50% on all featured spots!
                </div>
              </div>
            </div>

            {/* Availability Status */}
            <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-[#1a1a1a] to-[#0f1b15] border border-[#2a2a2a]">
              {availableSpots > 0 ? (
                <div className="text-center">
                  <div className="text-green-400 font-semibold mb-2">
                    🟢 {availableSpots} Spot{availableSpots > 1 ? 's' : ''} Available
                  </div>
                  <div className="text-gray-300 text-sm">
                    Your token will be featured immediately!
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="text-yellow-400 font-semibold mb-2">
                    🟡 All Spots Currently Full
                  </div>
                  <div className="text-gray-300 text-sm mb-2">
                    Next available spot in: <span className="text-yellow-400 font-mono">{timeUntilSlot}</span>
                  </div>
                  <div className="text-gray-400 text-xs">
                    Pay now and your token will be automatically featured when the spot opens!
                  </div>
                </div>
              )}
            </div>

            {/* Duration Selection */}
            <div className="space-y-3 mb-6">
              <h4 className="text-green-300 font-medium mb-3">Choose Duration:</h4>
              {durations.map(duration => (
                <div
                  key={duration.hours}
                  onClick={() => setSelectedDuration(duration.hours)}
                  className={`
                    relative border-2 rounded-lg p-4 cursor-pointer transition-all
                    ${selectedDuration === duration.hours
                      ? 'border-green-400 bg-green-400/10'
                      : 'border-[#2a2a2a] hover:border-green-300/50'
                    }
                  `}
                >
                  {duration.popular && (
                    <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                      POPULAR
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-white font-medium">{duration.label}</div>
                      <div className="text-gray-400 text-sm">Featured placement</div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 text-sm line-through">
                          {duration.originalPrice} SOL
                        </span>
                        <span className="text-green-300 font-bold text-lg">
                          {duration.price} SOL
                        </span>
                      </div>
                      <div className="text-orange-400 text-xs font-medium">
                        -{duration.discountPercent}% OFF
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Scheduling Info */}
            <div className="mb-6 p-3 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a]">
              <div className="text-sm text-gray-300">
                <div className="flex justify-between mb-1">
                  <span>Scheduled Start:</span>
                  <span className="text-green-400">
                    {availableSpots > 0 ? 'Immediately' : scheduledTime?.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Featured Until:</span>
                  <span className="text-green-400">
                    {new Date(scheduledTime?.getTime() + (selectedDuration * 60 * 60 * 1000)).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Continue to Payment Button */}
            <button
              onClick={() => setShowCheckout(true)}
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              Continue to Payment - {selectedOption?.price} SOL
              <span className="text-green-200 text-sm ml-1">
                (Save {((selectedOption?.originalPrice - selectedOption?.price) || 0).toFixed(2)} SOL)
              </span>
            </button>

            {/* Info */}
            <div className="mt-4 text-xs text-gray-500 text-center space-y-1">
              <p>• {availableSpots > 0 ? 'Automatic placement in top 3 spots' : 'Automatic placement when spot becomes available'}</p>
              <p>• Payment via Solana/USDC and 100+ cryptos</p>
              <p>• {availableSpots > 0 ? 'Instant activation after payment confirmation' : 'Queue position secured immediately'}</p>
              <p>• 100% of the revenue is used to buyback and burn $WOM</p>
            </div>
          </>
        ) : (
          <>
            {/* Checkout View */}
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-green-300 mb-2">
                Complete Payment
              </h3>
              <p className="text-gray-400 text-sm">
                {selectedOption?.label} featured placement for {selectedOption?.price} SOL
              </p>
              <p className="text-orange-400 text-xs mt-1">
                Launch Promo: Save {((selectedOption?.originalPrice - selectedOption?.price) || 0).toFixed(2)} SOL (-{selectedOption?.discountPercent}%)
              </p>
              {availableSpots === 0 && (
                <p className="text-yellow-400 text-xs mt-2">
                  ⏱️ Will be featured in {timeUntilSlot}
                </p>
              )}
            </div>

            {/* Helio Checkout Container */}
            <div className="mb-4">
              {checkoutError ? (
                <div className="min-h-[400px] bg-[#111] rounded-lg flex flex-col items-center justify-center p-6 border border-red-500/30">
                  <div className="text-red-400 text-center mb-4">
                    <svg className="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm">Failed to load payment checkout</p>
                  </div>
                  <button
                    onClick={retryCheckout}
                    className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg text-sm transition mb-3"
                  >
                    Retry Checkout
                  </button>
                  <p className="text-gray-400 text-xs text-center">
                    Or use the new tab payment method below
                  </p>
                </div>
              ) : (
                <>
                  <div 
                    ref={checkoutRef}
                    id="helioCheckoutContainer"
                    className="min-h-[400px] rounded-lg"
                  />
                  
                  {!checkoutLoaded && !checkoutError && (
                    <div className="flex items-center justify-center min-h-[400px] bg-[#111] rounded-lg">
                      <div className="text-gray-400 flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-400"></div>
                        Loading secure checkout...
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Payment Options */}
            <div className="space-y-3">
              <button
                onClick={() => setShowCheckout(false)}
                disabled={loading}
                className="w-full border border-[#2a2a2a] text-gray-400 hover:text-white hover:border-gray-400 py-2 px-4 rounded-lg transition disabled:opacity-50"
              >
                ← Back to Options
              </button>
              
              {/* New Tab Checkout - Using Helio's proper new-tab display option */}
              <div className="border border-blue-500/30 rounded-lg p-4 bg-blue-500/10">
                <div className="text-center mb-3">
                  <h4 className="text-blue-300 font-medium text-sm mb-1">Alternative Payment Method</h4>
                  <p className="text-gray-400 text-xs">
                    Opens a secure Helio payment page in a new tab
                  </p>
                </div>
                
                {/* Container for Helio's new-tab checkout button */}
                <div 
                  ref={newTabCheckoutRef}
                  id="helioNewTabContainer"
                  className="flex justify-center"
                />
                
                <button
                  onClick={setupNewTabCheckout}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 px-4 rounded-lg transition text-sm disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
                  disabled={loading}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                    <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                  </svg>
                  Setup New Tab Payment
                </button>
              </div>
              
              <p className="text-xs text-gray-500 text-center">
                Having trouble? The new tab method opens Helio&apos;s secure payment page with proper session handling.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SimpleFeaturedPayment;
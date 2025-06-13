/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
// components/SimpleFeaturedPayment.js
import React, { useState, useEffect } from 'react';
import { XMarkIcon, StarIcon } from '@heroicons/react/24/outline';

const SimpleFeaturedPayment = ({ isOpen, onClose, userToken, onPaymentSuccess }) => {
  const [selectedDuration, setSelectedDuration] = useState(12);

  // Duration options with pricing
  const durations = [
    { hours: 3, price: 5.00, label: '3 hours', popular: false },
    { hours: 6, price: 8.00, label: '6 hours', popular: false },
    { hours: 12, price: 15.00, label: '12 hours', popular: true },
    { hours: 24, price: 25.00, label: '24 hours', popular: false }
  ];

  const selectedOption = durations.find(d => d.hours === selectedDuration);


  const HELIO_PAY_LINK_ID = "684c58d54cae8220fb6ca9e3"; 

  const handlePayment = () => {
    // Method 1: Open Helio payment in new window
    const helioUrl = `https://app.hel.io/pay/${HELIO_PAY_LINK_ID}?amount=${selectedOption?.price}`;
    
    // Open payment window
    const paymentWindow = window.open(
      helioUrl, 
      'helio-payment', 
      'width=500,height=700,scrollbars=yes,resizable=yes'
    );

    // Simulate payment success after window closes (for demo)
    // In production, you'd handle this via webhooks or postMessage
    const checkClosed = setInterval(() => {
      if (paymentWindow.closed) {
        clearInterval(checkClosed);
        
        // Ask user if payment was successful (temporary solution)
        const confirmed = window.confirm(
          'Did you complete the payment successfully? Click OK if yes, Cancel if no.'
        );
        
        if (confirmed) {
          // Create featured token data
          const featuredUntil = new Date(Date.now() + (selectedDuration * 60 * 60 * 1000));
          
          const featuredToken = {
            ...userToken,
            is_featured: true,
            featured_until: featuredUntil,
            featured_duration_hours: selectedDuration,
            featured_price: selectedOption?.price,
            featured_at: new Date()
          };

          onPaymentSuccess?.({
            token: featuredToken,
            duration: selectedDuration,
            price: selectedOption?.price
          });
          
          onClose();
        }
      }
    }, 1000);

    // Clean up if modal is closed
    const cleanup = () => {
      clearInterval(checkClosed);
      if (!paymentWindow.closed) {
        paymentWindow.close();
      }
    };

    // Add cleanup to close handler
    window.addEventListener('beforeunload', cleanup);
    
    return cleanup;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0A0F0A] border border-[#1b1b1b] rounded-2xl p-6 max-w-md w-full relative shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>

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
                <div className="text-green-300 font-bold text-lg">
                  ${duration.price}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Payment Button */}
        <button
          onClick={handlePayment}
          className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
          Pay ${selectedOption?.price} USDC
        </button>

        {/* Info */}
        <div className="mt-4 text-xs text-gray-500 text-center space-y-1">
          <p>• Automatic placement in top 3 spots</p>
          <p>• Payment via Solana/USDC and 100+ cryptos</p>
          <p>• Instant activation after payment confirmation</p>
        </div>
        
      </div>
    </div>
  );
};

export default SimpleFeaturedPayment;
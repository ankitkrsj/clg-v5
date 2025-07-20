import React, { useEffect } from 'react';
import { Trophy, TrendingDown, Sparkles, X } from 'lucide-react';

interface BetResultProps {
  winningNumber: number;
  winningColor: 'red' | 'green';
  winningSize: 'big' | 'small';
  isWin: boolean;
  payout: number;
  betType: string;
  betValue: string;
  onClose: () => void;
}

export function BetResult({ 
  winningNumber, 
  winningColor, 
  winningSize, 
  isWin, 
  payout, 
  betType, 
  betValue, 
  onClose 
}: BetResultProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const getNumberColor = (num: number) => {
    if (num === 0) return 'bg-green-500';
    return num % 2 === 0 ? 'bg-red-500' : 'bg-green-500';
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a2c38] border border-[#2f4553] rounded-2xl p-8 max-w-md w-full text-center relative overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#b1bad3] hover:text-white transition-all"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Animated background */}
        {isWin && (
          <div className="absolute inset-0 bg-gradient-to-r from-[#00d4aa]/10 to-[#00b4d8]/10 animate-pulse" />
        )}
        
        <div className="relative z-10">
          <div className="mb-6">
            {isWin ? (
              <div className="w-20 h-20 bg-gradient-to-r from-[#00d4aa] to-[#00b4d8] rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <Trophy className="h-10 w-10 text-white" />
              </div>
            ) : (
              <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingDown className="h-10 w-10 text-white" />
              </div>
            )}
            
            <h2 className={`text-3xl font-bold mb-4 ${isWin ? 'text-[#00d4aa]' : 'text-red-400'}`}>
              {isWin ? '🎉 Congratulations!' : '😔 Better Luck Next Time'}
            </h2>
            
            {/* Game Result */}
            <div className="bg-[#0f212e] border border-[#2f4553] rounded-xl p-4 mb-4">
              <h3 className="text-white font-bold mb-3">Game Result</h3>
              <div className="flex items-center justify-center space-x-6">
                <div className="text-center">
                  <p className="text-[#b1bad3] text-sm mb-2">Number</p>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${getNumberColor(winningNumber)}`}>
                    {winningNumber}
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-[#b1bad3] text-sm mb-2">Color</p>
                  <p className="text-white font-bold capitalize">{winningColor}</p>
                </div>
                <div className="text-center">
                  <p className="text-[#b1bad3] text-sm mb-2">Size</p>
                  <p className="text-white font-bold capitalize">{winningSize}</p>
                </div>
              </div>
            </div>

            {/* Your Bet */}
            <div className="bg-[#0f212e] border border-[#2f4553] rounded-xl p-4 mb-4">
              <h3 className="text-white font-bold mb-2">Your Bet</h3>
              <p className="text-[#b1bad3]">
                You bet on <span className="text-white font-medium">{betType}: {betValue}</span>
              </p>
            </div>
            
            {isWin && (
              <div className="flex items-center justify-center space-x-2 mb-6">
                <Sparkles className="h-5 w-5 text-[#00d4aa]" />
                <p className="text-2xl font-bold text-[#00d4aa]">
                  +${payout.toFixed(2)}
                </p>
                <Sparkles className="h-5 w-5 text-[#00d4aa]" />
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-[#00d4aa] to-[#00b4d8] hover:from-[#00c49a] hover:to-[#00a4c8] text-[#0f212e] font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105"
          >
            Continue Playing
          </button>
        </div>
      </div>
    </div>
  );
}
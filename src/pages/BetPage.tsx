import React, { useState } from 'react';
import { useWallet } from '../hooks/useWallet';
import { useBets } from '../hooks/useBets';
import { ColorButton } from '../components/ColorButton';
import { BetResult } from '../components/BetResult';
import { ColorOption } from '../types/database';
import { DollarSign, Gamepad2, Zap, Target } from 'lucide-react';

export function BetPage() {
  const { wallet, updateBalance } = useWallet();
  const { placeBet } = useBets();
  
  const [selectedColor, setSelectedColor] = useState<ColorOption | null>(null);
  const [betAmount, setBetAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    winningColor: ColorOption;
    isWin: boolean;
    payout: number;
  } | null>(null);

  const colors: ColorOption[] = ['red', 'green', 'blue', 'yellow'];
  const maxBet = wallet?.balance || 0;

  const handlePlaceBet = async () => {
    if (!selectedColor || !betAmount || !wallet) return;

    const amount = parseFloat(betAmount);
    if (amount <= 0 || amount > wallet.balance) return;

    try {
      setLoading(true);
      
      // Place the bet and get result
      const betResult = await placeBet(selectedColor, amount);
      
      // Update wallet balance
      const newBalance = wallet.balance + (betResult.isWin ? betResult.payout - amount : -amount);
      await updateBalance(newBalance);
      
      // Show result
      setResult(betResult);
      
      // Reset form
      setSelectedColor(null);
      setBetAmount('');
    } catch (error) {
      console.error('Error placing bet:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-[#00d4aa] to-[#00b4d8] rounded-xl flex items-center justify-center">
            <Gamepad2 className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white">Color Game</h1>
        </div>
        <p className="text-[#b1bad3] text-lg">Pick a color and place your bet</p>
        <div className="flex items-center justify-center space-x-2 mt-2">
          <Zap className="h-4 w-4 text-[#00d4aa]" />
          <span className="text-[#00d4aa] font-medium">3x multiplier on wins</span>
        </div>
      </div>

      {/* Game Board */}
      <div className="bg-[#1a2c38] border border-[#2f4553] rounded-2xl p-8">
        {/* Color Selection */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-6 text-center flex items-center justify-center space-x-2">
            <Target className="h-5 w-5 text-[#00d4aa]" />
            <span>Choose Your Color</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 justify-items-center">
            {colors.map((color) => (
              <ColorButton
                key={color}
                color={color}
                selected={selectedColor === color}
                onClick={() => setSelectedColor(color)}
                disabled={loading}
              />
            ))}
          </div>
        </div>

        {/* Bet Amount */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-white mb-4 text-center">Bet Amount</h3>
          <div className="max-w-sm mx-auto">
            <div className="relative mb-4">
              <DollarSign className="absolute left-4 top-4 h-5 w-5 text-[#b1bad3]" />
              <input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                min="0.01"
                max={maxBet}
                step="0.01"
                disabled={loading}
                className="w-full pl-12 pr-4 py-4 text-lg bg-[#0f212e] border border-[#2f4553] rounded-xl text-white placeholder-[#b1bad3] focus:outline-none focus:ring-2 focus:ring-[#00d4aa] focus:border-transparent text-center"
                placeholder="0.00"
              />
            </div>
            
            {/* Quick bet buttons */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              {[1, 5, 10, 25].map((amount) => (
                <button
                  key={amount}
                  onClick={() => setBetAmount(Math.min(amount, maxBet).toString())}
                  disabled={loading || amount > maxBet}
                  className="px-3 py-2 bg-[#2f4553] hover:bg-[#3a5664] text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  ${amount}
                </button>
              ))}
            </div>
            
            <div className="text-center">
              <p className="text-[#b1bad3] text-sm">
                Balance: <span className="text-[#00d4aa] font-medium">${wallet?.balance.toFixed(2) || '0.00'}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Bet Summary */}
        {selectedColor && betAmount && (
          <div className="mb-6 p-4 bg-[#0f212e] border border-[#2f4553] rounded-xl max-w-md mx-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[#b1bad3]">Betting on:</span>
              <div className="flex items-center space-x-2">
                <div className={`w-4 h-4 rounded-full ${
                  selectedColor === 'red' ? 'bg-red-500' :
                  selectedColor === 'green' ? 'bg-emerald-500' :
                  selectedColor === 'blue' ? 'bg-blue-500' :
                  'bg-yellow-500'
                }`} />
                <span className="text-white font-medium capitalize">{selectedColor}</span>
              </div>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[#b1bad3]">Bet amount:</span>
              <span className="text-white font-medium">${parseFloat(betAmount || '0').toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#b1bad3]">Potential win:</span>
              <span className="text-[#00d4aa] font-bold">${(parseFloat(betAmount || '0') * 3).toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* Bet Button */}
        <div className="text-center">
          <button
            onClick={handlePlaceBet}
            disabled={!selectedColor || !betAmount || loading || parseFloat(betAmount || '0') > maxBet || parseFloat(betAmount || '0') <= 0}
            className="bg-gradient-to-r from-[#00d4aa] to-[#00b4d8] hover:from-[#00c49a] hover:to-[#00a4c8] disabled:from-[#2f4553] disabled:to-[#2f4553] text-[#0f212e] disabled:text-[#b1bad3] font-bold py-4 px-12 rounded-xl transition-all disabled:cursor-not-allowed text-lg transform hover:scale-105 disabled:hover:scale-100"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 border-2 border-[#0f212e] border-t-transparent rounded-full animate-spin" />
                <span>Spinning...</span>
              </div>
            ) : (
              'Place Bet'
            )}
          </button>
        </div>
      </div>

      {result && (
        <BetResult
          winningColor={result.winningColor}
          isWin={result.isWin}
          payout={result.payout}
          onClose={() => setResult(null)}
        />
      )}
    </div>
  );
}
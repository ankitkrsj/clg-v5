import React, { useState, useEffect } from 'react';
import { useGame } from '../hooks/useGame';
import { useWallet } from '../hooks/useWallet';
import { BetResult } from '../components/BetResult';
import { BetType } from '../types/database';
import { Clock, Gamepad2, Target, Palette, Zap, Trophy, AlertCircle } from 'lucide-react';

export function GamePage() {
  const { currentGame, timeLeft, placeBet, loading: gameLoading } = useGame();
  const { wallet, refetch: refetchWallet } = useWallet();
  
  const [selectedBetType, setSelectedBetType] = useState<BetType>('number');
  const [selectedValue, setSelectedValue] = useState<string>('');
  const [betAmount, setBetAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [betPlaced, setBetPlaced] = useState(false);
  const [gameResult, setGameResult] = useState<{
    winningNumber: number;
    winningColor: 'red' | 'green';
    winningSize: 'big' | 'small';
    isWin: boolean;
    payout: number;
    betType: string;
    betValue: string;
  } | null>(null);
  const [lastGameId, setLastGameId] = useState<string | null>(null);

  const numbers = Array.from({ length: 10 }, (_, i) => i);
  const colors = ['red', 'green'];
  const sizes = ['small', 'big'];

  // Reset bet placed status when new game starts
  useEffect(() => {
    if (currentGame) {
      setBetPlaced(false);
      
      // Check if game just completed and show result
      if (currentGame.status === 'completed' && 
          currentGame._id !== lastGameId && 
          currentGame.resultNumber !== undefined &&
          betPlaced) {
        
        // Determine if user won based on their bet
        let isWin = false;
        let multiplier = 1;
        
        if (selectedBetType && selectedValue) {
          switch (selectedBetType) {
            case 'number':
              isWin = parseInt(selectedValue) === currentGame.resultNumber;
              multiplier = 9;
              break;
            case 'color':
              isWin = selectedValue === currentGame.resultColor;
              multiplier = 2;
              break;
            case 'size':
              isWin = selectedValue === currentGame.resultSize;
              multiplier = 2;
              break;
          }
        }
        
        const betAmountNum = parseFloat(betAmount || '0');
        const payout = isWin ? betAmountNum * multiplier : 0;
        
        setGameResult({
          winningNumber: currentGame.resultNumber,
          winningColor: currentGame.resultColor!,
          winningSize: currentGame.resultSize!,
          isWin,
          payout,
          betType: selectedBetType || '',
          betValue: selectedValue || '',
        });
      }
      
      setLastGameId(currentGame._id);
    }
  }, [currentGame?._id, currentGame?.status, currentGame?.resultNumber]);

  const getNumberColor = (num: number) => {
    if (num === 0) return 'bg-green-500';
    return num % 2 === 0 ? 'bg-red-500' : 'bg-green-500';
  };

  const handlePlaceBet = async () => {
    if (!selectedValue || !betAmount || !currentGame || !wallet) return;

    const amount = parseFloat(betAmount);
    if (amount <= 0 || amount > wallet.balance) {
      alert('Invalid bet amount or insufficient balance');
      return;
    }

    try {
      setLoading(true);
      await placeBet(selectedBetType, selectedValue, amount);
      
      // Reset form and mark bet as placed
      setSelectedValue('');
      setBetAmount('');
      setBetPlaced(true);
      
      // Refresh wallet to show updated balance
      await refetchWallet();
      
      alert('Bet placed successfully!');
    } catch (error: any) {
      console.error('Error placing bet:', error);
      alert(error.message || 'Error placing bet');
    } finally {
      setLoading(false);
    }
  };

  const getMultiplier = () => {
    switch (selectedBetType) {
      case 'number': return '9x';
      case 'color': return '2x';
      case 'size': return '2x';
      default: return '1x';
    }
  };

  const getPotentialWin = () => {
    if (!betAmount) return 0;
    const amount = parseFloat(betAmount);
    switch (selectedBetType) {
      case 'number': return amount * 9;
      case 'color': return amount * 2;
      case 'size': return amount * 2;
      default: return amount;
    }
  };

  if (gameLoading) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00d4aa] mx-auto mb-4"></div>
        <p className="text-[#b1bad3]">Loading game...</p>
      </div>
    );
  }

  if (!currentGame) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <AlertCircle className="h-16 w-16 text-[#b1bad3] mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">No Active Game</h2>
        <p className="text-[#b1bad3] mb-6">There's no active game at the moment. Please wait for the next game to start.</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-gradient-to-r from-[#00d4aa] to-[#00b4d8] hover:from-[#00c49a] hover:to-[#00a4c8] text-[#0f212e] font-bold py-3 px-6 rounded-lg transition-all"
        >
          Refresh Page
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Game Header */}
      <div className="bg-[#1a2c38] border border-[#2f4553] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-[#00d4aa] to-[#00b4d8] rounded-xl flex items-center justify-center">
              <Gamepad2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Game #{currentGame.game_number}</h1>
              <p className="text-[#b1bad3]">Status: {currentGame.status}</p>
            </div>
          </div>
          
          {currentGame.status === 'betting' && (
            <div className="text-center">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="h-5 w-5 text-[#00d4aa]" />
                <span className="text-[#00d4aa] font-bold">Time Left</span>
              </div>
              <div className="text-3xl font-bold text-white">
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </div>
            </div>
          )}
        </div>

        {currentGame.status === 'waiting' && (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-[#00d4aa] mx-auto mb-4" />
            <p className="text-[#b1bad3] text-lg">Game starting in:</p>
            <div className="text-4xl font-bold text-[#00d4aa] mb-2">
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </div>
            <p className="text-[#00d4aa] font-medium">Get ready to place your bets!</p>
          </div>
        )}

        {betPlaced && currentGame.status === 'betting' && (
          <div className="bg-[#00d4aa]/20 border border-[#00d4aa]/30 rounded-lg p-4 text-center">
            <Trophy className="h-8 w-8 text-[#00d4aa] mx-auto mb-2" />
            <p className="text-[#00d4aa] font-bold">Bet Placed Successfully!</p>
            <p className="text-white text-sm">Good luck! Results will be announced when the timer ends.</p>
          </div>
        )}
      </div>

      {currentGame.status === 'betting' && !betPlaced && (
        <>
          {/* Bet Type Selection */}
          <div className="bg-[#1a2c38] border border-[#2f4553] rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Choose Bet Type</h2>
            <div className="grid grid-cols-3 gap-4">
              {[
                { type: 'number' as BetType, label: 'Bet on Number', icon: Target, multiplier: '9x' },
                { type: 'color' as BetType, label: 'Bet on Color', icon: Palette, multiplier: '2x' },
                { type: 'size' as BetType, label: 'Big/Small', icon: Zap, multiplier: '2x' },
              ].map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.type}
                    onClick={() => {
                      setSelectedBetType(option.type);
                      setSelectedValue('');
                    }}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      selectedBetType === option.type
                        ? 'border-[#00d4aa] bg-[#00d4aa]/10'
                        : 'border-[#2f4553] hover:border-[#3a5664]'
                    }`}
                  >
                    <Icon className={`h-8 w-8 mx-auto mb-2 ${
                      selectedBetType === option.type ? 'text-[#00d4aa]' : 'text-[#b1bad3]'
                    }`} />
                    <p className="text-white font-medium">{option.label}</p>
                    <p className="text-[#00d4aa] text-sm">{option.multiplier}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bet Selection */}
          <div className="bg-[#1a2c38] border border-[#2f4553] rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">
              {selectedBetType === 'number' && 'Select Number (0-9)'}
              {selectedBetType === 'color' && 'Select Color'}
              {selectedBetType === 'size' && 'Select Size'}
            </h2>

            {selectedBetType === 'number' && (
              <div className="grid grid-cols-5 gap-3 mb-6">
                {numbers.map((num) => (
                  <button
                    key={num}
                    onClick={() => setSelectedValue(num.toString())}
                    className={`w-16 h-16 rounded-full text-white font-bold text-lg transition-all ${
                      getNumberColor(num)
                    } ${
                      selectedValue === num.toString()
                        ? 'ring-4 ring-white scale-110'
                        : 'hover:scale-105'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            )}

            {selectedBetType === 'color' && (
              <div className="grid grid-cols-2 gap-4 mb-6">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedValue(color)}
                    className={`p-6 rounded-xl text-white font-bold text-lg transition-all ${
                      color === 'red' ? 'bg-red-500 hover:bg-red-400' : 'bg-green-500 hover:bg-green-400'
                    } ${
                      selectedValue === color
                        ? 'ring-4 ring-white scale-105'
                        : 'hover:scale-102'
                    }`}
                  >
                    {color.toUpperCase()}
                  </button>
                ))}
              </div>
            )}

            {selectedBetType === 'size' && (
              <div className="grid grid-cols-2 gap-4 mb-6">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedValue(size)}
                    className={`p-6 rounded-xl text-white font-bold text-lg transition-all bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 ${
                      selectedValue === size
                        ? 'ring-4 ring-white scale-105'
                        : 'hover:scale-102'
                    }`}
                  >
                    {size.toUpperCase()}
                    <div className="text-sm font-normal mt-1">
                      {size === 'small' ? '(0-4)' : '(5-9)'}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Bet Amount */}
          <div className="bg-[#1a2c38] border border-[#2f4553] rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Place Your Bet</h2>
            
            <div className="grid grid-cols-5 gap-2 mb-4">
              {[10, 20, 50, 100, 500].map((amount) => (
                <button
                  key={amount}
                  onClick={() => setBetAmount(Math.min(amount, wallet?.balance || 0).toString())}
                  disabled={amount > (wallet?.balance || 0)}
                  className="px-4 py-3 bg-[#00d4aa] hover:bg-[#00c49a] disabled:bg-[#2f4553] disabled:text-[#b1bad3] text-[#0f212e] disabled:cursor-not-allowed rounded-lg font-medium transition-all"
                >
                  ${amount}
                </button>
              ))}
            </div>

            <div className="mb-4">
              <input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                placeholder="Enter amount"
                min="1"
                max={wallet?.balance || 0}
                className="w-full p-4 bg-[#0f212e] border border-[#2f4553] rounded-xl text-white text-center text-lg placeholder-[#b1bad3] focus:outline-none focus:ring-2 focus:ring-[#00d4aa] focus:border-transparent"
              />
            </div>

            {selectedValue && betAmount && (
              <div className="bg-[#0f212e] border border-[#2f4553] rounded-xl p-4 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[#b1bad3]">Betting on:</span>
                  <span className="text-white font-medium">{selectedBetType}: {selectedValue}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[#b1bad3]">Amount:</span>
                  <span className="text-white font-medium">${parseFloat(betAmount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[#b1bad3]">Multiplier:</span>
                  <span className="text-[#00d4aa] font-medium">{getMultiplier()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#b1bad3]">Potential win:</span>
                  <span className="text-[#00d4aa] font-bold">
                    ${getPotentialWin().toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            <button
              onClick={handlePlaceBet}
              disabled={!selectedValue || !betAmount || loading || parseFloat(betAmount || '0') > (wallet?.balance || 0) || parseFloat(betAmount || '0') <= 0}
              className="w-full bg-gradient-to-r from-[#00d4aa] to-[#00b4d8] hover:from-[#00c49a] hover:to-[#00a4c8] disabled:from-[#2f4553] disabled:to-[#2f4553] text-[#0f212e] disabled:text-[#b1bad3] font-bold py-4 px-6 rounded-xl transition-all disabled:cursor-not-allowed"
            >
              {loading ? 'Placing Bet...' : 'Place Bet'}
            </button>

            <div className="text-center mt-4">
              <p className="text-[#b1bad3] text-sm">
                Balance: <span className="text-[#00d4aa] font-medium">${wallet?.balance.toFixed(2) || '0.00'}</span>
              </p>
            </div>
          </div>
        </>
      )}

      {currentGame.status === 'completed' && (
        <div className="bg-[#1a2c38] border border-[#2f4553] rounded-2xl p-6 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Game Results</h2>
          <div className="space-y-4">
            {currentGame.resultNumber !== undefined && (
              <>
                <div className="flex items-center justify-center space-x-4">
                  <span className="text-[#b1bad3]">Winning Number:</span>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl ${
                    getNumberColor(currentGame.resultNumber || 0)
                  }`}>
                    {currentGame.resultNumber}
                  </div>
                </div>
                <div className="flex items-center justify-center space-x-4">
                  <span className="text-[#b1bad3]">Color:</span>
                  <span className="text-white font-bold">{currentGame.resultColor?.toUpperCase()}</span>
                </div>
                <div className="flex items-center justify-center space-x-4">
                  <span className="text-[#b1bad3]">Size:</span>
                  <span className="text-white font-bold">{currentGame.resultSize?.toUpperCase()}</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Bet Result Modal */}
      {gameResult && (
        <BetResult
          winningNumber={gameResult.winningNumber}
          winningColor={gameResult.winningColor}
          winningSize={gameResult.winningSize}
          isWin={gameResult.isWin}
          payout={gameResult.payout}
          betType={gameResult.betType}
          betValue={gameResult.betValue}
          onClose={() => {
            setGameResult(null);
            setSelectedValue('');
            setBetAmount('');
          }}
        />
      )}
    </div>
  );
}
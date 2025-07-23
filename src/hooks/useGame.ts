import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

interface Game {
  _id: string;
  gameNumber: number;
  status: 'waiting' | 'betting' | 'completed';
  startTime: string;
  endTime?: string;
  resultNumber?: number;
  resultColor?: 'red' | 'green';
  resultSize?: 'big' | 'small';
  isFixed: boolean;
  fixedResult?: number;
  createdAt: string;
}

interface Bet {
  _id: string;
  userId: string;
  gameId: string;
  betType: string;
  betValue: string;
  amount: number;
  result: 'win' | 'loss' | 'pending';
  payout: number;
  createdAt: string;
}

type BetType = 'number' | 'color' | 'size';

export function useGame() {
  const { user } = useAuth();
  const [currentGame, setCurrentGame] = useState<Game | null>(null);
  const [currentBet, setCurrentBet] = useState<Bet | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [betResult, setBetResult] = useState<{
    winningNumber: number;
    winningColor: 'red' | 'green';
    winningSize: 'big' | 'small';
    isWin: boolean;
    payout: number;
    betType: string;
    betValue: string;
  } | null>(null);
  const [lastCompletedGame, setLastCompletedGame] = useState<Game | null>(null);

  useEffect(() => {
    fetchCurrentGame();
    fetchCurrentBet();
    const interval = setInterval(() => {
      fetchCurrentGame();
      fetchCurrentBet();
    }, 3000); // Check every 3 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (currentGame && (currentGame.status === 'betting' || currentGame.status === 'waiting')) {
      const timer = setInterval(() => {
        const now = new Date().getTime();
        const startTime = new Date(currentGame.startTime).getTime();
        
        if (currentGame.status === 'waiting') {
          // Show countdown to game start
          const timeToStart = Math.max(0, Math.ceil((startTime - now) / 1000));
          setTimeLeft(timeToStart);
        } else if (currentGame.status === 'betting') {
          // Show countdown for betting time (default 60 seconds)
          const duration = 60000; // 60 seconds default
          const elapsed = now - startTime;
          const remaining = Math.max(0, Math.ceil((duration - elapsed) / 1000));
          setTimeLeft(remaining);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [currentGame]);

  // Check for bet results when game completes
  useEffect(() => {
    if (currentGame && currentBet && 
        currentGame.status === 'completed' && 
        currentBet.result !== 'pending' &&
        currentGame.resultNumber !== undefined &&
        (!lastCompletedGame || lastCompletedGame._id !== currentGame._id)) {
      
      const isWin = currentBet.result === 'win';
      setBetResult({
        winningNumber: currentGame.resultNumber,
        winningColor: currentGame.resultColor!,
        winningSize: currentGame.resultSize!,
        isWin,
        payout: currentBet.payout,
        betType: currentBet.betType,
        betValue: currentBet.betValue,
      });
      
      setLastCompletedGame(currentGame);
    }
  }, [currentGame, currentBet, lastCompletedGame]);

  const fetchCurrentGame = async () => {
    try {
      const response = await api.getCurrentGame();
      setCurrentGame(response.game);
    } catch (error) {
      console.error('Error in fetchCurrentGame:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentBet = async () => {
    try {
      const response = await api.getCurrentBet();
      setCurrentBet(response.bet);
    } catch (error) {
      console.error('Error fetching current bet:', error);
    }
  };

  const placeBet = async (betType: BetType, betValue: string, amount: number) => {
    if (!user || !currentGame) {
      throw new Error('User not authenticated or no active game');
    }

    if (currentGame.status !== 'betting') {
      throw new Error('Game is not accepting bets');
    }

    try {
      await api.placeBet(currentGame._id, betType, betValue, amount);
      await fetchCurrentBet(); // Refresh bet data
    } catch (error) {
      console.error('Error placing bet:', error);
      throw error;
    }
  };

  const clearBetResult = () => {
    setBetResult(null);
  };

  return {
    currentGame,
    currentBet,
    timeLeft,
    loading,
    betResult,
    placeBet,
    clearBetResult,
    refetch: () => {
      fetchCurrentGame();
      fetchCurrentBet();
    },
  };
}
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

type BetType = 'number' | 'color' | 'size';

export function useGame() {
  const { user } = useAuth();
  const [currentGame, setCurrentGame] = useState<Game | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCurrentGame();
    const interval = setInterval(fetchCurrentGame, 30000); // Check every 30 seconds
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
          
          // Auto-refresh when game should start
          if (timeToStart === 0) {
            fetchCurrentGame();
          }
        } else if (currentGame.status === 'betting') {
          // Show countdown for betting time
          const duration = 60000; // 60 seconds default
          const elapsed = now - startTime;
          const remaining = Math.max(0, Math.ceil((duration - elapsed) / 1000));
          setTimeLeft(remaining);
          
          // Auto-refresh when betting should end
          if (remaining === 0) {
            fetchCurrentGame();
          }
        }
        
      }, 1000); // Keep 1 second for countdown timer

      return () => clearInterval(timer);
    }
  }, [currentGame]);

  const fetchCurrentGame = async () => {
    try {
      setLoading(true);
      
      const response = await api.getCurrentGame();
      setCurrentGame(response.game);
    } catch (error) {
      console.error('Error in fetchCurrentGame:', error);
    } finally {
      setLoading(false);
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
    } catch (error) {
      console.error('Error placing bet:', error);
      throw error;
    }
  };

  return {
    currentGame,
    timeLeft,
    loading,
    placeBet,
    refetch: fetchCurrentGame,
  };
}
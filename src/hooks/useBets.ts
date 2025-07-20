import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';

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

export function useBets() {
  const { user } = useAuth();
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchBets();
    }
  }, [user]);

  const fetchBets = async () => {
    if (!user) return;

    try {
      // For now, we'll use mock data since the backend doesn't have a bets endpoint yet
      // You can implement this when you add the bets API endpoint
      setBets([]);
    } catch (error) {
      console.error('Error fetching bets:', error);
    } finally {
      setLoading(false);
    }
  };

  const placeBet = async (color: string, amount: number) => {
    if (!user) throw new Error('User not authenticated');

    // Mock implementation - replace with actual API call
    const colors = ['red', 'green', 'blue', 'yellow'];
    const winningColor = colors[Math.floor(Math.random() * colors.length)];
    const isWin = color === winningColor;
    const payout = isWin ? amount * 3 : 0;

    try {
      // This would be replaced with actual API call to place bet
      // await api.placeBet(gameId, 'color', color, amount);
      
      await fetchBets();
      return { winningColor, isWin, payout };
    } catch (error) {
      console.error('Error placing bet:', error);
      throw error;
    }
  };

  const getStats = () => {
    const totalBets = bets.length;
    const wins = bets.filter((bet) => bet.result === 'win').length;
    const winRate = totalBets > 0 ? (wins / totalBets) * 100 : 0;
    const totalWagered = bets.reduce((sum, bet) => sum + bet.amount, 0);
    const totalWon = bets.reduce((sum, bet) => sum + bet.payout, 0);
    const netProfit = totalWon - totalWagered;

    return {
      totalBets,
      wins,
      losses: totalBets - wins,
      winRate,
      totalWagered,
      totalWon,
      netProfit,
    };
  };

  return {
    bets,
    loading,
    placeBet,
    getStats,
    refetch: fetchBets,
  };
}
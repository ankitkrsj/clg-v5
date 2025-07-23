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
  gameId?: {
    gameNumber: number;
    resultNumber?: number;
    resultColor?: string;
    resultSize?: string;
  };
}

interface UserStats {
  totalBets: number;
  wins: number;
  losses: number;
  winRate: number;
  totalWagered: number;
  totalWon: number;
  netProfit: number;
}

export function useBets() {
  const { user } = useAuth();
  const [bets, setBets] = useState<Bet[]>([]);
  const [stats, setStats] = useState<UserStats>({
    totalBets: 0,
    wins: 0,
    losses: 0,
    winRate: 0,
    totalWagered: 0,
    totalWon: 0,
    netProfit: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchBets();
      fetchStats();
    }
  }, [user]);

  const fetchBets = async () => {
    if (!user) return;

    try {
      const response = await api.getUserBets();
      setBets(response.bets || []);
    } catch (error) {
      console.error('Error fetching bets:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    if (!user) return;

    try {
      const response = await api.getUserStats();
      setStats(response.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const getStats = () => stats;

  return {
    bets,
    loading,
    getStats,
    refetch: () => {
      fetchBets();
      fetchStats();
    },
  };
}
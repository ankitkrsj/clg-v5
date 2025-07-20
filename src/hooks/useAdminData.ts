import { useState, useEffect } from 'react';
import { api } from '../lib/api';

export function useAdminData() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRevenue: 0,
    activeGames: 0,
    pendingTransactions: 0,
    blockedUsers: 0,
    todayBets: 0,
    totalBalance: 0,
    todayRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminStats();
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchAdminStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAdminStats = async () => {
    try {

      const response = await api.getAdminStats();
      setStats({
        totalUsers: response.totalUsers,
        totalRevenue: response.todayRevenue,
        activeGames: response.activeGames,
        pendingTransactions: response.pendingTransactions,
        blockedUsers: response.blockedUsers,
        todayBets: response.todayBets,
        totalBalance: response.totalBalance,
        todayRevenue: response.todayRevenue,
      });
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    stats,
    loading,
    refetch: fetchAdminStats,
  };
}
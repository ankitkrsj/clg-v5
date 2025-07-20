import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

interface Wallet {
  _id: string;
  userId: string;
  balance: number;
  createdAt: string;
  updatedAt: string;
}

interface Transaction {
  _id: string;
  userId: string;
  type: string;
  amount: number;
  description: string;
  status?: string;
  screenshotUrl?: string;
  adminNotes?: string;
  createdAt: string;
}

export function useWallet() {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchWallet();
      fetchTransactions();
    }
  }, [user]);

  const fetchWallet = async () => {
    if (!user) return;

    try {
      const response = await api.getWallet();
      setWallet(response.wallet);
    } catch (error) {
      console.error('Error fetching wallet:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    if (!user) return;

    try {
      const response = await api.getTransactions();
      setTransactions(response.transactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const deposit = async (amount: number, screenshot: File) => {
    if (!user || !wallet) return;

    try {
      await api.createDepositRequest(amount, screenshot);
      await fetchTransactions();
    } catch (error) {
      console.error('Error depositing:', error);
      throw error;
    }
  };

  const updateBalance = async (newBalance: number) => {
    if (!user || !wallet) return;

    try {
      const response = await api.updateWalletBalance(newBalance);
      setWallet({ ...wallet, balance: newBalance });
    } catch (error) {
      console.error('Error updating balance:', error);
      throw error;
    }
  };

  return {
    wallet,
    transactions,
    loading,
    deposit,
    updateBalance,
    refetch: () => {
      fetchWallet();
      fetchTransactions();
    },
  };
}
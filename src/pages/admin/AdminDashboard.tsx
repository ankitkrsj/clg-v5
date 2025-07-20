import React from 'react';
import { useAdminData } from '../../hooks/useAdminData';
import { Users, DollarSign, Gamepad2, TrendingUp, Activity, Shield, Clock, CreditCard, AlertTriangle, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

export function AdminDashboard() {
  const { stats, loading } = useAdminData();

  const cards = [
    {
      title: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      gradient: 'from-blue-500 to-blue-600',
      textColor: 'text-blue-400',
      change: '+12%',
      changeType: 'positive',
    },
    {
      title: 'Today\'s Revenue',
      value: `$${stats.todayRevenue.toLocaleString()}`,
      icon: DollarSign,
      gradient: 'from-[#00d4aa] to-[#00b4d8]',
      textColor: 'text-[#00d4aa]',
      change: '+8.2%',
      changeType: 'positive',
    },
    {
      title: 'Active Games',
      value: stats.activeGames.toString(),
      icon: Gamepad2,
      gradient: 'from-purple-500 to-purple-600',
      textColor: 'text-purple-400',
      change: 'Live',
      changeType: 'neutral',
    },
    {
      title: 'Pending Transactions',
      value: stats.pendingTransactions.toString(),
      icon: Clock,
      gradient: 'from-yellow-500 to-yellow-600',
      textColor: 'text-yellow-400',
      change: 'Needs Review',
      changeType: 'warning',
    },
    {
      title: 'Total Platform Balance',
      value: `$${stats.totalBalance.toLocaleString()}`,
      icon: CreditCard,
      gradient: 'from-emerald-500 to-emerald-600',
      textColor: 'text-emerald-400',
      change: '+15.3%',
      changeType: 'positive',
    },
    {
      title: 'Today\'s Bets',
      value: stats.todayBets.toString(),
      icon: TrendingUp,
      gradient: 'from-indigo-500 to-indigo-600',
      textColor: 'text-indigo-400',
      change: '+23%',
      changeType: 'positive',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00d4aa]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
        <p className="text-[#b1bad3] text-lg">Complete control over your casino platform</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className="bg-[#1a2c38] border border-[#2f4553] rounded-2xl p-6 hover:bg-[#1e3240] transition-all group relative overflow-hidden"
            >
              {/* Background decoration */}
              <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${card.gradient} opacity-10 rounded-full -translate-y-10 translate-x-10`} />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${card.gradient}`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className={`text-xs px-2 py-1 rounded-full ${
                    card.changeType === 'positive' ? 'bg-[#00d4aa]/20 text-[#00d4aa]' :
                    card.changeType === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-[#2f4553] text-[#b1bad3]'
                  }`}>
                    {card.change}
                  </div>
                </div>
                <h3 className="text-[#b1bad3] text-sm font-medium mb-1">{card.title}</h3>
                <p className={`text-2xl font-bold ${card.textColor}`}>{card.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-[#1a2c38] border border-[#2f4553] rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
          <Zap className="h-5 w-5 text-[#00d4aa]" />
          <span>Quick Actions</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/admin/users"
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-bold py-4 px-6 rounded-xl transition-all text-center transform hover:scale-105 flex flex-col items-center space-y-2"
          >
            <Users className="h-6 w-6" />
            <span>Manage Users</span>
          </Link>
          <Link
            to="/admin/transactions"
            className="bg-gradient-to-r from-[#00d4aa] to-[#00b4d8] hover:from-[#00c49a] hover:to-[#00a4c8] text-[#0f212e] font-bold py-4 px-6 rounded-xl transition-all text-center transform hover:scale-105 flex flex-col items-center space-y-2"
          >
            <CreditCard className="h-6 w-6" />
            <span>Review Transactions</span>
          </Link>
          <Link
            to="/admin/qr-banner"
            className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500 text-white font-bold py-4 px-6 rounded-xl transition-all text-center transform hover:scale-105 flex flex-col items-center space-y-2"
          >
            <Activity className="h-6 w-6" />
            <span>Update QR & Banner</span>
          </Link>
          <Link
            to="/admin/game-control"
            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white font-bold py-4 px-6 rounded-xl transition-all text-center transform hover:scale-105 flex flex-col items-center space-y-2"
          >
            <Shield className="h-6 w-6" />
            <span>Game Control</span>
          </Link>
        </div>
      </div>

      {/* Dashboard Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <div className="bg-[#1a2c38] border border-[#2f4553] rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
            <Activity className="h-5 w-5 text-[#00d4aa]" />
            <span>Recent Transactions</span>
          </h2>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-[#0f212e] rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-[#2f4553] rounded-full flex items-center justify-center">
                    <DollarSign className="h-4 w-4 text-[#00d4aa]" />
                  </div>
                  <div>
                    <p className="text-white font-medium">User #{1000 + i}</p>
                    <p className="text-[#b1bad3] text-sm">Deposit request</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[#00d4aa] font-bold">$50.00</p>
                  <p className="text-yellow-400 text-sm">Pending</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Link
              to="/admin/transactions"
              className="w-full bg-[#2f4553] hover:bg-[#3a5664] text-white font-medium py-2 px-4 rounded-lg transition-all text-center block"
            >
              View All Transactions
            </Link>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-[#1a2c38] border border-[#2f4553] rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
            <Shield className="h-5 w-5 text-[#00d4aa]" />
            <span>System Status</span>
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-[#0f212e] rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-[#00d4aa] rounded-full animate-pulse"></div>
                <span className="text-[#b1bad3]">Server Status</span>
              </div>
              <span className="text-[#00d4aa] font-semibold">Online</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-[#0f212e] rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-[#00d4aa] rounded-full animate-pulse"></div>
                <span className="text-[#b1bad3]">Database</span>
              </div>
              <span className="text-[#00d4aa] font-semibold">Connected</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-[#0f212e] rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-[#00d4aa] rounded-full animate-pulse"></div>
                <span className="text-[#b1bad3]">Payment Gateway</span>
              </div>
              <span className="text-[#00d4aa] font-semibold">Active</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-[#0f212e] rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-[#00d4aa] rounded-full animate-pulse"></div>
                <span className="text-[#b1bad3]">Game Engine</span>
              </div>
              <span className="text-[#00d4aa] font-semibold">Running</span>
            </div>
          </div>
        </div>
      </div>

      {/* Platform Overview */}
      <div className="bg-[#1a2c38] border border-[#2f4553] rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
          <TrendingUp className="h-5 w-5 text-[#00d4aa]" />
          <span>Platform Overview</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-[#00d4aa] mb-2">{stats.totalUsers}</div>
            <div className="text-[#b1bad3]">Total Users</div>
            <div className="text-sm text-[#00d4aa] mt-1">+12% this month</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-[#00d4aa] mb-2">${stats.totalBalance.toLocaleString()}</div>
            <div className="text-[#b1bad3]">Platform Balance</div>
            <div className="text-sm text-[#00d4aa] mt-1">+15.3% this month</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-[#00d4aa] mb-2">{stats.todayBets}</div>
            <div className="text-[#b1bad3]">Today's Bets</div>
            <div className="text-sm text-[#00d4aa] mt-1">+23% vs yesterday</div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {stats.pendingTransactions > 0 && (
        <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-2xl p-6">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-6 w-6 text-yellow-400" />
            <div>
              <h3 className="text-yellow-400 font-bold">Attention Required</h3>
              <p className="text-yellow-300">
                You have {stats.pendingTransactions} pending transaction{stats.pendingTransactions !== 1 ? 's' : ''} that need review.
              </p>
            </div>
            <Link
              to="/admin/transactions"
              className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-2 px-4 rounded-lg transition-all ml-auto"
            >
              Review Now
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
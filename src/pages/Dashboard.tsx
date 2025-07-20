import React from 'react';
import { useWallet } from '../hooks/useWallet';
import { useGame } from '../hooks/useGame';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Coins, Gamepad2, TrendingUp, Activity, Trophy, TrendingDown, Zap, Target, Play } from 'lucide-react';

export function Dashboard() {
  const { user } = useAuth();
  const { wallet } = useWallet();
  const { currentGame } = useGame();
  
  // Mock stats for now - you can implement real stats later
  const stats = {
    totalBets: 0,
    wins: 0,
    losses: 0,
    winRate: 0,
    totalWagered: 0,
    totalWon: 0,
    netProfit: 0,
  };

  const cards = [
    {
      title: 'Balance',
      value: `$${wallet?.balance.toFixed(2) || '0.00'}`,
      icon: Coins,
      gradient: 'from-[#00d4aa] to-[#00b4d8]',
      textColor: 'text-[#00d4aa]',
    },
    {
      title: 'Total Bets',
      value: stats.totalBets.toString(),
      icon: Target,
      gradient: 'from-blue-500 to-blue-600',
      textColor: 'text-blue-400',
    },
    {
      title: 'Win Rate',
      value: `${stats.winRate.toFixed(1)}%`,
      icon: TrendingUp,
      gradient: 'from-purple-500 to-purple-600',
      textColor: 'text-purple-400',
    },
    {
      title: 'Net Profit',
      value: `${stats.netProfit >= 0 ? '+' : ''}$${stats.netProfit.toFixed(2)}`,
      icon: Activity,
      gradient: stats.netProfit >= 0 ? 'from-emerald-500 to-emerald-600' : 'from-red-500 to-red-600',
      textColor: stats.netProfit >= 0 ? 'text-emerald-400' : 'text-red-400',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-2">
          Welcome back, {user?.username || user?.email?.split('@')[0] || 'Player'}!
        </h1>
        <p className="text-[#b1bad3] text-lg">Ready to test your luck?</p>
      </div>

      {/* Last Game Result */}
      {currentGame && currentGame.status === 'completed' && currentGame.resultNumber !== undefined && (
        <div className="bg-[#1a2c38] border border-[#2f4553] rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-4 text-center">Last Game Result</h2>
          <div className="flex items-center justify-center space-x-8">
            <div className="text-center">
              <p className="text-[#b1bad3] text-sm mb-2">Game #{currentGame.gameNumber}</p>
              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto ${
                currentGame.resultNumber === 0 ? 'bg-green-500' : 
                currentGame.resultNumber % 2 === 0 ? 'bg-red-500' : 'bg-green-500'
              }`}>
                {currentGame.resultNumber}
              </div>
            </div>
            <div className="text-center">
              <p className="text-[#b1bad3] text-sm mb-2">Color</p>
              <p className="text-white font-bold text-lg">{currentGame.resultColor?.toUpperCase()}</p>
            </div>
            <div className="text-center">
              <p className="text-[#b1bad3] text-sm mb-2">Size</p>
              <p className="text-white font-bold text-lg">{currentGame.resultSize?.toUpperCase()}</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className="bg-[#1a2c38] border border-[#2f4553] rounded-2xl p-6 hover:bg-[#1e3240] transition-all group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${card.gradient}`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
              <h3 className="text-[#b1bad3] text-sm font-medium mb-1">{card.title}</h3>
              <p className={`text-2xl font-bold ${card.textColor}`}>{card.value}</p>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Game Card */}
        <div className="lg:col-span-2 bg-[#1a2c38] border border-[#2f4553] rounded-2xl p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#00d4aa]/20 to-[#00b4d8]/20 rounded-full -translate-y-16 translate-x-16" />
          
          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-[#00d4aa] to-[#00b4d8] rounded-xl flex items-center justify-center">
                <Gamepad2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Color Game</h2>
                <p className="text-[#b1bad3]">Pick a color, win big!</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              {['red', 'green', 'blue', 'yellow'].map((color) => (
                <div
                  key={color}
                  className={`h-16 rounded-xl ${
                    color === 'red' ? 'bg-gradient-to-br from-red-500 to-red-600' :
                    color === 'green' ? 'bg-gradient-to-br from-emerald-500 to-emerald-600' :
                    color === 'blue' ? 'bg-gradient-to-br from-blue-500 to-blue-600' :
                    'bg-gradient-to-br from-yellow-500 to-yellow-600'
                  } flex items-center justify-center`}
                >
                  <span className="text-white font-bold capitalize">{color}</span>
                </div>
              ))}
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-[#00d4aa]" />
                <span className="text-[#00d4aa] font-medium">Up to 9x Multiplier</span>
              </div>
              <Link
                to="/game"
                className="bg-gradient-to-r from-[#00d4aa] to-[#00b4d8] hover:from-[#00c49a] hover:to-[#00a4c8] text-[#0f212e] font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105 flex items-center space-x-2"
              >
                <Play className="h-4 w-4" />
                <span>Play Now</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Panel */}
        <div className="bg-[#1a2c38] border border-[#2f4553] rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
            <Trophy className="h-5 w-5 text-[#00d4aa]" />
            <span>Your Stats</span>
          </h2>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[#b1bad3]">Total Wagered</span>
              <span className="text-white font-semibold">${stats.totalWagered.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#b1bad3]">Total Won</span>
              <span className="text-[#00d4aa] font-semibold">${stats.totalWon.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#b1bad3]">Wins</span>
              <span className="text-[#00d4aa] font-semibold">{stats.wins}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#b1bad3]">Losses</span>
              <span className="text-red-400 font-semibold">{stats.losses}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/game"
          className="bg-gradient-to-r from-[#00d4aa] to-[#00b4d8] hover:from-[#00c49a] hover:to-[#00a4c8] text-[#0f212e] font-bold py-4 px-6 rounded-xl transition-all text-center transform hover:scale-105 flex items-center justify-center space-x-2"
        >
          <Play className="h-5 w-5" />
          <span>Start Playing</span>
        </Link>
        <Link
          to="/wallet"
          className="bg-[#1a2c38] border border-[#2f4553] hover:bg-[#1e3240] text-white font-semibold py-4 px-6 rounded-xl transition-all text-center flex items-center justify-center space-x-2"
        >
          <Coins className="h-5 w-5" />
          <span>Add Funds</span>
        </Link>
        <Link
          to="/history"
          className="bg-[#1a2c38] border border-[#2f4553] hover:bg-[#1e3240] text-white font-semibold py-4 px-6 rounded-xl transition-all text-center flex items-center justify-center space-x-2"
        >
          <TrendingDown className="h-5 w-5" />
          <span>View History</span>
        </Link>
      </div>
    </div>
  );
}
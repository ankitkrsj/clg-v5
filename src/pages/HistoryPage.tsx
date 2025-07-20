import React, { useState } from 'react';
import { useBets } from '../hooks/useBets';
import { History, Filter, Trophy, TrendingDown, Calendar, Target } from 'lucide-react';

export function HistoryPage() {
  const { bets, getStats } = useBets();
  const [filter, setFilter] = useState<'all' | 'win' | 'loss'>('all');

  const stats = getStats();
  const filteredBets = bets.filter((bet) => {
    if (filter === 'all') return true;
    return bet.result === filter;
  });

  const getColorBadge = (color: string) => {
    const colorClasses = {
      red: 'bg-red-500/20 text-red-300 border-red-500/30',
      green: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      blue: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      yellow: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border capitalize ${colorClasses[color as keyof typeof colorClasses]}`}>
        {color}
      </span>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-[#00d4aa] to-[#00b4d8] rounded-xl flex items-center justify-center">
            <History className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white">Bet History</h1>
        </div>
        <p className="text-[#b1bad3] text-lg">Track your betting performance</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#1a2c38] border border-[#2f4553] rounded-2xl p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl">
              <Target className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-[#b1bad3] text-sm">Total Bets</p>
              <p className="text-2xl font-bold text-white">{stats.totalBets}</p>
            </div>
          </div>
        </div>

        <div className="bg-[#1a2c38] border border-[#2f4553] rounded-2xl p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-[#00d4aa] to-[#00b4d8] rounded-xl">
              <Trophy className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-[#b1bad3] text-sm">Win Rate</p>
              <p className="text-2xl font-bold text-[#00d4aa]">{stats.winRate.toFixed(1)}%</p>
            </div>
          </div>
        </div>

        <div className="bg-[#1a2c38] border border-[#2f4553] rounded-2xl p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl">
              <TrendingDown className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-[#b1bad3] text-sm">Total Wagered</p>
              <p className="text-2xl font-bold text-white">${stats.totalWagered.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-[#1a2c38] border border-[#2f4553] rounded-2xl p-6">
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-xl ${stats.netProfit >= 0 ? 'bg-gradient-to-r from-[#00d4aa] to-[#00b4d8]' : 'bg-gradient-to-r from-red-500 to-red-600'}`}>
              <TrendingDown className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-[#b1bad3] text-sm">Net Profit</p>
              <p className={`text-2xl font-bold ${stats.netProfit >= 0 ? 'text-[#00d4aa]' : 'text-red-400'}`}>
                ${stats.netProfit.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Bets List */}
      <div className="bg-[#1a2c38] border border-[#2f4553] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <Filter className="h-5 w-5 text-[#00d4aa]" />
            <span>Betting History</span>
          </h2>
          
          <div className="flex space-x-2">
            {[
              { key: 'all', label: 'All Bets' },
              { key: 'win', label: 'Wins' },
              { key: 'loss', label: 'Losses' },
            ].map((option) => (
              <button
                key={option.key}
                onClick={() => setFilter(option.key as typeof filter)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filter === option.key
                    ? 'bg-gradient-to-r from-[#00d4aa] to-[#00b4d8] text-[#0f212e]'
                    : 'bg-[#2f4553] text-[#b1bad3] hover:bg-[#3a5664] hover:text-white'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredBets.length === 0 ? (
            <div className="text-center py-12">
              <History className="h-12 w-12 text-[#2f4553] mx-auto mb-4" />
              <p className="text-[#b1bad3] text-lg">No bets found</p>
              <p className="text-[#2f4553]">Start betting to see your history here</p>
            </div>
          ) : (
            filteredBets.map((bet) => (
              <div
                key={bet.id}
                className="bg-[#0f212e] border border-[#2f4553] rounded-lg p-4 hover:bg-[#1a2c38] transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-lg ${bet.result === 'win' ? 'bg-gradient-to-r from-[#00d4aa] to-[#00b4d8]' : 'bg-gradient-to-r from-red-500 to-red-600'}`}>
                      {bet.result === 'win' ? (
                        <Trophy className="h-4 w-4 text-white" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-white" />
                      )}
                    </div>
                    
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-white font-medium">
                          ${bet.amount.toFixed(2)} on
                        </span>
                        {getColorBadge(bet.color)}
                        <span className="text-[#b1bad3]">→</span>
                        {getColorBadge(bet.winning_color)}
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-[#b1bad3]">
                        <span className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(bet.created_at).toLocaleDateString()}</span>
                        </span>
                        <span>{new Date(bet.created_at).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className={`font-bold text-lg ${bet.result === 'win' ? 'text-[#00d4aa]' : 'text-red-400'}`}>
                      {bet.result === 'win' ? `+$${bet.payout.toFixed(2)}` : `-$${bet.amount.toFixed(2)}`}
                    </p>
                    <p className="text-[#b1bad3] text-sm">
                      {bet.result === 'win' ? 'Won' : 'Lost'}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
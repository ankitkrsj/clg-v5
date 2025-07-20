import React, { useState } from 'react';
import { Shield, Search, Ban, MessageSquare, AlertTriangle, Users, Mail } from 'lucide-react';

export function AdminSecurity() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [blockReason, setBlockReason] = useState('');
  const [blockMessage, setBlockMessage] = useState('');

  // Mock data - replace with real data
  const users = [
    {
      id: '1',
      email: 'user1@example.com',
      username: 'player1',
      balance: 150.50,
      totalBets: 45,
      winRate: 65.5,
      isBlocked: false,
      createdAt: '2024-01-15',
      lastActive: '2024-01-20',
      suspiciousActivity: false,
    },
    {
      id: '2',
      email: 'user2@example.com',
      username: 'player2',
      balance: 75.25,
      totalBets: 23,
      winRate: 43.2,
      isBlocked: true,
      blockReason: 'Multiple account violation',
      createdAt: '2024-01-10',
      lastActive: '2024-01-18',
      suspiciousActivity: true,
    },
    // Add more mock users...
  ];

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBlockUser = (user: any) => {
    setSelectedUser(user);
    setShowBlockModal(true);
  };

  const confirmBlock = async () => {
    try {
      // Implement block user logic here
      console.log('Blocking user:', selectedUser.id, 'Reason:', blockReason, 'Message:', blockMessage);
      
      // Close modal and reset
      setShowBlockModal(false);
      setBlockReason('');
      setBlockMessage('');
      setSelectedUser(null);
      
      // Show success message
      alert('User blocked successfully');
    } catch (error) {
      console.error('Error blocking user:', error);
      alert('Error blocking user');
    }
  };

  const handleUnblockUser = async (userId: string) => {
    try {
      // Implement unblock user logic here
      console.log('Unblocking user:', userId);
      alert('User unblocked successfully');
    } catch (error) {
      console.error('Error unblocking user:', error);
      alert('Error unblocking user');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Security Management</h1>
            <p className="text-[#b1bad3]">Monitor and manage user security</p>
          </div>
        </div>
      </div>

      {/* Security Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-[#1a2c38] border border-[#2f4553] rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <Users className="h-8 w-8 text-[#00d4aa]" />
            <div>
              <p className="text-[#b1bad3] text-sm">Active Users</p>
              <p className="text-xl font-bold text-white">{users.filter(u => !u.isBlocked).length}</p>
            </div>
          </div>
        </div>
        <div className="bg-[#1a2c38] border border-[#2f4553] rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <Ban className="h-8 w-8 text-red-400" />
            <div>
              <p className="text-[#b1bad3] text-sm">Blocked Users</p>
              <p className="text-xl font-bold text-red-400">{users.filter(u => u.isBlocked).length}</p>
            </div>
          </div>
        </div>
        <div className="bg-[#1a2c38] border border-[#2f4553] rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-8 w-8 text-yellow-400" />
            <div>
              <p className="text-[#b1bad3] text-sm">Suspicious Activity</p>
              <p className="text-xl font-bold text-yellow-400">{users.filter(u => u.suspiciousActivity).length}</p>
            </div>
          </div>
        </div>
        <div className="bg-[#1a2c38] border border-[#2f4553] rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <Shield className="h-8 w-8 text-blue-400" />
            <div>
              <p className="text-[#b1bad3] text-sm">Security Score</p>
              <p className="text-xl font-bold text-blue-400">98%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-[#1a2c38] border border-[#2f4553] rounded-2xl p-6">
        <div className="flex items-center space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-4 h-5 w-5 text-[#b1bad3]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search users by email or username..."
              className="w-full pl-12 pr-4 py-4 bg-[#0f212e] border border-[#2f4553] rounded-xl text-white placeholder-[#b1bad3] focus:outline-none focus:ring-2 focus:ring-[#00d4aa] focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Users Security Table */}
      <div className="bg-[#1a2c38] border border-[#2f4553] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#0f212e] border-b border-[#2f4553]">
              <tr>
                <th className="text-left p-4 text-[#b1bad3] font-medium">User</th>
                <th className="text-left p-4 text-[#b1bad3] font-medium">Activity</th>
                <th className="text-left p-4 text-[#b1bad3] font-medium">Risk Level</th>
                <th className="text-left p-4 text-[#b1bad3] font-medium">Status</th>
                <th className="text-left p-4 text-[#b1bad3] font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-[#2f4553] hover:bg-[#1e3240]">
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-[#2f4553] rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-[#b1bad3]" />
                      </div>
                      <div>
                        <p className="text-white font-medium">{user.username}</p>
                        <p className="text-[#b1bad3] text-sm flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div>
                      <p className="text-white text-sm">{user.totalBets} bets</p>
                      <p className="text-[#b1bad3] text-sm">{user.winRate}% win rate</p>
                      <p className="text-[#b1bad3] text-xs">Last: {user.lastActive}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      user.suspiciousActivity 
                        ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                        : user.winRate > 80
                        ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                        : 'bg-[#00d4aa]/20 text-[#00d4aa] border border-[#00d4aa]/30'
                    }`}>
                      {user.suspiciousActivity ? 'High Risk' : user.winRate > 80 ? 'Medium Risk' : 'Low Risk'}
                    </span>
                  </td>
                  <td className="p-4">
                    {user.isBlocked ? (
                      <div>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-300 border border-red-500/30">
                          <Ban className="h-3 w-3 mr-1" />
                          Blocked
                        </span>
                        {user.blockReason && (
                          <p className="text-red-400 text-xs mt-1">{user.blockReason}</p>
                        )}
                      </div>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#00d4aa]/20 text-[#00d4aa] border border-[#00d4aa]/30">
                        <Shield className="h-3 w-3 mr-1" />
                        Active
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex space-x-2">
                      {!user.isBlocked ? (
                        <button
                          onClick={() => handleBlockUser(user)}
                          className="px-3 py-1 bg-red-500/20 text-red-300 border border-red-500/30 rounded-lg text-sm hover:bg-red-500/30 transition-all flex items-center space-x-1"
                        >
                          <Ban className="h-3 w-3" />
                          <span>Block</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUnblockUser(user.id)}
                          className="px-3 py-1 bg-[#00d4aa]/20 text-[#00d4aa] border border-[#00d4aa]/30 rounded-lg text-sm hover:bg-[#00d4aa]/30 transition-all flex items-center space-x-1"
                        >
                          <Shield className="h-3 w-3" />
                          <span>Unblock</span>
                        </button>
                      )}
                      <button className="px-3 py-1 bg-[#2f4553] text-white rounded-lg text-sm hover:bg-[#3a5664] transition-all">
                        View Details
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Block User Modal */}
      {showBlockModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a2c38] border border-[#2f4553] rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center space-x-3 mb-4">
              <Ban className="h-6 w-6 text-red-400" />
              <h3 className="text-xl font-bold text-white">Block User</h3>
            </div>
            
            <p className="text-[#b1bad3] mb-4">
              Are you sure you want to block <strong className="text-white">{selectedUser?.username}</strong>?
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#b1bad3] mb-2">
                  Reason for blocking
                </label>
                <select
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  className="w-full p-3 bg-[#0f212e] border border-[#2f4553] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00d4aa] focus:border-transparent"
                >
                  <option value="">Select a reason</option>
                  <option value="suspicious_activity">Suspicious Activity</option>
                  <option value="multiple_accounts">Multiple Accounts</option>
                  <option value="fraud_attempt">Fraud Attempt</option>
                  <option value="terms_violation">Terms Violation</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#b1bad3] mb-2">
                  Message to user (optional)
                </label>
                <textarea
                  value={blockMessage}
                  onChange={(e) => setBlockMessage(e.target.value)}
                  placeholder="Enter a message that will be sent to the user..."
                  className="w-full p-3 bg-[#0f212e] border border-[#2f4553] rounded-lg text-white placeholder-[#b1bad3] focus:outline-none focus:ring-2 focus:ring-[#00d4aa] focus:border-transparent"
                  rows={3}
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowBlockModal(false)}
                className="flex-1 px-4 py-2 bg-[#2f4553] text-white rounded-lg hover:bg-[#3a5664] transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmBlock}
                disabled={!blockReason}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <Ban className="h-4 w-4" />
                <span>Block User</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
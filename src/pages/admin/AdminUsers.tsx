import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Users, Search, Shield, ShieldOff, Mail, Calendar, Ban, CheckCircle } from 'lucide-react';

interface User {
  id: string;
  email: string;
  username: string;
  balance: number;
  totalBets: number;
  winRate: number;
  isBlocked: boolean;
  blockReason?: string;
  createdAt: string;
  lastActive: string;
}

export function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [blockReason, setBlockReason] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.getAdminUsers();
      setUsers(response.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBlockUser = (user: any) => {
    setSelectedUser(user);
    setShowBlockModal(true);
  };

  const confirmBlock = async () => {
    if (!selectedUser || !blockReason) return;

    try {
      await api.blockUser(selectedUser.id, true, blockReason);
      alert('User blocked successfully');
      await fetchUsers();
    } catch (error) {
      console.error('Error blocking user:', error);
      alert('Error blocking user');
    } finally {
      setShowBlockModal(false);
      setBlockReason('');
      setSelectedUser(null);
    }
  };

  const handleUnblockUser = async (userId: string) => {
    try {

      await api.blockUser(userId, false);
      alert('User unblocked successfully');
      await fetchUsers();
    } catch (error) {
      console.error('Error unblocking user:', error);
      alert('Error unblocking user');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00d4aa]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
            <Users className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">User Management</h1>
            <p className="text-[#b1bad3]">Manage and monitor user accounts</p>
          </div>
        </div>
        <button
          onClick={fetchUsers}
          className="bg-[#00d4aa] hover:bg-[#00c49a] text-[#0f212e] font-bold py-2 px-4 rounded-lg transition-all"
        >
          Refresh
        </button>
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

      {/* Users Table */}
      <div className="bg-[#1a2c38] border border-[#2f4553] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#0f212e] border-b border-[#2f4553]">
              <tr>
                <th className="text-left p-4 text-[#b1bad3] font-medium">User</th>
                <th className="text-left p-4 text-[#b1bad3] font-medium">Balance</th>
                <th className="text-left p-4 text-[#b1bad3] font-medium">Stats</th>
                <th className="text-left p-4 text-[#b1bad3] font-medium">Status</th>
                <th className="text-left p-4 text-[#b1bad3] font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-[#2f4553] hover:bg-[#1e3240]">
                  <td className="p-4">
                    <div>
                      <p className="text-white font-medium">{user.username}</p>
                      <p className="text-[#b1bad3] text-sm flex items-center">
                        <Mail className="h-3 w-3 mr-1" />
                        {user.email}
                      </p>
                      <p className="text-[#b1bad3] text-xs flex items-center mt-1">
                        <Calendar className="h-3 w-3 mr-1" />
                        Joined {user.createdAt}
                      </p>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="text-[#00d4aa] font-bold">${user.balance.toFixed(2)}</p>
                  </td>
                  <td className="p-4">
                    <div>
                      <p className="text-white text-sm">{user.totalBets} bets</p>
                      <p className="text-[#b1bad3] text-sm">{user.winRate.toFixed(1)}% win rate</p>
                    </div>
                  </td>
                  <td className="p-4">
                    {user.isBlocked ? (
                      <div>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-300 border border-red-500/30">
                          <ShieldOff className="h-3 w-3 mr-1" />
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
                          <CheckCircle className="h-3 w-3" />
                          <span>Unblock</span>
                        </button>
                      )}
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
            <h3 className="text-xl font-bold text-white mb-4">Block User</h3>
            <p className="text-[#b1bad3] mb-4">
              Are you sure you want to block <strong>{selectedUser?.username}</strong>?
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-[#b1bad3] mb-2">
                Reason for blocking
              </label>
              <textarea
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder="Enter reason..."
                className="w-full p-3 bg-[#0f212e] border border-[#2f4553] rounded-lg text-white placeholder-[#b1bad3] focus:outline-none focus:ring-2 focus:ring-[#00d4aa] focus:border-transparent"
                rows={3}
              />
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowBlockModal(false)}
                className="flex-1 px-4 py-2 bg-[#2f4553] text-white rounded-lg hover:bg-[#3a5664] transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmBlock}
                disabled={!blockReason}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Block User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
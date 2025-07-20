import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { CreditCard, Search, CheckCircle, XCircle, Clock, Eye, Download } from 'lucide-react';

interface Transaction {
  id: string;
  user_id: string;
  type: string;
  amount: number;
  description: string;
  status: string;
  screenshot_url?: string;
  admin_notes?: string;
  created_at: string;
  user_email?: string;
}

export function AdminTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await api.getAdminTransactions();
      setTransactions(response.transactions || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleTransactionAction = async (transactionId: string, action: 'approve' | 'reject') => {
    if (!selectedTransaction || !selectedTransaction._id) {
      console.error('No transaction selected or missing ID');
      return;
    }

    setActionLoading(true);
    try {
      const newStatus = action === 'approve' ? 'approved' : 'rejected';
      await api.updateTransaction(selectedTransaction._id, newStatus, adminNotes);

      await fetchTransactions();
      setShowModal(false);
      setSelectedTransaction(null);
      setAdminNotes('');
      
      alert(`Transaction ${action}d successfully!`);
    } catch (error) {
      console.error(`Error ${action}ing transaction:`, error);
      alert(`Error ${action}ing transaction. Please try again.`);
    } finally {
      setActionLoading(false);
    }
  };

  const openTransactionModal = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setAdminNotes(transaction.admin_notes || '');
    setShowModal(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#00d4aa]/20 text-[#00d4aa] border border-[#00d4aa]/30">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-300 border border-red-500/30">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#2f4553] text-[#b1bad3]">
            {status}
          </span>
        );
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'pending_deposit':
        return 'text-yellow-400';
      case 'deposit':
        return 'text-[#00d4aa]';
      case 'bet':
      case 'loss':
        return 'text-red-400';
      case 'win':
        return 'text-[#00d4aa]';
      default:
        return 'text-[#b1bad3]';
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
          <div className="w-12 h-12 bg-gradient-to-r from-[#00d4aa] to-[#00b4d8] rounded-xl flex items-center justify-center">
            <CreditCard className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Transaction Management</h1>
            <p className="text-[#b1bad3]">Review and manage user transactions</p>
          </div>
        </div>
        <button
          onClick={fetchTransactions}
          className="bg-[#00d4aa] hover:bg-[#00c49a] text-[#0f212e] font-bold py-2 px-4 rounded-lg transition-all"
        >
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-[#1a2c38] border border-[#2f4553] rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <CreditCard className="h-8 w-8 text-[#00d4aa]" />
            <div>
              <p className="text-[#b1bad3] text-sm">Total Transactions</p>
              <p className="text-xl font-bold text-white">{transactions.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-[#1a2c38] border border-[#2f4553] rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <Clock className="h-8 w-8 text-yellow-400" />
            <div>
              <p className="text-[#b1bad3] text-sm">Pending</p>
              <p className="text-xl font-bold text-yellow-400">
                {transactions.filter(t => t.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-[#1a2c38] border border-[#2f4553] rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-8 w-8 text-[#00d4aa]" />
            <div>
              <p className="text-[#b1bad3] text-sm">Approved</p>
              <p className="text-xl font-bold text-[#00d4aa]">
                {transactions.filter(t => t.status === 'approved').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-[#1a2c38] border border-[#2f4553] rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <XCircle className="h-8 w-8 text-red-400" />
            <div>
              <p className="text-[#b1bad3] text-sm">Rejected</p>
              <p className="text-xl font-bold text-red-400">
                {transactions.filter(t => t.status === 'rejected').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-[#1a2c38] border border-[#2f4553] rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-4 h-5 w-5 text-[#b1bad3]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by user email, description, or transaction ID..."
              className="w-full pl-12 pr-4 py-4 bg-[#0f212e] border border-[#2f4553] rounded-xl text-white placeholder-[#b1bad3] focus:outline-none focus:ring-2 focus:ring-[#00d4aa] focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="px-4 py-4 bg-[#0f212e] border border-[#2f4553] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#00d4aa] focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-[#1a2c38] border border-[#2f4553] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#0f212e] border-b border-[#2f4553]">
              <tr>
                <th className="text-left p-4 text-[#b1bad3] font-medium">User</th>
                <th className="text-left p-4 text-[#b1bad3] font-medium">Type</th>
                <th className="text-left p-4 text-[#b1bad3] font-medium">Amount</th>
                <th className="text-left p-4 text-[#b1bad3] font-medium">Status</th>
                <th className="text-left p-4 text-[#b1bad3] font-medium">Date</th>
                <th className="text-left p-4 text-[#b1bad3] font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="border-b border-[#2f4553] hover:bg-[#1e3240]">
                  <td className="p-4">
                    <div>
                      <p className="text-white font-medium">{transaction.user_email}</p>
                      <p className="text-[#b1bad3] text-sm">{transaction.description}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`font-medium ${getTypeColor(transaction.type)}`}>
                      {transaction.type.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`font-bold ${transaction.amount >= 0 ? 'text-[#00d4aa]' : 'text-red-400'}`}>
                      {transaction.amount >= 0 ? '+' : ''}${transaction.amount.toFixed(2)}
                    </span>
                  </td>
                  <td className="p-4">
                    {getStatusBadge(transaction.status)}
                  </td>
                  <td className="p-4">
                    <div>
                      <p className="text-white text-sm">
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </p>
                      <p className="text-[#b1bad3] text-xs">
                        {new Date(transaction.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => openTransactionModal(transaction)}
                      className="flex items-center space-x-1 px-3 py-1 bg-[#00d4aa]/20 text-[#00d4aa] border border-[#00d4aa]/30 rounded-lg text-sm hover:bg-[#00d4aa]/30 transition-all"
                    >
                      <Eye className="h-3 w-3" />
                      <span>View</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Detail Modal */}
      {showModal && selectedTransaction && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a2c38] border border-[#2f4553] rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Transaction Details</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-[#b1bad3] hover:text-white transition-all"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#b1bad3] mb-1">User Email</label>
                  <p className="text-white">{selectedTransaction.user_email || selectedTransaction.userId || 'Unknown'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#b1bad3] mb-1">Type</label>
                  <p className="text-white">{selectedTransaction.type.replace('_', ' ').toUpperCase()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#b1bad3] mb-1">Amount</label>
                  <p className={`font-bold ${selectedTransaction.amount >= 0 ? 'text-[#00d4aa]' : 'text-red-400'}`}>
                    {selectedTransaction.amount >= 0 ? '+' : ''}${selectedTransaction.amount.toFixed(2)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#b1bad3] mb-1">Status</label>
                  {getStatusBadge(selectedTransaction.status)}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#b1bad3] mb-1">Description</label>
                <p className="text-white">{selectedTransaction.description}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#b1bad3] mb-1">Date</label>
                <p className="text-white">
                  {new Date(selectedTransaction.createdAt || selectedTransaction.created_at).toLocaleString()}
                </p>
              </div>

              {(selectedTransaction.screenshotUrl || selectedTransaction.screenshot_url) && (
                <div>
                  <label className="block text-sm font-medium text-[#b1bad3] mb-2">Payment Screenshot</label>
                  <div className="bg-[#0f212e] border border-[#2f4553] rounded-lg p-4">
                    <img 
                      src={selectedTransaction.screenshotUrl || selectedTransaction.screenshot_url} 
                      alt="Payment Screenshot" 
                      className="max-w-full max-h-64 object-contain rounded-lg mx-auto"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        const nextElement = (e.target as HTMLImageElement).nextElementSibling;
                        if (nextElement) {
                          nextElement.textContent = 'Screenshot could not be loaded';
                          (nextElement as HTMLElement).style.display = 'block';
                        }
                      }}
                    />
                    <p className="text-[#b1bad3] text-sm text-center mt-2" style={{ display: 'none' }}>Screenshot could not be loaded</p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-[#b1bad3] mb-2">Admin Notes</label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes about this transaction..."
                  className="w-full p-3 bg-[#0f212e] border border-[#2f4553] rounded-lg text-white placeholder-[#b1bad3] focus:outline-none focus:ring-2 focus:ring-[#00d4aa] focus:border-transparent"
                  rows={3}
                />
              </div>
            </div>

            {selectedTransaction.status === 'pending' && (
              <div className="flex space-x-3">
                <button
                  onClick={() => handleTransactionAction(selectedTransaction._id || selectedTransaction.id, 'reject')}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-3 bg-red-500/20 text-red-300 border border-red-500/30 rounded-xl hover:bg-red-500/30 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <XCircle className="h-4 w-4" />
                  <span>{actionLoading ? 'Processing...' : 'Reject'}</span>
                </button>
                <button
                  onClick={() => handleTransactionAction(selectedTransaction._id || selectedTransaction.id, 'approve')}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-3 bg-[#00d4aa]/20 text-[#00d4aa] border border-[#00d4aa]/30 rounded-xl hover:bg-[#00d4aa]/30 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>{actionLoading ? 'Processing...' : 'Approve'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
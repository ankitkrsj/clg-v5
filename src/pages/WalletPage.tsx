import React, { useState } from 'react';
import { useWallet } from '../hooks/useWallet';
import { useForm } from 'react-hook-form';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { Wallet, Plus, History, DollarSign, Clock, TrendingUp, TrendingDown, CreditCard, QrCode, Upload, CheckCircle, AlertCircle, X } from 'lucide-react';

interface DepositFormData {
  amount: number;
}

export function WalletPage() {
  const { user } = useAuth();
  const { wallet, transactions, refetch } = useWallet();
  const [loading, setLoading] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState(0);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [uploadedScreenshot, setUploadedScreenshot] = useState<string | null>(null);
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm<DepositFormData>();

  // Fetch QR code from admin settings
  const fetchQRCode = async () => {
    try {

      const response = await api.getAdminSettings();
      setQrCodeUrl(response.settings.qrCodeUrl || 'https://via.placeholder.com/300x300?text=Payment+QR+Code');
    } catch (error) {
      console.error('Error fetching QR code:', error);
      setQrCodeUrl('https://via.placeholder.com/300x300?text=Payment+QR+Code');
    }
  };

  const handleDepositClick = async (amount: number) => {
    setDepositAmount(amount);
    setError('');
    await fetchQRCode();
    setShowQRModal(true);
  };

  const handleScreenshotUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file');
        return;
      }

      setScreenshotFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedScreenshot(e.target?.result as string);
        setError('');
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async () => {
    if (!user) {
      setError('User not authenticated');
      return;
    }

    if (!screenshotFile) {
      setError('Please upload a payment screenshot');
      return;
    }
    try {
      setLoading(true);
      setError('');

      // Convert file to base64 for now (simpler approach)
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(screenshotFile);
      });
      
      const base64Data = await base64Promise;


      // Create deposit request using the API
      await api.createDepositRequest(depositAmount, screenshotFile);

      setSuccess(true);
      setShowQRModal(false);
      setUploadedScreenshot(null);
      setScreenshotFile(null);
      setDepositAmount(0);
      await refetch();
      
      setTimeout(() => setSuccess(false), 5000);
    } catch (error: any) {
      console.error('Error submitting deposit request:', error);
      setError(error.message || 'Error submitting deposit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <Plus className="h-4 w-4 text-[#00d4aa]" />;
      case 'win':
        return <TrendingUp className="h-4 w-4 text-[#00d4aa]" />;
      case 'bet':
      case 'loss':
        return <TrendingDown className="h-4 w-4 text-red-400" />;
      case 'pending_deposit':
        return <Clock className="h-4 w-4 text-yellow-400" />;
      default:
        return <Clock className="h-4 w-4 text-[#b1bad3]" />;
    }
  };

  const getTransactionColor = (type: string, status?: string) => {
    if (type === 'pending_deposit') {
      switch (status) {
        case 'pending': return 'text-yellow-400';
        case 'approved': return 'text-[#00d4aa]';
        case 'rejected': return 'text-red-400';
        default: return 'text-[#b1bad3]';
      }
    }
    
    switch (type) {
      case 'deposit':
      case 'win':
        return 'text-[#00d4aa]';
      case 'bet':
      case 'loss':
        return 'text-red-400';
      default:
        return 'text-[#b1bad3]';
    }
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
            <AlertCircle className="h-3 w-3 mr-1" />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-[#00d4aa] to-[#00b4d8] rounded-xl flex items-center justify-center">
            <Wallet className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white">Wallet</h1>
        </div>
        <p className="text-[#b1bad3] text-lg">Manage your funds</p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-[#00d4aa]/20 border border-[#00d4aa]/50 text-[#00d4aa] px-6 py-4 rounded-xl text-center">
          <CheckCircle className="h-6 w-6 mx-auto mb-2" />
          <p className="font-bold">Deposit request submitted successfully!</p>
          <p className="text-sm">Your request is being reviewed by our admin team.</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-6 py-4 rounded-xl text-center">
          <AlertCircle className="h-6 w-6 mx-auto mb-2" />
          <p className="font-bold">{error}</p>
        </div>
      )}

      {/* Balance Card */}
      <div className="bg-gradient-to-br from-[#00d4aa] to-[#00b4d8] rounded-2xl p-8 text-center text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-20 translate-x-20" />
        <div className="relative z-10">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <DollarSign className="h-12 w-12" />
            <span className="text-5xl font-bold">${wallet?.balance.toFixed(2) || '0.00'}</span>
          </div>
          <p className="text-white/80 text-lg">Available Balance</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Deposit Form */}
        <div className="bg-[#1a2c38] border border-[#2f4553] rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
            <CreditCard className="h-5 w-5 text-[#00d4aa]" />
            <span>Add Funds</span>
          </h2>

          <div className="space-y-4">
            <p className="text-[#b1bad3] text-sm mb-4">
              Select an amount to deposit. You'll be shown a QR code for payment.
            </p>

            <div className="grid grid-cols-2 gap-3">
              {[10, 25, 50, 100, 250, 500].map((amount) => (
                <button
                  key={amount}
                  onClick={() => handleDepositClick(amount)}
                  disabled={loading}
                  className="px-4 py-4 bg-gradient-to-r from-[#00d4aa] to-[#00b4d8] hover:from-[#00c49a] hover:to-[#00a4c8] disabled:from-[#2f4553] disabled:to-[#2f4553] text-[#0f212e] disabled:text-[#b1bad3] rounded-xl transition-all font-bold transform hover:scale-105 disabled:hover:scale-100 disabled:cursor-not-allowed"
                >
                  ${amount}
                </button>
              ))}
            </div>

            <div className="relative">
              <input
                type="number"
                placeholder="Custom amount (min $1, max $10,000)"
                min="1"
                max="10000"
                disabled={loading}
                className="w-full p-4 bg-[#0f212e] border border-[#2f4553] rounded-xl text-white placeholder-[#b1bad3] focus:outline-none focus:ring-2 focus:ring-[#00d4aa] focus:border-transparent disabled:opacity-50"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const amount = parseFloat((e.target as HTMLInputElement).value);
                    if (amount >= 1 && amount <= 10000) {
                      handleDepositClick(amount);
                      (e.target as HTMLInputElement).value = '';
                    }
                  }
                }}
              />
            </div>
          </div>

          <div className="mt-6 p-4 bg-[#0f212e] border border-[#2f4553] rounded-lg">
            <p className="text-[#b1bad3] text-sm">
              <strong className="text-[#00d4aa]">How it works:</strong>
            </p>
            <ol className="text-[#b1bad3] text-sm mt-2 space-y-1">
              <li>1. Select deposit amount</li>
              <li>2. Scan QR code to make payment</li>
              <li>3. Upload payment screenshot</li>
              <li>4. Wait for admin approval</li>
            </ol>
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-[#1a2c38] border border-[#2f4553] rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
            <History className="h-5 w-5 text-[#00d4aa]" />
            <span>Recent Activity</span>
          </h2>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {transactions.length === 0 ? (
              <div className="text-center py-12">
                <History className="h-12 w-12 text-[#2f4553] mx-auto mb-4" />
                <p className="text-[#b1bad3]">No transactions yet</p>
                <p className="text-[#2f4553] text-sm">Your activity will appear here</p>
              </div>
            ) : (
              transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 bg-[#0f212e] border border-[#2f4553] rounded-lg hover:bg-[#1a2c38] transition-all"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-[#2f4553] rounded-lg">
                      {getTransactionIcon(transaction.type)}
                    </div>
                    <div>
                      <p className="text-white font-medium">{transaction.description}</p>
                      <div className="flex items-center space-x-2">
                        <p className="text-[#b1bad3] text-sm">
                          {new Date(transaction.created_at).toLocaleDateString()} at{' '}
                          {new Date(transaction.created_at).toLocaleTimeString()}
                        </p>
                        {transaction.status && getStatusBadge(transaction.status)}
                      </div>
                      {transaction.admin_notes && (
                        <p className="text-[#b1bad3] text-xs mt-1 italic">
                          Note: {transaction.admin_notes}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className={`font-bold ${getTransactionColor(transaction.type, transaction.status)}`}>
                    {transaction.amount >= 0 ? '+' : ''}${transaction.amount.toFixed(2)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQRModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a2c38] border border-[#2f4553] rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Complete Payment</h3>
              <button
                onClick={() => {
                  setShowQRModal(false);
                  setUploadedScreenshot(null);
                  setScreenshotFile(null);
                  setError('');
                }}
                className="p-2 text-[#b1bad3] hover:text-white transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="text-center mb-6">
              <p className="text-[#b1bad3] mb-2">Deposit Amount:</p>
              <p className="text-[#00d4aa] font-bold text-2xl">${depositAmount}</p>
            </div>

            <div className="text-center mb-6">
              <div className="bg-white p-4 rounded-xl inline-block mb-4">
                <img 
                  src={qrCodeUrl} 
                  alt="Payment QR Code" 
                  className="w-48 h-48 object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200x200?text=QR+Code+Not+Available';
                  }}
                />
              </div>
              <p className="text-[#b1bad3] text-sm">Scan this QR code to make payment</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#b1bad3] mb-2">
                  Upload Payment Screenshot *
                </label>
                <div className="border-2 border-dashed border-[#2f4553] rounded-xl p-6 text-center">
                  {uploadedScreenshot ? (
                    <div>
                      <img 
                        src={uploadedScreenshot} 
                        alt="Payment Screenshot" 
                        className="w-full max-h-32 object-contain rounded-lg mb-2"
                      />
                      <p className="text-[#00d4aa] text-sm font-medium">Screenshot uploaded successfully</p>
                      <button
                        onClick={() => {
                          setUploadedScreenshot(null);
                          setScreenshotFile(null);
                        }}
                        className="text-red-400 text-sm hover:text-red-300 mt-2"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="h-12 w-12 text-[#b1bad3] mx-auto mb-2" />
                      <p className="text-[#b1bad3] mb-2">Upload payment screenshot</p>
                      <p className="text-[#2f4553] text-xs mb-3">Max size: 5MB | Formats: JPG, PNG, GIF</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleScreenshotUpload}
                    className="hidden"
                    id="screenshot-upload"
                  />
                  <label
                    htmlFor="screenshot-upload"
                    className="cursor-pointer px-4 py-2 bg-[#00d4aa] text-[#0f212e] rounded-lg hover:bg-[#00c49a] transition-all font-medium inline-block"
                  >
                    {uploadedScreenshot ? 'Change File' : 'Choose File'}
                  </label>
                </div>
              </div>

              {error && (
                <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowQRModal(false);
                    setUploadedScreenshot(null);
                    setScreenshotFile(null);
                    setError('');
                  }}
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-[#2f4553] text-white rounded-xl hover:bg-[#3a5664] transition-all font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={onSubmit}
                  disabled={!uploadedScreenshot || loading}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-[#00d4aa] to-[#00b4d8] hover:from-[#00c49a] hover:to-[#00a4c8] disabled:from-[#2f4553] disabled:to-[#2f4553] text-[#0f212e] disabled:text-[#b1bad3] rounded-xl transition-all font-bold disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-[#0f212e] border-t-transparent rounded-full animate-spin" />
                      <span>Submitting...</span>
                    </div>
                  ) : (
                    'Submit Request'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
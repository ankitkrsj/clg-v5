import React, { useState } from 'react';
import { api } from '../../lib/api';
import { QrCode, Image, Save, Upload } from 'lucide-react';

export function AdminQRBanner() {
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [bannerText, setBannerText] = useState('');
  const [bannerActive, setBannerActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  React.useEffect(() => {
    fetchSettings();
  }, []);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const fetchSettings = async () => {
    try {
      const response = await api.getAdminSettings();
      const settings = response.settings;
      setQrCodeUrl(settings.qrCodeUrl || '');
      setBannerText(settings.headerBannerText || 'Welcome to ColorBet Casino!');
      setBannerActive(settings.headerBannerActive || true);
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.updateAdminSettings({
        qrCodeUrl,
        headerBannerText: bannerText,
        headerBannerActive: bannerActive,
      });

      showMessage('success', 'Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      showMessage('error', 'Error saving settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
            <QrCode className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">QR Code & Banner</h1>
            <p className="text-[#b1bad3]">Manage payment QR code and header banner</p>
          </div>
        </div>
      </div>

      {/* Message Display */}
      {message && (
        <div className={`p-4 rounded-lg border ${
          message.type === 'success' 
            ? 'bg-[#00d4aa]/20 border-[#00d4aa]/30 text-[#00d4aa]'
            : 'bg-red-500/20 border-red-500/30 text-red-300'
        }`}>
          <p>{message.text}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* QR Code Management */}
        <div className="bg-[#1a2c38] border border-[#2f4553] rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
            <QrCode className="h-5 w-5 text-purple-400" />
            <span>Payment QR Code</span>
          </h2>

          <div className="space-y-6">
            {/* Current QR Code */}
            <div className="text-center">
              <div className="w-48 h-48 bg-white rounded-xl mx-auto mb-4 flex items-center justify-center">
                {qrCodeUrl ? (
                  <img src={qrCodeUrl} alt="Payment QR Code" className="w-full h-full object-contain rounded-xl" />
                ) : (
                  <QrCode className="h-24 w-24 text-gray-400" />
                )}
              </div>
              <p className="text-[#b1bad3] text-sm">Current payment QR code</p>
            </div>

            {/* Upload New QR Code */}
            <div>
              <label className="block text-sm font-medium text-[#b1bad3] mb-2">
                QR Code URL
              </label>
              <input
                type="url"
                value={qrCodeUrl}
                onChange={(e) => setQrCodeUrl(e.target.value)}
                placeholder="Enter QR code image URL..."
                className="w-full p-4 bg-[#0f212e] border border-[#2f4553] rounded-xl text-white placeholder-[#b1bad3] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
              <p className="text-blue-300 text-sm">
                <strong>Instructions:</strong> Upload your QR code image to a service like Imgur, Google Drive, or Dropbox and paste the direct image URL above.
              </p>
            </div>
          </div>
        </div>

        {/* Banner Management */}
        <div className="bg-[#1a2c38] border border-[#2f4553] rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
            <Image className="h-5 w-5 text-purple-400" />
            <span>Header Banner</span>
          </h2>

          <div className="space-y-6">
            {/* Banner Preview */}
            {bannerActive && (
              <div className="bg-gradient-to-r from-[#00d4aa] to-[#00b4d8] p-4 rounded-xl text-center">
                <p className="text-[#0f212e] font-bold">{bannerText}</p>
              </div>
            )}

            {/* Banner Settings */}
            <div>
              <label className="block text-sm font-medium text-[#b1bad3] mb-2">
                Banner Text
              </label>
              <textarea
                value={bannerText}
                onChange={(e) => setBannerText(e.target.value)}
                placeholder="Enter banner text..."
                className="w-full p-4 bg-[#0f212e] border border-[#2f4553] rounded-xl text-white placeholder-[#b1bad3] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#b1bad3]">Show banner on homepage</span>
              <button
                onClick={() => setBannerActive(!bannerActive)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  bannerActive ? 'bg-purple-500' : 'bg-[#2f4553]'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    bannerActive ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Banner Styles */}
            <div>
              <label className="block text-sm font-medium text-[#b1bad3] mb-2">
                Banner Style
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button className="p-3 bg-gradient-to-r from-[#00d4aa] to-[#00b4d8] rounded-lg text-[#0f212e] font-medium">
                  Primary
                </button>
                <button className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg text-white font-medium">
                  Purple
                </button>
                <button className="p-3 bg-gradient-to-r from-red-500 to-red-600 rounded-lg text-white font-medium">
                  Alert
                </button>
                <button className="p-3 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg text-white font-medium">
                  Warning
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="text-center">
        <button
          onClick={handleSave}
          disabled={loading}
          className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500 disabled:from-[#2f4553] disabled:to-[#2f4553] text-white disabled:text-[#b1bad3] font-bold py-4 px-8 rounded-xl transition-all disabled:cursor-not-allowed flex items-center space-x-2 mx-auto"
        >
          <Save className="h-5 w-5" />
          <span>{loading ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>
    </div>
  );
}
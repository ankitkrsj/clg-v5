import React from 'react';
import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAdmin } from '../contexts/AdminContext';
import { useWallet } from '../hooks/useWallet';
import { api } from '../lib/api';
import { Coins, Home, History, Wallet, LogOut, Gamepad2, Menu, X, Shield } from 'lucide-react';

export function Layout() {
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdmin();
  const { wallet } = useWallet();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [bannerSettings, setBannerSettings] = useState({
    text: 'Welcome to ColorBet Casino!',
    active: true,
  });

  useEffect(() => {
    fetchBannerSettings();
  }, []);

  const fetchBannerSettings = async () => {
    try {
      const response = await api.getAdminSettings();
      setBannerSettings({
        text: response.settings.headerBannerText || 'Welcome to ColorBet Casino!',
        active: response.settings.headerBannerActive !== false,
      });
    } catch (error) {
      console.error('Error fetching banner settings:', error);
      // Use defaults if API call fails
      setBannerSettings({
        text: 'Welcome to ColorBet Casino!',
        active: true,
      });
    }
  };

  const navigation = [
    { name: 'Casino', href: '/dashboard', icon: Home },
    { name: 'Game', href: '/game', icon: Gamepad2 },
    { name: 'Wallet', href: '/wallet', icon: Wallet },
    { name: 'History', href: '/history', icon: History },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f212e] text-white">
      {/* Header Banner */}
      {bannerSettings.active && (
        <div className="bg-gradient-to-r from-[#00d4aa] to-[#00b4d8] p-3 text-center">
          <p className="text-[#0f212e] font-bold">🎉 {bannerSettings.text} 🎉</p>
        </div>
      )}

      {/* Top Navigation */}
      <nav className="bg-[#1a2c38] border-b border-[#2f4553]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-8">
              <Link to="/dashboard" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-[#00d4aa] to-[#00b4d8] rounded-lg flex items-center justify-center">
                  <Gamepad2 className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">ColorBet</span>
              </Link>
              
              {/* Desktop Navigation */}
              <div className="hidden md:flex space-x-1">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all text-sm font-medium ${
                        isActive
                          ? 'bg-[#00d4aa] text-[#0f212e]'
                          : 'text-[#b1bad3] hover:text-white hover:bg-[#2f4553]'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              {/* Balance */}
              <div className="hidden sm:flex items-center space-x-2 bg-[#2f4553] px-4 py-2 rounded-lg">
                <Coins className="h-4 w-4 text-[#00d4aa]" />
                <span className="text-[#00d4aa] font-bold">
                  ${wallet?.balance.toFixed(2) || '0.00'}
                </span>
              </div>
              
              {/* User menu */}
              <div className="hidden sm:flex items-center space-x-3">
                <div className="text-[#b1bad3] text-sm">
                  {user?.user_metadata?.username || user?.email?.split('@')[0]}
                </div>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="flex items-center space-x-2 text-red-400 hover:text-red-300 hover:bg-[#2f4553] px-3 py-2 rounded-lg transition-all"
                  >
                    <Shield className="h-4 w-4" />
                    <span className="text-sm font-medium">Admin Panel</span>
                  </Link>
                )}
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-2 text-[#b1bad3] hover:text-white hover:bg-[#2f4553] px-3 py-2 rounded-lg transition-all"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-[#b1bad3] hover:text-white"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#1a2c38] border-t border-[#2f4553]">
            <div className="px-4 py-4 space-y-2">
              {/* Balance */}
              <div className="flex items-center justify-between p-3 bg-[#2f4553] rounded-lg mb-4">
                <div className="flex items-center space-x-2">
                  <Coins className="h-4 w-4 text-[#00d4aa]" />
                  <span className="text-[#00d4aa] font-bold">
                    ${wallet?.balance.toFixed(2) || '0.00'}
                  </span>
                </div>
                <div className="text-[#b1bad3] text-sm">
                  {user?.user_metadata?.username || user?.email?.split('@')[0]}
                </div>
              </div>

              {/* Navigation */}
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 p-3 rounded-lg transition-all ${
                      isActive
                        ? 'bg-[#00d4aa] text-[#0f212e]'
                        : 'text-[#b1bad3] hover:text-white hover:bg-[#2f4553]'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              })}

              {/* Admin link */}
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-3 p-3 text-red-400 hover:text-red-300 hover:bg-[#2f4553] rounded-lg transition-all"
                >
                  <Shield className="h-5 w-5" />
                  <span className="font-medium">Admin Panel</span>
                </Link>
              )}

              {/* Sign out */}
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-3 p-3 text-[#b1bad3] hover:text-white hover:bg-[#2f4553] rounded-lg transition-all w-full"
              >
                <LogOut className="h-5 w-5" />
                <span className="font-medium">Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
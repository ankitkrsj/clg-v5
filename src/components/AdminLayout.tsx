import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Shield, Users, CreditCard, QrCode, Settings, Home, LogOut, Menu, X, AlertTriangle } from 'lucide-react';
import { useState } from 'react';

export function AdminLayout() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: Home },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'QR & Banner', href: '/admin/qr-banner', icon: QrCode },
    { name: 'Transactions', href: '/admin/transactions', icon: CreditCard },
    { name: 'Security', href: '/admin/security', icon: AlertTriangle },
    { name: 'Game Control', href: '/admin/game-control', icon: Settings },
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
      {/* Top Navigation */}
      <nav className="bg-[#1a2c38] border-b border-[#2f4553]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-8">
              <Link to="/admin" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">Admin Panel</span>
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
                          ? 'bg-red-500 text-white'
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
              {/* User menu */}
              <div className="hidden sm:flex items-center space-x-3">
                <div className="text-[#b1bad3] text-sm">
                  Admin: {user?.email?.split('@')[0]}
                </div>
                <Link
                  to="/dashboard"
                  className="text-[#b1bad3] hover:text-white hover:bg-[#2f4553] px-3 py-2 rounded-lg transition-all text-sm"
                >
                  User View
                </Link>
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
                        ? 'bg-red-500 text-white'
                        : 'text-[#b1bad3] hover:text-white hover:bg-[#2f4553]'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              })}

              {/* User actions */}
              <div className="border-t border-[#2f4553] pt-4 mt-4">
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-3 p-3 text-[#b1bad3] hover:text-white hover:bg-[#2f4553] rounded-lg transition-all"
                >
                  <Home className="h-5 w-5" />
                  <span className="font-medium">User View</span>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-3 p-3 text-[#b1bad3] hover:text-white hover:bg-[#2f4553] rounded-lg transition-all w-full"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="font-medium">Sign Out</span>
                </button>
              </div>
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
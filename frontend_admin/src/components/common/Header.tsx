import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { UserRole } from '../../types/auth';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

const Header = () => {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getTabsForRole = () => {
    if (!user) return [];

    const baseTabs = [
      { name: '前回の結果', path: '/test/history' },
      { name: 'コーチング', path: '/coaching' },
      { name: 'テスト', path: '/test' },
      { name: 'このアプリについて', path: '/about' },
      { name: 'お問合せ', path: '/contact' }
    ];

    // Add 1on1 tab for coaches and parents with function
    if (
      user.role === UserRole.COACH ||
      user.head_coach_function ||
      (user.role === UserRole.FATHER && user.parent_function) ||
      (user.role === UserRole.MOTHER && user.parent_function)
    ) {
      baseTabs.splice(1, 0, { name: '1on1', path: '/comparison' });
    }

    return baseTabs;
  };

  const tabs = getTabsForRole();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and App Name */}
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="ml-2 text-xl font-semibold text-gray-900">
                スポーツマンシップアプリ
              </span>
            </Link>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex space-x-8">
            {tabs.map((tab) => (
              <Link
                key={tab.path}
                to={tab.path}
                className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                  location.pathname.startsWith(tab.path)
                    ? 'tab-active'
                    : 'tab-inactive'
                }`}
              >
                {tab.name}
              </Link>
            ))}
          </nav>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              <span>{user?.name}</span>
              <ChevronDownIcon className="ml-1 h-4 w-4" />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
                <div className="py-1">
                  <div className="px-4 py-2 text-sm text-gray-500 border-b">
                    {user?.email}
                  </div>
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    プロフィール
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    ログアウト
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-gray-200">
        <nav className="px-4 py-2 space-y-1">
          {tabs.map((tab) => (
            <Link
              key={tab.path}
              to={tab.path}
              className={`block px-3 py-2 text-sm font-medium rounded-md ${
                location.pathname.startsWith(tab.path)
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {tab.name}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Header;
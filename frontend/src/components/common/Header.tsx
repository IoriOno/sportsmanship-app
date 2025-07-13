// ファイル: frontend/src/components/common/Header.tsx
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { UserRole } from '../../types/auth';
import { 
  ChevronDownIcon, 
  Bars3Icon, 
  XMarkIcon,
  UserCircleIcon,
  UserGroupIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

const Header = () => {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getTabsForRole = () => {
    if (!user) return [];

    const baseTabs = [
      { name: 'ダッシュボード', path: '/dashboard' },
      { name: 'テスト', path: '/test' },
      { name: '履歴', path: '/test/history' }
    ];

    // Add 1on1 tab for coaches and parents with function
    if (
      user.role === UserRole.COACH ||
      user.head_coach_function ||
      (user.role === UserRole.FATHER && user.parent_function) ||
      (user.role === UserRole.MOTHER && user.parent_function)
    ) {
      baseTabs.push({ name: '1on1', path: '/comparison' });
    }

    // Add coaching tab for all users
    baseTabs.push({ name: 'コーチング', path: '/coaching' });

    // Add head coach management for coaches with head coach function
    if (user.head_coach_function) {
      baseTabs.push({ name: 'ヘッドコーチ管理', path: '/head-coach' });
    }

    // Add head parent management for parents with head parent function
    if (user.head_parent_function) {
      baseTabs.push({ name: 'ヘッド親管理', path: '/head-parent' });
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

          {/* Desktop Navigation Tabs */}
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

          {/* Desktop User Menu */}
          <div className="hidden md:relative md:block">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              <span>{user?.name}</span>
              <ChevronDownIcon className="ml-1 h-4 w-4" />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                <div className="py-1">
                  <div className="px-4 py-2 text-sm text-gray-500 border-b">
                    {user?.email}
                  </div>
                  <Link
                    to="/profile"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <UserCircleIcon className="h-4 w-4 mr-2" />
                    プロフィール
                  </Link>
                  <Link
                    to="/club/join"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <UserGroupIcon className="h-4 w-4 mr-2" />
                    クラブ管理
                  </Link>
                  <hr className="my-1" />
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
                    ログアウト
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 border-t border-gray-200">
            {tabs.map((tab) => (
              <Link
                key={tab.path}
                to={tab.path}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  location.pathname.startsWith(tab.path)
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {tab.name}
              </Link>
            ))}
          </div>
          
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="px-4">
              <div className="text-base font-medium text-gray-800">{user?.name}</div>
              <div className="text-sm font-medium text-gray-500">{user?.email}</div>
            </div>
            <div className="mt-3 px-2 space-y-1">
              <Link
                to="/profile"
                className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <UserCircleIcon className="h-5 w-5 mr-3" />
                プロフィール
              </Link>
              <Link
                to="/club/join"
                className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <UserGroupIcon className="h-5 w-5 mr-3" />
                クラブ管理
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center w-full px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3" />
                ログアウト
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
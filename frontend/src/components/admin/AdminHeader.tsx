import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  CogIcon,
  UsersIcon,
  QuestionMarkCircleIcon,
  ChartBarIcon,
  HomeIcon,
  BuildingOffice2Icon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

const AdminHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_email');
    navigate('/admin/login');
  };

  const navigationItems = [
    {
      name: 'ダッシュボード',
      href: '/admin/dashboard',
      icon: HomeIcon,
      current: isActive('/admin/dashboard') || isActive('/admin')
    },
    {
      name: 'ユーザー管理',
      href: '/admin/users',
      icon: UsersIcon,
      current: isActive('/admin/users')
    },
    {
      name: '質問管理',
      href: '/admin/questions',
      icon: QuestionMarkCircleIcon,
      current: isActive('/admin/questions')
    },
    {
      name: 'クラブ管理',
      href: '/admin/clubs',
      icon: BuildingOffice2Icon,
      current: isActive('/admin/clubs')
    },
    {
      name: '管理者管理',
      href: '/admin/admins',
      icon: ShieldCheckIcon,
      current: isActive('/admin/admins')
    }
  ];

  return (
    <header className="bg-red-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <CogIcon className="h-8 w-8 text-white mr-3" />
            <div>
              <h1 className="text-xl font-bold text-white">
                管理システム
              </h1>
              <div className="text-xs text-red-100">
                Sportsmanship App Admin
              </div>
            </div>
          </div>

          <nav className="hidden md:flex space-x-8">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    item.current
                      ? 'bg-red-700 text-white'
                      : 'text-red-100 hover:bg-red-500 hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center space-x-4">
            <a
              href="http://localhost:8000/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-100 hover:bg-red-500 hover:text-white rounded-md transition-colors"
            >
              <ChartBarIcon className="h-4 w-4 mr-2" />
              API管理
            </a>

            <button
              onClick={handleLogout}
              className="inline-flex items-center px-4 py-2 bg-red-800 text-white text-sm font-medium rounded-md hover:bg-red-900 transition-colors"
            >
              ログアウト
            </button>
          </div>
        </div>

        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    item.current
                      ? 'bg-red-700 text-white'
                      : 'text-red-100 hover:bg-red-500 hover:text-white'
                  }`}
                >
                  <div className="flex items-center">
                    <Icon className="h-5 w-5 mr-3" />
                    {item.name}
                  </div>
                </Link>
              );
            })}
            
            <div className="border-t border-red-700 pt-2 mt-2">
              <button
                onClick={handleLogout}
                className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-red-100 hover:bg-red-500 hover:text-white transition-colors"
              >
                ログアウト
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
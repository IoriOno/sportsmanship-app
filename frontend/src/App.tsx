// ファイル: frontend/src/App.tsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import TestPage from './pages/test/TestPage';
import TestResultPage from './pages/test/TestResultPage';
import TestHistoryPage from './pages/test/TestHistoryPage';
import ComparisonPage from './pages/comparison/ComparisonPage';
import CoachingPage from './pages/coaching/CoachingPage';
import QuestionAdminPage from './pages/admin/QuestionAdminPage';
import UserAdminPage from './pages/admin/UserAdminPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import EnvironmentIndicator from './components/common/EnvironmentIndicator';
import ClubAdminPage from './pages/admin/ClubAdminPage';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminAuthGuard from './components/admin/AdminAuthGuard';
import AdminUserManagement from './pages/admin/AdminUserManagement';
import JoinClubPage from './pages/club/JoinClubPage';
import ProfilePage from './pages/profile/ProfilePage';



function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* 管理者ページではHeader/Footerを表示しない */}
        {isAuthenticated && !window.location.pathname.startsWith('/admin') && <Header />}
        
        <main className="flex-1">
          <Routes>
            {/* Public routes */}
            <Route 
              path="/login" 
              element={!isAuthenticated ? <LoginPage /> : <Navigate to="/dashboard" />} 
            />
            <Route 
              path="/register" 
              element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/dashboard" />} 
            />
            
            {/* Protected routes */}
            <Route 
              path="/dashboard" 
              element={isAuthenticated ? <DashboardPage /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/test" 
              element={isAuthenticated ? <TestPage /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/test/result/:resultId" 
              element={<TestResultPage />} 
            />
            <Route 
              path="/test/history" 
              element={isAuthenticated ? <TestHistoryPage /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/comparison" 
              element={isAuthenticated ? <ComparisonPage /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/coaching" 
              element={isAuthenticated ? <CoachingPage /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/club/join" 
              element={isAuthenticated ? <JoinClubPage /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/profile" 
              element={isAuthenticated ? <ProfilePage /> : <Navigate to="/login" />} 
            />
            
            {/* Admin routes - 管理者認証必須 */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin" element={<Navigate to="/admin/dashboard" />} />
            <Route 
              path="/admin/dashboard" 
              element={
                <AdminAuthGuard>
                  <AdminDashboard />
                </AdminAuthGuard>
              } 
            />
            <Route 
              path="/admin/questions" 
              element={
                <AdminAuthGuard>
                  <QuestionAdminPage />
                </AdminAuthGuard>
              } 
            />
            <Route 
              path="/admin/users" 
              element={
                <AdminAuthGuard>
                  <UserAdminPage />
                </AdminAuthGuard>
              } 
            />
            <Route 
              path="/admin/clubs" 
              element={
                <AdminAuthGuard>
                  <ClubAdminPage />
                </AdminAuthGuard>
              } 
            />
            <Route 
              path="/admin/admins" 
              element={
                <AdminAuthGuard>
                  <AdminUserManagement />
                </AdminAuthGuard>
              } 
            />
            
            {/* Default routes */}
            <Route 
              path="/" 
              element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} 
            />
            <Route 
              path="*" 
              element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} 
            />
          </Routes>
        </main>
        
        {/* 管理者ページではHeader/Footerを表示しない */}
        {isAuthenticated && !window.location.pathname.startsWith('/admin') && <Footer />}
        
        {/* 環境情報インジケーター */}
        <EnvironmentIndicator />
      </div>
    </Router>
  );
}

export default App;
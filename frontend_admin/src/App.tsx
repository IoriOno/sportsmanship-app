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

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {isAuthenticated && <Header />}
        
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
              element={isAuthenticated ? <TestResultPage /> : <Navigate to="/login" />} 
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
            
            {/* Admin routes */}
            <Route 
              path="/admin/questions" 
              element={isAuthenticated ? <QuestionAdminPage /> : <Navigate to="/login" />} 
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
        
        {isAuthenticated && <Footer />}
      </div>
    </Router>
  );
}

export default App;
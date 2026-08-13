import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Toast from './components/Toast';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import UserStoresPage from './pages/UserStoresPage';
import OwnerDashboardPage from './pages/OwnerDashboardPage';

function AppContent() {
  const { user, loading } = useAuth();
  const [authView, setAuthView] = useState('login'); // 'login' or 'signup'

  if (loading) {
    return (
      <div className="app-container" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ color: 'var(--text-muted)', fontSize: '1rem', fontWeight: 600 }}>
          Initializing StoreRating Platform...
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="app-container">
        {authView === 'login' ? (
          <LoginPage onNavigateSignup={() => setAuthView('signup')} />
        ) : (
          <SignupPage onNavigateLogin={() => setAuthView('login')} />
        )}
        <Toast />
      </div>
    );
  }

  return (
    <div className="app-container">
      <Navbar />
      {user.role === 'ADMIN' && <AdminDashboardPage />}
      {user.role === 'USER' && <UserStoresPage />}
      {user.role === 'STORE_OWNER' && <OwnerDashboardPage />}
      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

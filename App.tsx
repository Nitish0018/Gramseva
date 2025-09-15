import React, { useState, useEffect } from 'react';
import BottomNav from './components/BottomNav';
import MarketDashboard from './components/MarketDashboard';
import RealTimeMarketDashboard from './components/RealTimeMarketDashboard';
import ServiceMarketplace from './components/ServiceMarketplace';
import Chat from './components/Chat';
import Profile from './components/Profile';
import Advisory from './components/Advisory';
import Settings from './components/Settings';
import AdminDashboard from './components/AdminDashboard';
import AdminLogin from './components/AdminLogin';
import ToastContainer from './components/ToastContainer';
import { LanguageProvider } from './contexts/LanguageContext';
import MarketHeader from './components/MarketHeader';
import type { Page } from './types';
import { adminApi } from './services/adminService';

const App: React.FC = () => {
  const [activePage, setActivePage] = useState<Page>('market');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminLoginLoading, setAdminLoginLoading] = useState(false);
  const [adminLoginError, setAdminLoginError] = useState<string>();
  const [useRealtimeDashboard, setUseRealtimeDashboard] = useState(true); // Default to real-time

  useEffect(() => {
    // Check if admin is already logged in
    const adminToken = localStorage.getItem('adminToken');
    if (adminToken && activePage === 'admin') {
      setIsAdminLoggedIn(true);
    }

    // Check for admin access via URL hash
    const checkAdminAccess = () => {
      if (window.location.hash === '#admin') {
        setActivePage('admin');
        window.location.hash = ''; // Clear the hash
      }
    };

    checkAdminAccess();
    window.addEventListener('hashchange', checkAdminAccess);
    
    return () => {
      window.removeEventListener('hashchange', checkAdminAccess);
    };
  }, [activePage]);

  const handleAdminLogin = async (credentials: { username: string; password: string }) => {
    setAdminLoginLoading(true);
    setAdminLoginError(undefined);

    try {
      const response = await adminApi.login(credentials);
      
      if (response.success && response.token) {
        localStorage.setItem('adminToken', response.token);
        setIsAdminLoggedIn(true);
        setAdminLoginError(undefined);
      } else {
        setAdminLoginError(response.error || 'Invalid credentials. Please check username and password.');
      }
    } catch (error) {
      setAdminLoginError('Network error. Please check your connection and try again.');
    } finally {
      setAdminLoginLoading(false);
    }
  };

  const handleAdminLogout = () => {
    adminApi.logout();
    setIsAdminLoggedIn(false);
    setActivePage('market'); // Redirect to market page
  };

  const renderPage = () => {
    switch (activePage) {
      case 'market':
        return useRealtimeDashboard ? <RealTimeMarketDashboard /> : <MarketDashboard />;
      case 'services':
        return <ServiceMarketplace />;
      case 'advisory':
        return <Advisory />;
      case 'chat':
        return <Chat />;
      case 'profile':
        return <Profile />;
      case 'settings':
        return <Settings onNavigateToProfile={() => setActivePage('profile')} />;
      case 'admin':
        if (!isAdminLoggedIn) {
          return (
            <AdminLogin 
              onLogin={handleAdminLogin}
              isLoading={adminLoginLoading}
              error={adminLoginError}
            />
          );
        }
        return <AdminDashboard onLogout={handleAdminLogout} />;
      default:
        return useRealtimeDashboard ? <RealTimeMarketDashboard /> : <MarketDashboard />;
    }
  };

  // Full-screen admin interface
  if (activePage === 'admin') {
    return (
      <LanguageProvider>
        <div className="min-h-screen bg-background">
          {renderPage()}
          <ToastContainer />
        </div>
      </LanguageProvider>
    );
  }

  // Regular user interface with bottom navigation
  return (
    <LanguageProvider>
      <div className="h-screen w-screen flex flex-col font-sans text-textPrimary bg-background">
      {/* Toggle button for market dashboard - only show on market page */}
      {activePage === 'market' && (
        <MarketHeader
          useRealtimeDashboard={useRealtimeDashboard}
          setUseRealtimeDashboard={setUseRealtimeDashboard}
        />
      )}
      
      <main className="flex-1 overflow-y-auto pb-20">
        <div className="max-w-4xl mx-auto p-4">
          {renderPage()}
        </div>
      </main>
      <BottomNav activePage={activePage} setActivePage={setActivePage} />
      <ToastContainer />
    </div>
    </LanguageProvider>
  );
};

export default App;

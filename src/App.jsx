import React, { useState } from 'react';
import Navbar from './shared/components/Navbar';
import Toast from './shared/components/Toast';
import { CarmasterView } from './features/carmaster';
import { PartnerAdminView, ManagerDashboard } from './features/partner';
import { useRequestStore } from './core/store/useRequestStore';
import { APP_CONFIG } from './core/config';
import { runLegacyCleanup } from './core/services/migration/LegacyCleanupService';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-rose-50 text-rose-900">
          <h1 className="text-2xl font-black mb-4">Something went wrong.</h1>
          <p className="font-mono text-sm bg-white p-4 rounded-xl border border-rose-200 shadow-sm max-w-2xl overflow-auto">
            {this.state.error.message}
          </p>
          <pre className="text-xs mt-2 text-rose-800/60 overflow-auto max-w-2xl">
            {this.state.error.stack}
          </pre>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition"
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function AppContent() {
  const [activeRole, setActiveRole] = useState('carmaster');
  const _hasHydrated = useRequestStore(state => state._hasHydrated);
  const [isTooLong, setIsTooLong] = useState(false);

  const { syncWithLocalStorage, fetchRequests } = useRequestStore();

  // Initial fetch from server
  React.useEffect(() => {
    if (_hasHydrated) {
      fetchRequests();
    }
  }, [_hasHydrated, fetchRequests]);

  // Set up polling for real-time sync (every 5 seconds)
  React.useEffect(() => {
    const interval = setInterval(() => {
      fetchRequests();
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchRequests]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (!_hasHydrated) setIsTooLong(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, [_hasHydrated]);

  // Listen for cross-tab storage updates
  React.useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === APP_CONFIG.STORAGE_KEY) {
        syncWithLocalStorage();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [syncWithLocalStorage]);

  // Clean up legacy storage keys
  React.useEffect(() => {
    runLegacyCleanup();
  }, []);

  if (!_hasHydrated && !isTooLong) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-hyundai-blue border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-bold text-slate-400 animate-pulse">데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-hyundai-blue/20">
      <Toast />
      <Navbar activeRole={activeRole} setActiveRole={setActiveRole} />

      <main className="max-w-[1400px] mx-auto px-6 py-10">
        {activeRole === 'carmaster' && <CarmasterView />}
        {activeRole === 'partner_carview' && <PartnerAdminView partnerFilter="카뷰" />}
        {activeRole === 'partner_cts' && <PartnerAdminView partnerFilter="CTS컴퍼니" />}
        {activeRole === 'manager' && <ManagerDashboard />}
      </main>

      <footer className="max-w-[1400px] mx-auto px-6 py-10 border-t border-slate-100 mt-20">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 opacity-40">
          <p className="text-xs font-medium">© 2025 HYUNDAI Certified Pre-Owned. All rights reserved.</p>
          <div className="flex gap-8 text-[10px] font-bold uppercase tracking-widest">
            <a href="#" className="hover:text-hyundai-blue transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-hyundai-blue transition-colors">Operation Terms</a>
            <a href="#" className="hover:text-hyundai-blue transition-colors">Partner Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Mantine Imports
import '@mantine/core/styles.css';
import { MantineProvider, createTheme } from '@mantine/core';

const theme = createTheme({
  primaryColor: 'hyundai-blue',
  colors: {
    'hyundai-blue': [
      '#e0e7ff', '#c7d2fe', '#a5b4fc', '#818cf8', '#6366f1',
      '#4f46e5', '#4338ca', '#3730a3', '#002C5F', '#1e1b4b'
    ],
    'hyundai-navy': [
      '#e6ebef', '#ccd7e0', '#99afc1', '#6687a2', '#335f83',
      '#003764', '#002C5F', '#00254f', '#001e3f', '#00172f'
    ],
  },
  fontFamily: 'Spoqa Han Sans Neo, sans-serif',
  headings: { fontFamily: 'Spoqa Han Sans Neo, sans-serif' },
});

export default function App() {
  return (
    <ErrorBoundary>
      <MantineProvider theme={theme}>
        <AppContent />
      </MantineProvider>
    </ErrorBoundary>
  );
}

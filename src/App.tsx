import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { Dashboard } from './features/dashboard/Dashboard';
import { Horizon } from './features/horizon/Horizon';
import { Daily } from './features/daily/Daily';
import { TransactionsList } from './features/transactions/TransactionsList';
import { DayTransactions } from './features/daily/DayTransactions';
import { Savings } from './features/savings/Savings';
import { Tags } from './features/tags/Tags';
import { TransactionProvider } from './context/TransactionContext';
import { useFinanceStore, checkInitialAuth } from './store/useFinanceStore';
import { Menu } from './features/menu/Menu';
import { AuthPage } from './features/auth/AuthPage';

export const FOCUS_THEMES: Record<string, {
  hex: string;
  hover: string;
  light: string;
  lightBorder: string;
  accentText: string;
  shadow: string;
}> = {
  orange: {
    hex: '#FF5722',
    hover: '#E64A19',
    light: 'rgba(255, 87, 34, 0.08)',
    lightBorder: 'rgba(255, 87, 34, 0.2)',
    accentText: '#FF5722',
    shadow: 'rgba(255, 87, 34, 0.2)',
  },
  emerald: {
    hex: '#10B981',
    hover: '#059669',
    light: 'rgba(16, 185, 129, 0.08)',
    lightBorder: 'rgba(16, 185, 129, 0.2)',
    accentText: '#10B981',
    shadow: 'rgba(16, 185, 129, 0.2)',
  },
  blue: {
    hex: '#3B82F6',
    hover: '#2563EB',
    light: 'rgba(59, 130, 246, 0.08)',
    lightBorder: 'rgba(59, 130, 246, 0.2)',
    accentText: '#3B82F6',
    shadow: 'rgba(59, 130, 246, 0.2)',
  },
  violet: {
    hex: '#8B5CF6',
    hover: '#7C3AED',
    light: 'rgba(139, 92, 246, 0.08)',
    lightBorder: 'rgba(139, 92, 246, 0.2)',
    accentText: '#8B5CF6',
    shadow: 'rgba(139, 92, 246, 0.2)',
  },
  crimson: {
    hex: '#F43F5E',
    hover: '#E11D48',
    light: 'rgba(244, 63, 94, 0.08)',
    lightBorder: 'rgba(244, 63, 94, 0.2)',
    accentText: '#F43F5E',
    shadow: 'rgba(244, 63, 94, 0.2)',
  }
};

export default function App() {
  const darkMode = useFinanceStore((state) => state.darkMode);
  const primaryColor = useFinanceStore((state) => state.primaryColor);
  const isLoggedIn = useFinanceStore((state) => state.isLoggedIn);
  const logoutUser = useFinanceStore((state) => state.logoutUser);

  // Monitor activity and handle session timeout
  useEffect(() => {
    if (!isLoggedIn) return;

    let lastUpdate = 0;
    const updateSessionExpiry = () => {
      const now = Date.now();
      if (now - lastUpdate > 30000) { // Limit updates to once every 30 seconds
        lastUpdate = now;
        if (typeof window !== 'undefined') {
          localStorage.setItem('sessionExpiry', String(now + 2 * 60 * 60 * 1000));
        }
      }
    };

    // Update expiry initially on activity setup
    const now = Date.now();
    lastUpdate = now;
    if (typeof window !== 'undefined') {
      localStorage.setItem('sessionExpiry', String(now + 2 * 60 * 60 * 1000));
    }

    const activityEvents = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    activityEvents.forEach((event) => {
      window.addEventListener(event, updateSessionExpiry);
    });

    const checkInterval = setInterval(() => {
      if (!checkInitialAuth()) {
        logoutUser();
      }
    }, 10000); // Check every 10 seconds

    return () => {
      activityEvents.forEach((event) => {
        window.removeEventListener(event, updateSessionExpiry);
      });
      clearInterval(checkInterval);
    };
  }, [isLoggedIn, logoutUser]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const root = window.document.documentElement;
      if (darkMode) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [darkMode]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const theme = FOCUS_THEMES[primaryColor] || FOCUS_THEMES.orange;
      let styleTag = document.getElementById('theme-style-override');
      if (!styleTag) {
        styleTag = document.createElement('style');
        styleTag.id = 'theme-style-override';
        document.head.appendChild(styleTag);
      }
      styleTag.innerHTML = `
        :root {
          --primary-color: ${theme.hex};
          --primary-hover: ${theme.hover};
          --primary-light: ${theme.light};
          --primary-light-border: ${theme.lightBorder};
        }
        .text-\\[\\#FF5722\\], .text-\\[\\#F15A2B\\] { color: ${theme.hex} !important; }
        .bg-\\[\\#FF5722\\], .bg-\\[\\#F15A2B\\] { background-color: ${theme.hex} !important; }
        .border-\\[\\#FF5722\\], .border-\\[\\#F15A2B\\] { border-color: ${theme.hex} !important; }
        
        .hover\\:bg-\\[\\#eb4b18\\]:hover, .hover\\:bg-\\[\\#E64A19\\]:hover, .hover\\:bg-\\[\\#FF5722\\]:hover {
          background-color: ${theme.hover} !important;
        }
        
        .bg-orange-50 { background-color: ${theme.light} !important; }
        .dark .dark\\:bg-orange-950\\/10 { background-color: ${theme.light} !important; }
        
        .border-orange-100 { border-color: ${theme.lightBorder} !important; }
        .dark .dark\\:border-orange-900\\/30 { border-color: ${theme.lightBorder} !important; }
        
        .hover\\:border-\\[\\#FF5722\\]:hover { border-color: ${theme.hex} !important; }
        .hover\\:text-\\[\\#FF5722\\]:hover { color: ${theme.hex} !important; }
        .text-orange-100 { color: ${theme.lightBorder} !important; }
        .bg-orange-100 { background-color: ${theme.light} !important; }
        
        .focus\\:ring-\\[\\#FF5722\\]:focus { --tw-ring-color: ${theme.hex} !important; }
        .focus\\:border-\\[\\#FF5722\\]:focus { border-color: ${theme.hex} !important; }
        
        .text-\\[\\#F15A2B\\] { color: ${theme.hex} !important; }
        .bg-\\[\\#F15A2B\\] { background-color: ${theme.hex} !important; }
      `;
    }
  }, [primaryColor]);

  if (!isLoggedIn) {
    return (
      <TransactionProvider>
        <AuthPage />
      </TransactionProvider>
    );
  }

  return (
    <TransactionProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Daily />} />
            <Route path="/totais" element={<Dashboard />} />
            <Route path="/tags" element={<Tags />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/dia/:day" element={<DayTransactions />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
          {/* Full screen routes without bottom nav */}
          <Route path="/horizonte" element={<Horizon />} />
          <Route path="/economizado" element={<Savings />} />
          <Route path="/transactions" element={<TransactionsList />} />
        </Routes>
      </BrowserRouter>
    </TransactionProvider>
  );
}

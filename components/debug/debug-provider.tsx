"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { BookingDebugDashboard } from './booking-debug-dashboard';
import { ConsoleMonitorProvider } from '@/lib/hooks/use-console-monitor';
import { initializeGlobalErrorHandling, initializeNetworkInterceptor } from '@/lib/utils/debug-initializer';

interface DebugContextType {
  isDebugMode: boolean;
  isDashboardOpen: boolean;
  toggleDashboard: () => void;
  enableDebugMode: () => void;
  disableDebugMode: () => void;
}

const DebugContext = createContext<DebugContextType | null>(null);

interface DebugProviderProps {
  children: React.ReactNode;
  enableInProduction?: boolean;
}

export function DebugProvider({ children, enableInProduction = false }: DebugProviderProps) {
  const [isDebugMode, setIsDebugMode] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);

  useEffect(() => {
    // Enable debug mode in development or if explicitly enabled
    const shouldEnable = process.env.NODE_ENV === 'development' || enableInProduction;
    
    if (shouldEnable) {
      setIsDebugMode(true);
      initializeGlobalErrorHandling();
      initializeNetworkInterceptor();
    }

    // Check for debug mode flag in localStorage
    const debugFlag = localStorage.getItem('booking_debug_mode');
    if (debugFlag === 'true') {
      setIsDebugMode(true);
      initializeGlobalErrorHandling();
      initializeNetworkInterceptor();
    }

    // Listen for keyboard shortcut to toggle debug mode
    const handleKeyPress = (event: KeyboardEvent) => {
      // Ctrl+Shift+D to toggle debug mode
      if (event.ctrlKey && event.shiftKey && event.key === 'D') {
        event.preventDefault();
        setIsDebugMode(prev => {
          const newValue = !prev;
          localStorage.setItem('booking_debug_mode', newValue.toString());
          
          if (newValue) {
            initializeGlobalErrorHandling();
            initializeNetworkInterceptor();
            console.log('🔍 Debug mode enabled. Press Ctrl+Shift+D again to disable.');
          } else {
            console.log('🔍 Debug mode disabled.');
          }
          
          return newValue;
        });
      }
      
      // Ctrl+Shift+L to toggle dashboard
      if (event.ctrlKey && event.shiftKey && event.key === 'L') {
        event.preventDefault();
        if (isDebugMode) {
          setIsDashboardOpen(prev => !prev);
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [enableInProduction, isDebugMode]);

  const toggleDashboard = () => {
    setIsDashboardOpen(prev => !prev);
  };

  const enableDebugMode = () => {
    setIsDebugMode(true);
    localStorage.setItem('booking_debug_mode', 'true');
    initializeGlobalErrorHandling();
    initializeNetworkInterceptor();
  };

  const disableDebugMode = () => {
    setIsDebugMode(false);
    setIsDashboardOpen(false);
    localStorage.setItem('booking_debug_mode', 'false');
  };

  const contextValue: DebugContextType = {
    isDebugMode,
    isDashboardOpen,
    toggleDashboard,
    enableDebugMode,
    disableDebugMode
  };

  return (
    <DebugContext.Provider value={contextValue}>
      <ConsoleMonitorProvider>
        {children}
        {isDebugMode && (
          <BookingDebugDashboard 
            isOpen={isDashboardOpen} 
            onToggle={toggleDashboard} 
          />
        )}
      </ConsoleMonitorProvider>
    </DebugContext.Provider>
  );
}

export function useDebug() {
  const context = useContext(DebugContext);
  if (!context) {
    throw new Error('useDebug must be used within a DebugProvider');
  }
  return context;
}

/**
 * Hook to conditionally show debug information
 */
export function useDebugInfo() {
  const { isDebugMode } = useDebug();
  
  return {
    isDebugMode,
    log: (message: string, data?: any) => {
      if (isDebugMode) {
        console.log(`[DEBUG] ${message}`, data);
      }
    },
    warn: (message: string, data?: any) => {
      if (isDebugMode) {
        console.warn(`[DEBUG] ${message}`, data);
      }
    },
    error: (message: string, data?: any) => {
      if (isDebugMode) {
        console.error(`[DEBUG] ${message}`, data);
      }
    }
  };
}

/**
 * Debug mode indicator component
 */
export function DebugModeIndicator() {
  const { isDebugMode, toggleDashboard } = useDebug();

  if (!isDebugMode) return null;

  return (
    <div className="fixed top-4 right-4 z-40">
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-3 py-2 rounded-lg shadow-lg text-sm">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
          <span className="font-medium">Debug Mode Active</span>
          <button
            onClick={toggleDashboard}
            className="ml-2 px-2 py-1 bg-yellow-200 hover:bg-yellow-300 rounded text-xs transition-colors"
          >
            Dashboard
          </button>
        </div>
        <div className="text-xs mt-1 text-yellow-700">
          Ctrl+Shift+D: Toggle Debug | Ctrl+Shift+L: Toggle Dashboard
        </div>
      </div>
    </div>
  );
}
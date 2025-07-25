/**
 * Debug system initializer
 * Coordinates all debug components and ensures proper setup
 */

import { initializeGlobalErrorHandling as initGlobalErrors } from './booking-debug-logger';
import { initializeNetworkInterceptor as initNetworkInterceptor } from './network-interceptor';

let isInitialized = false;

/**
 * Initialize global error handling
 */
export function initializeGlobalErrorHandling(): void {
  if (typeof window === 'undefined') return;
  
  try {
    initGlobalErrors();
    console.log('🔍 Global error handling initialized');
  } catch (error) {
    console.warn('Failed to initialize global error handling:', error);
  }
}

/**
 * Initialize network interceptor
 */
export function initializeNetworkInterceptor(): void {
  if (typeof window === 'undefined') return;
  
  try {
    initNetworkInterceptor();
    console.log('🌐 Network interceptor initialized');
  } catch (error) {
    console.warn('Failed to initialize network interceptor:', error);
  }
}

/**
 * Initialize all debug systems
 */
export function initializeDebugSystems(): void {
  if (isInitialized || typeof window === 'undefined') return;
  
  try {
    initializeGlobalErrorHandling();
    initializeNetworkInterceptor();
    
    // Add global debug utilities
    (window as any).__bookingDebug = {
      clearLogs: () => {
        localStorage.removeItem('booking_debug_logs');
        console.log('🧹 Debug logs cleared');
      },
      exportLogs: () => {
        const logs = localStorage.getItem('booking_debug_logs') || '[]';
        const blob = new Blob([logs], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `booking-debug-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        console.log('📥 Debug logs exported');
      },
      enableVerbose: () => {
        localStorage.setItem('booking_debug_verbose', 'true');
        console.log('🔊 Verbose logging enabled');
      },
      disableVerbose: () => {
        localStorage.setItem('booking_debug_verbose', 'false');
        console.log('🔇 Verbose logging disabled');
      }
    };
    
    isInitialized = true;
    console.log('🚀 All debug systems initialized successfully');
    
    // Show help message in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`
🔍 Booking Debug System Ready!

Keyboard Shortcuts:
- Ctrl+Shift+D: Toggle debug mode
- Ctrl+Shift+L: Toggle debug dashboard

Global Debug Functions:
- window.__bookingDebug.clearLogs(): Clear all logs
- window.__bookingDebug.exportLogs(): Export logs to file
- window.__bookingDebug.enableVerbose(): Enable verbose logging
- window.__bookingDebug.disableVerbose(): Disable verbose logging

The debug dashboard will automatically capture:
- All booking-related console output
- Network requests to booking/payment APIs
- Validation errors and warnings
- Step-by-step booking flow tracking
      `);
    }
    
  } catch (error) {
    console.error('Failed to initialize debug systems:', error);
  }
}

/**
 * Check if debug systems are initialized
 */
export function isDebugInitialized(): boolean {
  return isInitialized;
}

/**
 * Force reinitialize debug systems
 */
export function reinitializeDebugSystems(): void {
  isInitialized = false;
  initializeDebugSystems();
}
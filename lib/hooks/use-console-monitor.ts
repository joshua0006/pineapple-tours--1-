/**
 * React hook for monitoring console output and integrating with booking debug logger
 */

import { useEffect, useRef, useState } from 'react';
import { bookingLogger, BookingLogEntry } from '@/lib/utils/booking-debug-logger';

interface ConsoleCapture {
  method: 'log' | 'warn' | 'error' | 'info' | 'debug';
  args: any[];
  timestamp: string;
  stack?: string;
}

interface ConsoleMonitorState {
  captures: ConsoleCapture[];
  isCapturing: boolean;
  bookingRelatedLogs: ConsoleCapture[];
}

export function useConsoleMonitor() {
  const [state, setState] = useState<ConsoleMonitorState>({
    captures: [],
    isCapturing: false,
    bookingRelatedLogs: []
  });

  const originalConsole = useRef<{
    log: typeof console.log;
    warn: typeof console.warn;
    error: typeof console.error;
    info: typeof console.info;
    debug: typeof console.debug;
  } | null>(null);

  const maxCaptures = 500;

  // Check if log is booking-related based on common patterns
  const isBookingRelated = (args: any[]): boolean => {
    const text = args.join(' ').toLowerCase();
    return text.includes('booking') ||
           text.includes('rezdy') ||
           text.includes('payment') ||
           text.includes('stripe') ||
           text.includes('guest') ||
           text.includes('customer') ||
           text.includes('quantity') ||
           text.includes('validation') ||
           text.includes('api/bookings') ||
           text.includes('transform') ||
           text.includes('registration');
  };

  // Extract booking context from console messages
  const extractBookingContext = (args: any[]): {
    category?: BookingLogEntry['category'];
    step?: string;
    data?: any;
  } => {
    const text = args.join(' ').toLowerCase();
    
    let category: BookingLogEntry['category'] = 'general';
    let step = 'console_output';
    let data: any = {};

    // Categorize based on content
    if (text.includes('validation') || text.includes('validate')) {
      category = 'validation';
      step = 'validation_check';
    } else if (text.includes('payment') || text.includes('stripe')) {
      category = 'payment';
      step = 'payment_processing';
    } else if (text.includes('api') || text.includes('rezdy') || text.includes('submission')) {
      category = 'api';
      step = 'api_call';
    } else if (text.includes('transform') || text.includes('mapping')) {
      category = 'transform';
      step = 'data_transform';
    } else if (text.includes('network') || text.includes('fetch')) {
      category = 'network';
      step = 'network_request';
    }

    // Extract structured data if present
    try {
      const objectArgs = args.filter(arg => typeof arg === 'object' && arg !== null);
      if (objectArgs.length > 0) {
        data = objectArgs.length === 1 ? objectArgs[0] : objectArgs;
      }
    } catch (error) {
      // Ignore extraction errors
    }

    return { category, step, data };
  };

  const startCapturing = () => {
    if (state.isCapturing || originalConsole.current) return;

    // Store original console methods
    originalConsole.current = {
      log: console.log,
      warn: console.warn,
      error: console.error,
      info: console.info,
      debug: console.debug
    };

    // Create wrapper function
    const createWrapper = (method: keyof typeof originalConsole.current, level: 'info' | 'warn' | 'error' | 'debug') => {
      return (...args: any[]) => {
        // Call original method first
        originalConsole.current![method](...args);

        // Capture the output
        const capture: ConsoleCapture = {
          method: method === 'log' ? 'log' : method,
          args,
          timestamp: new Date().toISOString(),
          stack: level === 'error' ? new Error().stack : undefined
        };

        // Update state
        setState(prevState => {
          const newCaptures = [...prevState.captures, capture];
          
          // Maintain max captures limit
          if (newCaptures.length > maxCaptures) {
            newCaptures.shift();
          }

          const bookingRelated = isBookingRelated(args);
          const newBookingLogs = bookingRelated 
            ? [...prevState.bookingRelatedLogs, capture]
            : prevState.bookingRelatedLogs;

          // If booking-related, also log to booking logger
          if (bookingRelated) {
            const context = extractBookingContext(args);
            const message = args.map(arg => 
              typeof arg === 'string' ? arg : JSON.stringify(arg)
            ).join(' ');

            bookingLogger.log(
              level === 'log' ? 'info' : level,
              context.category || 'general',
              context.step || 'console_output',
              `Console: ${message}`,
              context.data
            );
          }

          return {
            ...prevState,
            captures: newCaptures,
            bookingRelatedLogs: newBookingLogs.slice(-100) // Keep last 100 booking logs
          };
        });
      };
    };

    // Override console methods
    console.log = createWrapper('log', 'info');
    console.warn = createWrapper('warn', 'warn');
    console.error = createWrapper('error', 'error');
    console.info = createWrapper('info', 'info');
    console.debug = createWrapper('debug', 'debug');

    setState(prevState => ({ ...prevState, isCapturing: true }));
  };

  const stopCapturing = () => {
    if (!state.isCapturing || !originalConsole.current) return;

    // Restore original console methods
    console.log = originalConsole.current.log;
    console.warn = originalConsole.current.warn;
    console.error = originalConsole.current.error;
    console.info = originalConsole.current.info;
    console.debug = originalConsole.current.debug;

    originalConsole.current = null;
    setState(prevState => ({ ...prevState, isCapturing: false }));
  };

  const clearCaptures = () => {
    setState(prevState => ({
      ...prevState,
      captures: [],
      bookingRelatedLogs: []
    }));
  };

  const getBookingErrorLogs = () => {
    return state.bookingRelatedLogs.filter(capture => 
      capture.method === 'error' || 
      capture.args.some(arg => 
        typeof arg === 'string' && 
        (arg.includes('❌') || arg.includes('ERROR') || arg.includes('failed'))
      )
    );
  };

  const getBookingValidationLogs = () => {
    return state.bookingRelatedLogs.filter(capture => 
      capture.args.some(arg => 
        typeof arg === 'string' && 
        (arg.includes('validation') || arg.includes('✅') || arg.includes('validate'))
      )
    );
  };

  const getBookingNetworkLogs = () => {
    return state.bookingRelatedLogs.filter(capture => 
      capture.args.some(arg => 
        typeof arg === 'string' && 
        (arg.includes('api') || arg.includes('fetch') || arg.includes('submission') || arg.includes('🌐'))
      )
    );
  };

  // Auto-start capturing on mount if in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      startCapturing();
    }

    return () => {
      stopCapturing();
    };
  }, []);

  return {
    ...state,
    startCapturing,
    stopCapturing,
    clearCaptures,
    getBookingErrorLogs,
    getBookingValidationLogs,
    getBookingNetworkLogs,
    totalCaptures: state.captures.length,
    totalBookingLogs: state.bookingRelatedLogs.length
  };
}

/**
 * Console monitor provider component
 */
export function ConsoleMonitorProvider({ children }: { children: React.ReactNode }) {
  const monitor = useConsoleMonitor();

  // Make monitor available globally for debugging
  useEffect(() => {
    (window as any).__consoleMonitor = monitor;
  }, [monitor]);

  return <>{children}</>;
}

/**
 * Hook for accessing console monitor from anywhere
 */
export function useGlobalConsoleMonitor() {
  return (window as any).__consoleMonitor || null;
}
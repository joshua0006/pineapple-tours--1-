/**
 * Enhanced debugging logger for booking operations
 * Captures all booking-related activities, errors, and network requests
 */

export interface BookingLogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  category: 'validation' | 'network' | 'api' | 'payment' | 'transform' | 'general';
  step: string;
  message: string;
  data?: any;
  error?: Error | string;
  stackTrace?: string;
}

export interface BookingSessionLog {
  sessionId: string;
  startTime: string;
  endTime?: string;
  status: 'in_progress' | 'completed' | 'failed';
  entries: BookingLogEntry[];
  summary?: {
    totalSteps: number;
    errorCount: number;
    warningCount: number;
    duration?: number;
  };
}

class BookingDebugLogger {
  private currentSession: BookingSessionLog | null = null;
  private persistentLogs: BookingSessionLog[] = [];
  private maxLogEntries = 1000;
  private maxSessions = 10;

  /**
   * Start a new booking session
   */
  startSession(sessionType: 'booking_attempt' | 'payment_processing' | 'validation'): string {
    const sessionId = `${sessionType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.currentSession = {
      sessionId,
      startTime: new Date().toISOString(),
      status: 'in_progress',
      entries: []
    };

    this.log('info', 'general', 'session_start', `Started new ${sessionType} session`, { sessionId });
    
    return sessionId;
  }

  /**
   * End the current session
   */
  endSession(status: 'completed' | 'failed', summary?: string): void {
    if (!this.currentSession) {
      console.warn('No active session to end');
      return;
    }

    this.currentSession.endTime = new Date().toISOString();
    this.currentSession.status = status;
    
    // Calculate summary
    const errorCount = this.currentSession.entries.filter(e => e.level === 'error').length;
    const warningCount = this.currentSession.entries.filter(e => e.level === 'warn').length;
    const duration = new Date(this.currentSession.endTime).getTime() - new Date(this.currentSession.startTime).getTime();
    
    this.currentSession.summary = {
      totalSteps: this.currentSession.entries.length,
      errorCount,
      warningCount,
      duration
    };

    this.log('info', 'general', 'session_end', summary || `Session ended with status: ${status}`, {
      summary: this.currentSession.summary
    });

    // Archive session
    this.persistentLogs.push(this.currentSession);
    
    // Maintain max sessions limit
    if (this.persistentLogs.length > this.maxSessions) {
      this.persistentLogs.shift();
    }
    
    // Clear current session
    this.currentSession = null;
  }

  /**
   * Log an entry
   */
  log(
    level: BookingLogEntry['level'],
    category: BookingLogEntry['category'],
    step: string,
    message: string,
    data?: any,
    error?: Error | string
  ): void {
    const entry: BookingLogEntry = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      timestamp: new Date().toISOString(),
      level,
      category,
      step,
      message,
      data,
      error: error instanceof Error ? error.message : error,
      stackTrace: error instanceof Error ? error.stack : undefined
    };

    // Add to current session if exists
    if (this.currentSession) {
      this.currentSession.entries.push(entry);
    }

    // Console output with enhanced formatting
    this.outputToConsole(entry);

    // Store in localStorage for persistence
    this.persistToStorage(entry);
  }

  /**
   * Enhanced console output
   */
  private outputToConsole(entry: BookingLogEntry): void {
    const prefix = this.getLogPrefix(entry);
    const style = this.getLogStyle(entry.level, entry.category);
    
    if (entry.error) {
      console.group(`%c${prefix}${entry.message}`, style);
      console.error('Error:', entry.error);
      if (entry.stackTrace) {
        console.error('Stack:', entry.stackTrace);
      }
      if (entry.data) {
        console.log('Data:', entry.data);
      }
      console.groupEnd();
    } else if (entry.data) {
      console.group(`%c${prefix}${entry.message}`, style);
      console.log('Data:', entry.data);
      console.groupEnd();
    } else {
      console.log(`%c${prefix}${entry.message}`, style);
    }
  }

  /**
   * Get log prefix with emojis and formatting
   */
  private getLogPrefix(entry: BookingLogEntry): string {
    const categoryEmojis = {
      validation: '✅',
      network: '🌐',
      api: '🔌',
      payment: '💳',
      transform: '🔄',
      general: '📋'
    };
    
    const levelEmojis = {
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌',
      debug: '🔍'
    };

    return `${categoryEmojis[entry.category]} ${levelEmojis[entry.level]} [${entry.step.toUpperCase()}] `;
  }

  /**
   * Get console styling for different log levels and categories
   */
  private getLogStyle(level: BookingLogEntry['level'], category: BookingLogEntry['category']): string {
    const baseStyle = 'font-weight: bold; padding: 2px 4px; border-radius: 3px;';
    
    const levelColors = {
      info: 'background: #e3f2fd; color: #1976d2;',
      warn: 'background: #fff3e0; color: #f57c00;',
      error: 'background: #ffebee; color: #d32f2f;',
      debug: 'background: #f3e5f5; color: #7b1fa2;'
    };

    return baseStyle + levelColors[level];
  }

  /**
   * Persist logs to localStorage
   */
  private persistToStorage(entry: BookingLogEntry): void {
    try {
      const stored = localStorage.getItem('booking_debug_logs') || '[]';
      const logs: BookingLogEntry[] = JSON.parse(stored);
      
      logs.push(entry);
      
      // Maintain max entries limit
      if (logs.length > this.maxLogEntries) {
        logs.splice(0, logs.length - this.maxLogEntries);
      }
      
      localStorage.setItem('booking_debug_logs', JSON.stringify(logs));
    } catch (error) {
      console.warn('Failed to persist log to localStorage:', error);
    }
  }

  /**
   * Get all logs from localStorage
   */
  getAllLogs(): BookingLogEntry[] {
    try {
      const stored = localStorage.getItem('booking_debug_logs') || '[]';
      return JSON.parse(stored);
    } catch (error) {
      console.warn('Failed to retrieve logs from localStorage:', error);
      return [];
    }
  }

  /**
   * Get current session logs
   */
  getCurrentSessionLogs(): BookingLogEntry[] {
    return this.currentSession?.entries || [];
  }

  /**
   * Get all completed sessions
   */
  getAllSessions(): BookingSessionLog[] {
    return this.persistentLogs;
  }

  /**
   * Clear all logs
   */
  clearLogs(): void {
    this.persistentLogs = [];
    this.currentSession = null;
    try {
      localStorage.removeItem('booking_debug_logs');
    } catch (error) {
      console.warn('Failed to clear localStorage logs:', error);
    }
  }

  /**
   * Export logs for debugging
   */
  exportLogs(): string {
    const allData = {
      currentSession: this.currentSession,
      completedSessions: this.persistentLogs,
      persistentLogs: this.getAllLogs(),
      exportTime: new Date().toISOString()
    };
    
    return JSON.stringify(allData, null, 2);
  }

  /**
   * Get error summary
   */
  getErrorSummary(): {
    totalErrors: number;
    errorsByCategory: Record<string, number>;
    recentErrors: BookingLogEntry[];
  } {
    const allLogs = this.getAllLogs();
    const errors = allLogs.filter(log => log.level === 'error');
    
    const errorsByCategory = errors.reduce((acc, error) => {
      acc[error.category] = (acc[error.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const recentErrors = errors.slice(-10); // Last 10 errors
    
    return {
      totalErrors: errors.length,
      errorsByCategory,
      recentErrors
    };
  }

  /**
   * Network request logging helper
   */
  logNetworkRequest(url: string, method: string, data?: any): void {
    this.log('info', 'network', 'request_start', `${method} ${url}`, {
      url,
      method,
      payload: data,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Network response logging helper
   */
  logNetworkResponse(url: string, status: number, data?: any, error?: any): void {
    const level = status >= 400 ? 'error' : status >= 300 ? 'warn' : 'info';
    const step = status >= 400 ? 'request_error' : 'request_success';
    
    this.log(level, 'network', step, `${status} ${url}`, {
      url,
      status,
      response: data,
      error,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Validation logging helper
   */
  logValidation(step: string, isValid: boolean, errors?: string[], data?: any): void {
    const level = isValid ? 'info' : 'error';
    const message = isValid ? `Validation passed: ${step}` : `Validation failed: ${step}`;
    
    this.log(level, 'validation', step, message, {
      isValid,
      errors,
      data
    });
  }

  /**
   * Payment logging helper
   */
  logPayment(step: string, status: 'processing' | 'success' | 'failed', data?: any): void {
    const level = status === 'failed' ? 'error' : status === 'processing' ? 'info' : 'info';
    
    this.log(level, 'payment', step, `Payment ${status}`, data);
  }
}

// Create singleton instance
export const bookingLogger = new BookingDebugLogger();

/**
 * Wrapper function for network requests with automatic logging
 */
export async function loggedFetch(
  url: string,
  options?: RequestInit,
  context?: string
): Promise<Response> {
  const method = options?.method || 'GET';
  const contextMessage = context ? ` (${context})` : '';
  
  bookingLogger.logNetworkRequest(url, method, options?.body);
  
  try {
    const response = await fetch(url, options);
    
    let responseData: any;
    try {
      responseData = await response.clone().json();
    } catch {
      responseData = await response.clone().text();
    }
    
    bookingLogger.logNetworkResponse(url, response.status, responseData);
    
    return response;
  } catch (error) {
    bookingLogger.logNetworkResponse(url, 0, null, error);
    throw error;
  }
}

/**
 * Error boundary logging helper
 */
export function logError(error: Error, context: string, data?: any): void {
  bookingLogger.log('error', 'general', 'error_boundary', `Error in ${context}`, data, error);
}

/**
 * Initialize global error handling
 */
export function initializeGlobalErrorHandling(): void {
  // Capture unhandled errors
  window.addEventListener('error', (event) => {
    bookingLogger.log('error', 'general', 'unhandled_error', 'Unhandled JavaScript error', {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    }, event.error);
  });

  // Capture unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    bookingLogger.log('error', 'general', 'unhandled_rejection', 'Unhandled promise rejection', {
      reason: event.reason
    }, event.reason);
  });

  console.log('🔍 Booking debug logger initialized with global error handling');
}
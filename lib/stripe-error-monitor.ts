/**
 * Stripe Error Monitoring Utility
 * Provides centralized error tracking and reporting for Stripe payment issues
 */

export interface StripeErrorDetails {
  errorType: 'initialization' | 'payment_intent' | 'payment_confirmation' | 'element_loading' | 'api_error' | 'network_error' | 'retry_exhausted';
  errorCode?: string;
  errorMessage: string;
  context: {
    orderNumber?: string;
    amount?: number;
    currency?: string;
    stripeLibraryVersion?: string;
    browserInfo?: {
      userAgent: string;
      language: string;
      platform: string;
      cookieEnabled: boolean;
      onLine: boolean;
      connection?: {
        effectiveType?: string;
        downlink?: number;
        rtt?: number;
      };
    };
    timestamp: string;
    url: string;
    sessionId?: string;
    paymentIntentId?: string;
    retryCount?: number;
    isRetry?: boolean;
  };
  additionalData?: Record<string, any>;
}

export class StripeErrorMonitor {
  private static instance: StripeErrorMonitor;
  private errors: StripeErrorDetails[] = [];

  private constructor() {}

  public static getInstance(): StripeErrorMonitor {
    if (!StripeErrorMonitor.instance) {
      StripeErrorMonitor.instance = new StripeErrorMonitor();
    }
    return StripeErrorMonitor.instance;
  }

  public logError(errorDetails: Omit<StripeErrorDetails, 'context'> & { context?: Partial<StripeErrorDetails['context']> }) {
    const enrichedError: StripeErrorDetails = {
      ...errorDetails,
      context: {
        timestamp: new Date().toISOString(),
        url: typeof window !== 'undefined' ? window.location.href : 'unknown',
        browserInfo: typeof window !== 'undefined' ? {
          userAgent: navigator.userAgent,
          language: navigator.language,
          platform: navigator.platform,
          cookieEnabled: navigator.cookieEnabled,
          onLine: navigator.onLine,
          connection: (navigator as any).connection ? {
            effectiveType: (navigator as any).connection.effectiveType,
            downlink: (navigator as any).connection.downlink,
            rtt: (navigator as any).connection.rtt,
          } : undefined,
        } : undefined,
        ...errorDetails.context,
      },
    };

    this.errors.push(enrichedError);

    // Console logging with appropriate emoji and formatting
    const emoji = this.getErrorEmoji(errorDetails.errorType);
    console.group(`${emoji} Stripe Error - ${errorDetails.errorType}`);
    console.error('Error Message:', errorDetails.errorMessage);
    console.error('Error Code:', errorDetails.errorCode || 'N/A');
    console.table(enrichedError.context);
    if (errorDetails.additionalData) {
      console.error('Additional Data:', errorDetails.additionalData);
    }
    console.groupEnd();

    // In production, you might want to send this to an error monitoring service
    if (process.env.NODE_ENV === 'production') {
      this.sendToErrorService(enrichedError);
    }
  }

  private getErrorEmoji(errorType: StripeErrorDetails['errorType']): string {
    const emojiMap = {
      initialization: '🚨',
      payment_intent: '💳',
      payment_confirmation: '❌',
      element_loading: '⚠️',
      api_error: '🔥',
      network_error: '📡',
      retry_exhausted: '💀',
    };
    return emojiMap[errorType] || '💥';
  }

  private sendToErrorService(error: StripeErrorDetails) {
    // Placeholder for error monitoring service integration
    // You could integrate with services like Sentry, Bugsnag, etc.
    console.log('📡 Would send to error monitoring service:', error);
  }

  public getErrors(): StripeErrorDetails[] {
    return [...this.errors];
  }

  public getErrorsByType(errorType: StripeErrorDetails['errorType']): StripeErrorDetails[] {
    return this.errors.filter(error => error.errorType === errorType);
  }

  public clearErrors(): void {
    this.errors = [];
  }

  public generateErrorReport(): string {
    const errorCounts = this.errors.reduce((acc, error) => {
      acc[error.errorType] = (acc[error.errorType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const report = [
      '📊 Stripe Error Report',
      '===================',
      `Total Errors: ${this.errors.length}`,
      '',
      'Errors by Type:',
      ...Object.entries(errorCounts).map(([type, count]) => `  ${type}: ${count}`),
      '',
      'Recent Errors:',
      ...this.errors.slice(-5).map((error, index) => 
        `  ${index + 1}. [${error.errorType}] ${error.errorMessage} (${error.context.timestamp})`
      ),
    ];

    return report.join('\n');
  }
}

// Convenience functions for common error types
export const logStripeError = {
  initialization: (message: string, additionalData?: Record<string, any>) => {
    StripeErrorMonitor.getInstance().logError({
      errorType: 'initialization',
      errorMessage: message,
      additionalData,
    });
  },

  paymentIntent: (message: string, orderNumber?: string, amount?: number, additionalData?: Record<string, any>) => {
    StripeErrorMonitor.getInstance().logError({
      errorType: 'payment_intent',
      errorMessage: message,
      context: { orderNumber, amount },
      additionalData,
    });
  },

  paymentConfirmation: (message: string, errorCode?: string, orderNumber?: string, additionalData?: Record<string, any>) => {
    StripeErrorMonitor.getInstance().logError({
      errorType: 'payment_confirmation',
      errorMessage: message,
      errorCode,
      context: { orderNumber },
      additionalData,
    });
  },

  elementLoading: (message: string, additionalData?: Record<string, any>) => {
    StripeErrorMonitor.getInstance().logError({
      errorType: 'element_loading',
      errorMessage: message,
      additionalData,
    });
  },

  apiError: (message: string, errorCode?: string, additionalData?: Record<string, any>) => {
    StripeErrorMonitor.getInstance().logError({
      errorType: 'api_error',
      errorMessage: message,
      errorCode,
      additionalData,
    });
  },

  networkError: (message: string, orderNumber?: string, retryCount?: number, additionalData?: Record<string, any>) => {
    StripeErrorMonitor.getInstance().logError({
      errorType: 'network_error',
      errorMessage: message,
      context: { orderNumber, retryCount, isRetry: (retryCount || 0) > 0 },
      additionalData,
    });
  },

  retryExhausted: (message: string, orderNumber?: string, maxRetries?: number, additionalData?: Record<string, any>) => {
    StripeErrorMonitor.getInstance().logError({
      errorType: 'retry_exhausted',
      errorMessage: message,
      context: { orderNumber, retryCount: maxRetries },
      additionalData,
    });
  },
};

// Export singleton instance
export const stripeErrorMonitor = StripeErrorMonitor.getInstance();
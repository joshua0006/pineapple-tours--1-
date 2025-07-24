/**
 * Network interceptor for capturing and logging all HTTP requests/responses
 * Especially useful for debugging Rezdy API calls and payment processing
 */

import { bookingLogger } from './booking-debug-logger';

interface InterceptedRequest {
  id: string;
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: any;
  timestamp: string;
  isBookingRelated: boolean;
}

interface InterceptedResponse {
  requestId: string;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body?: any;
  timestamp: string;
  duration: number;
  error?: any;
}

class NetworkInterceptor {
  private originalFetch: typeof fetch;
  private originalXHROpen: typeof XMLHttpRequest.prototype.open;
  private originalXHRSend: typeof XMLHttpRequest.prototype.send;
  private pendingRequests = new Map<string, InterceptedRequest>();
  private isActive = false;

  constructor() {
    this.originalFetch = window.fetch;
    this.originalXHROpen = XMLHttpRequest.prototype.open;
    this.originalXHRSend = XMLHttpRequest.prototype.send;
  }

  /**
   * Start intercepting network requests
   */
  start(): void {
    if (this.isActive) return;

    this.interceptFetch();
    this.interceptXHR();
    this.isActive = true;

    bookingLogger.log('info', 'network', 'interceptor_start', 'Network interceptor activated');
  }

  /**
   * Stop intercepting network requests
   */
  stop(): void {
    if (!this.isActive) return;

    window.fetch = this.originalFetch;
    XMLHttpRequest.prototype.open = this.originalXHROpen;
    XMLHttpRequest.prototype.send = this.originalXHRSend;
    this.isActive = false;

    bookingLogger.log('info', 'network', 'interceptor_stop', 'Network interceptor deactivated');
  }

  /**
   * Check if URL is booking-related
   */
  private isBookingRelatedUrl(url: string): boolean {
    const lowerUrl = url.toLowerCase();
    return lowerUrl.includes('/api/bookings') ||
           lowerUrl.includes('rezdy.com') ||
           lowerUrl.includes('stripe.com') ||
           lowerUrl.includes('/api/checkout') ||
           lowerUrl.includes('/api/payment') ||
           lowerUrl.includes('/api/products') ||
           lowerUrl.includes('/api/sessions');
  }

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
  }

  /**
   * Intercept fetch requests
   */
  private interceptFetch(): void {
    const self = this;

    window.fetch = async function(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
      const method = init?.method || 'GET';
      const requestId = self.generateRequestId();
      const startTime = Date.now();
      const isBookingRelated = self.isBookingRelatedUrl(url);

      // Parse headers
      const headers: Record<string, string> = {};
      if (init?.headers) {
        if (init.headers instanceof Headers) {
          init.headers.forEach((value, key) => {
            headers[key] = value;
          });
        } else if (Array.isArray(init.headers)) {
          init.headers.forEach(([key, value]) => {
            headers[key] = value;
          });
        } else {
          Object.assign(headers, init.headers);
        }
      }

      // Parse body
      let body: any;
      if (init?.body) {
        try {
          if (typeof init.body === 'string') {
            body = JSON.parse(init.body);
          } else {
            body = init.body;
          }
        } catch {
          body = init.body;
        }
      }

      // Create request record
      const request: InterceptedRequest = {
        id: requestId,
        url,
        method,
        headers,
        body,
        timestamp: new Date().toISOString(),
        isBookingRelated
      };

      self.pendingRequests.set(requestId, request);

      // Log request
      if (isBookingRelated) {
        bookingLogger.log('info', 'network', 'request_start', `${method} ${url}`, {
          requestId,
          headers: self.sanitizeHeaders(headers),
          body: self.sanitizeBody(body),
          isBookingRelated
        });
      }

      try {
        // Make the actual request
        const response = await self.originalFetch.call(window, input, init);
        const endTime = Date.now();
        const duration = endTime - startTime;

        // Parse response headers
        const responseHeaders: Record<string, string> = {};
        response.headers.forEach((value, key) => {
          responseHeaders[key] = value;
        });

        // Clone response to read body without consuming it
        const responseClone = response.clone();
        let responseBody: any;
        
        try {
          const contentType = response.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            responseBody = await responseClone.json();
          } else {
            responseBody = await responseClone.text();
          }
        } catch {
          responseBody = '[Unable to parse response body]';
        }

        // Create response record
        const responseRecord: InterceptedResponse = {
          requestId,
          status: response.status,
          statusText: response.statusText,
          headers: responseHeaders,
          body: responseBody,
          timestamp: new Date().toISOString(),
          duration
        };

        // Log response
        if (isBookingRelated) {
          const level = response.status >= 400 ? 'error' : response.status >= 300 ? 'warn' : 'info';
          const step = response.status >= 400 ? 'request_error' : 'request_success';
          
          bookingLogger.log(level, 'network', step, `${response.status} ${url} (${duration}ms)`, {
            requestId,
            status: response.status,
            statusText: response.statusText,
            duration,
            responseHeaders: self.sanitizeHeaders(responseHeaders),
            responseBody: self.sanitizeResponseBody(responseBody),
            originalRequest: {
              method,
              url,
              headers: self.sanitizeHeaders(headers),
              body: self.sanitizeBody(body)
            }
          });
        }

        // Clean up pending request
        self.pendingRequests.delete(requestId);

        return response;
      } catch (error) {
        const endTime = Date.now();
        const duration = endTime - startTime;

        // Log error
        if (isBookingRelated) {
          bookingLogger.log('error', 'network', 'request_error', `Network error: ${method} ${url}`, {
            requestId,
            duration,
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
            originalRequest: {
              method,
              url,
              headers: self.sanitizeHeaders(headers),
              body: self.sanitizeBody(body)
            }
          }, error instanceof Error ? error : new Error(String(error)));
        }

        // Clean up pending request
        self.pendingRequests.delete(requestId);

        throw error;
      }
    };
  }

  /**
   * Intercept XMLHttpRequest
   */
  private interceptXHR(): void {
    const self = this;

    XMLHttpRequest.prototype.open = function(method: string, url: string | URL, ...args: any[]) {
      const urlString = typeof url === 'string' ? url : url.toString();
      const isBookingRelated = self.isBookingRelatedUrl(urlString);
      
      if (isBookingRelated) {
        const requestId = self.generateRequestId();
        
        // Store request info on XHR object
        (this as any).__interceptorData = {
          requestId,
          method,
          url: urlString,
          isBookingRelated,
          startTime: Date.now()
        };

        bookingLogger.log('info', 'network', 'xhr_open', `XHR ${method} ${urlString}`, {
          requestId,
          method,
          url: urlString
        });
      }

      return self.originalXHROpen.call(this, method, url, ...args);
    };

    XMLHttpRequest.prototype.send = function(body?: any) {
      const interceptorData = (this as any).__interceptorData;
      
      if (interceptorData?.isBookingRelated) {
        const { requestId, method, url, startTime } = interceptorData;

        // Log request with body
        bookingLogger.log('info', 'network', 'xhr_send', `XHR sending ${method} ${url}`, {
          requestId,
          body: self.sanitizeBody(body)
        });

        // Set up response handler
        const originalOnReadyStateChange = this.onreadystatechange;
        
        this.onreadystatechange = function() {
          if (this.readyState === XMLHttpRequest.DONE) {
            const endTime = Date.now();
            const duration = endTime - startTime;
            
            const level = this.status >= 400 ? 'error' : this.status >= 300 ? 'warn' : 'info';
            const step = this.status >= 400 ? 'xhr_error' : 'xhr_success';
            
            let responseBody: any;
            try {
              responseBody = JSON.parse(this.responseText);
            } catch {
              responseBody = this.responseText;
            }

            bookingLogger.log(level, 'network', step, `XHR ${this.status} ${url} (${duration}ms)`, {
              requestId,
              status: this.status,
              statusText: this.statusText,
              duration,
              responseBody: self.sanitizeResponseBody(responseBody)
            });
          }

          if (originalOnReadyStateChange) {
            originalOnReadyStateChange.call(this);
          }
        };
      }

      return self.originalXHRSend.call(this, body);
    };
  }

  /**
   * Sanitize headers to remove sensitive information
   */
  private sanitizeHeaders(headers: Record<string, string>): Record<string, string> {
    const sanitized = { ...headers };
    
    // Remove or mask sensitive headers
    const sensitiveHeaders = ['authorization', 'api-key', 'x-api-key', 'cookie', 'set-cookie'];
    
    sensitiveHeaders.forEach(header => {
      const lowerHeader = header.toLowerCase();
      Object.keys(sanitized).forEach(key => {
        if (key.toLowerCase() === lowerHeader) {
          sanitized[key] = '[REDACTED]';
        }
      });
    });

    return sanitized;
  }

  /**
   * Sanitize request body to remove sensitive information
   */
  private sanitizeBody(body: any): any {
    if (!body) return body;

    try {
      let parsed = body;
      if (typeof body === 'string') {
        parsed = JSON.parse(body);
      }

      if (typeof parsed === 'object') {
        const sanitized = { ...parsed };
        
        // Remove sensitive fields
        const sensitiveFields = ['password', 'token', 'secret', 'key', 'cardNumber', 'cvv', 'apiKey'];
        
        sensitiveFields.forEach(field => {
          Object.keys(sanitized).forEach(key => {
            if (key.toLowerCase().includes(field.toLowerCase())) {
              sanitized[key] = '[REDACTED]';
            }
          });
        });

        return sanitized;
      }
    } catch {
      // If parsing fails, return original body
    }

    return body;
  }

  /**
   * Sanitize response body (less aggressive than request sanitization)
   */
  private sanitizeResponseBody(body: any): any {
    if (!body) return body;

    try {
      let parsed = body;
      if (typeof body === 'string') {
        parsed = JSON.parse(body);
      }

      if (typeof parsed === 'object') {
        const sanitized = { ...parsed };
        
        // Only remove very sensitive response fields
        const sensitiveFields = ['secret', 'token', 'apiKey'];
        
        sensitiveFields.forEach(field => {
          Object.keys(sanitized).forEach(key => {
            if (key.toLowerCase().includes(field.toLowerCase())) {
              sanitized[key] = '[REDACTED]';
            }
          });
        });

        return sanitized;
      }
    } catch {
      // If parsing fails, return original body
    }

    return body;
  }

  /**
   * Get pending requests (useful for debugging hanging requests)
   */
  getPendingRequests(): InterceptedRequest[] {
    return Array.from(this.pendingRequests.values());
  }

  /**
   * Get status
   */
  isIntercepting(): boolean {
    return this.isActive;
  }
}

// Create singleton instance
export const networkInterceptor = new NetworkInterceptor();

/**
 * Auto-start network interceptor in development
 */
export function initializeNetworkInterceptor(): void {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    networkInterceptor.start();
    
    // Make available globally for debugging
    (window as any).__networkInterceptor = networkInterceptor;
    
    console.log('🌐 Network interceptor initialized');
  }
}

/**
 * Utility function to manually log network events
 */
export function logNetworkEvent(
  type: 'request' | 'response' | 'error',
  url: string,
  data?: any
): void {
  const isBookingRelated = networkInterceptor['isBookingRelatedUrl'](url);
  
  if (isBookingRelated) {
    const level = type === 'error' ? 'error' : 'info';
    const category = 'network';
    const step = `manual_${type}`;
    
    bookingLogger.log(level, category, step, `Manual ${type}: ${url}`, data);
  }
}
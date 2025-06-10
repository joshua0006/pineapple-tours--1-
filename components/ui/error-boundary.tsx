'use client'

import React, { Component, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  retryCount: number;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  maxRetries?: number;
  showDetails?: boolean;
  className?: string;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log error for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  handleRetry = () => {
    const { maxRetries = 3 } = this.props;
    
    if (this.state.retryCount < maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: prevState.retryCount + 1
      }));
    }
  };

  handleAutoRetry = () => {
    this.retryTimeoutId = setTimeout(() => {
      this.handleRetry();
    }, 2000);
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <BrandedErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          retryCount={this.state.retryCount}
          maxRetries={this.props.maxRetries || 3}
          onRetry={this.handleRetry}
          onAutoRetry={this.handleAutoRetry}
          showDetails={this.props.showDetails}
          className={this.props.className}
        />
      );
    }

    return this.props.children;
  }
}

// Branded error fallback component
interface BrandedErrorFallbackProps {
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  retryCount: number;
  maxRetries: number;
  onRetry: () => void;
  onAutoRetry: () => void;
  showDetails?: boolean;
  className?: string;
}

function BrandedErrorFallback({
  error,
  errorInfo,
  retryCount,
  maxRetries,
  onRetry,
  onAutoRetry,
  showDetails = false,
  className
}: BrandedErrorFallbackProps) {
  const canRetry = retryCount < maxRetries;

  return (
    <div className={cn("bg-[#141312] py-8 sm:py-12 lg:py-16", className)}>
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          {/* Error Icon */}
          <div className="relative mb-6">
            <div className="w-16 h-16 lg:w-20 lg:h-20 mx-auto rounded-full bg-red-500/20 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 lg:w-10 lg:h-10 text-red-400" />
            </div>
            {/* Pulse effect */}
            <div className="absolute inset-0 w-16 h-16 lg:w-20 lg:h-20 mx-auto rounded-full border-2 border-red-400/30 animate-ping" />
          </div>

          {/* Error Title */}
          <h2 className="text-2xl lg:text-3xl font-bold text-white mb-4 font-['Barlow']">
            Oops! Something went wrong
          </h2>

          {/* Error Description */}
          <p className="text-base lg:text-lg text-gray-300 font-['Work_Sans'] mb-6 max-w-md mx-auto">
            We're having trouble loading the tour categories. Don't worry, we're working on it!
          </p>

          {/* Retry Information */}
          {retryCount > 0 && (
            <div className="mb-6">
              <Alert className="bg-yellow-900/20 border-yellow-800 text-yellow-300 max-w-md mx-auto">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Retry attempt {retryCount} of {maxRetries}
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-8">
            {canRetry ? (
              <>
                <Button
                  onClick={onRetry}
                  className="bg-[#FF585D] hover:bg-[#FF585D]/90 text-white font-['Work_Sans'] font-semibold px-6 py-2"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                <Button
                  onClick={onAutoRetry}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-800 font-['Work_Sans']"
                >
                  Auto Retry in 2s
                </Button>
              </>
            ) : (
              <div className="text-center">
                <p className="text-red-400 font-['Work_Sans'] mb-4">
                  Maximum retry attempts reached
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    onClick={() => window.location.reload()}
                    className="bg-[#FF585D] hover:bg-[#FF585D]/90 text-white font-['Work_Sans'] font-semibold px-6 py-2"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh Page
                  </Button>
                  <Button
                    onClick={() => window.location.href = '/'}
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:bg-gray-800 font-['Work_Sans']"
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Go Home
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Contact Support */}
          <div className="border-t border-gray-700 pt-6">
            <p className="text-sm text-gray-400 font-['Work_Sans'] mb-3">
              Still having issues? We're here to help!
            </p>
            <Button
              variant="ghost"
              className="text-[#FF585D] hover:text-[#FF585D]/80 hover:bg-[#FF585D]/10 font-['Work_Sans']"
              onClick={() => window.location.href = '/contact'}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Contact Support
            </Button>
          </div>

          {/* Error Details (for development) */}
          {showDetails && error && (
            <details className="mt-8 text-left bg-gray-900/50 rounded-lg p-4 border border-gray-700">
              <summary className="cursor-pointer text-sm font-medium text-gray-300 font-['Work_Sans'] mb-2">
                Technical Details
              </summary>
              <div className="text-xs text-gray-400 font-mono space-y-2">
                <div>
                  <strong>Error:</strong> {error.message}
                </div>
                <div>
                  <strong>Stack:</strong>
                  <pre className="mt-1 whitespace-pre-wrap break-all">
                    {error.stack}
                  </pre>
                </div>
                {errorInfo && (
                  <div>
                    <strong>Component Stack:</strong>
                    <pre className="mt-1 whitespace-pre-wrap break-all">
                      {errorInfo.componentStack}
                    </pre>
                  </div>
                )}
              </div>
            </details>
          )}
        </div>
      </div>
    </div>
  );
}

// Hook for functional components error handling
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const handleError = React.useCallback((error: Error) => {
    setError(error);
    console.error('useErrorHandler caught an error:', error);
  }, []);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return { handleError, resetError };
}

// Simple error fallback for specific components
export function SimpleErrorFallback({ 
  error, 
  onRetry,
  className 
}: { 
  error: string; 
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div className={cn("text-center py-8", className)}>
      <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
        <AlertCircle className="w-6 h-6 text-red-400" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2 font-['Barlow']">
        Something went wrong
      </h3>
      <p className="text-sm text-gray-300 font-['Work_Sans'] mb-4 max-w-md mx-auto">
        {error}
      </p>
      {onRetry && (
        <Button
          onClick={onRetry}
          size="sm"
          className="bg-[#FF585D] hover:bg-[#FF585D]/90 text-white font-['Work_Sans']"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      )}
    </div>
  );
} 
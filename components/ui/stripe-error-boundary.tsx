"use client";

import React, { Component, ReactNode } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, RefreshCw } from "lucide-react";

interface StripeErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: any) => void;
}

interface StripeErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: any;
}

export class StripeErrorBoundary extends Component<
  StripeErrorBoundaryProps,
  StripeErrorBoundaryState
> {
  constructor(props: StripeErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): StripeErrorBoundaryState {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("💥 Stripe Error Boundary caught error:", {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack?.substring(0, 500),
      },
      errorInfo: {
        componentStack: errorInfo.componentStack?.substring(0, 500),
      },
      timestamp: new Date().toISOString(),
    });

    this.setState({
      error,
      errorInfo,
    });

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    console.log("🔄 Resetting Stripe Error Boundary");
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback component
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <Card className="w-full border-red-200 bg-red-50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Payment System Error
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive" role="alert">
              <AlertCircle className="h-4 w-4" aria-hidden="true" />
              <AlertDescription>
                <strong>Payment Error:</strong> There was a problem loading the payment system. 
                This might be due to a browser compatibility issue or network problem.
              </AlertDescription>
            </Alert>

            <div className="bg-white p-4 rounded-lg border border-red-200">
              <h4 className="font-medium text-red-800 mb-2">Technical Details:</h4>
              <div className="text-sm text-red-700 space-y-1">
                <div><strong>Error:</strong> {this.state.error?.message}</div>
                <div><strong>Type:</strong> {this.state.error?.name}</div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-slate-900">Troubleshooting Steps:</h4>
              <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside">
                <li>Clear your browser cache and cookies</li>
                <li>Disable browser extensions temporarily</li>
                <li>Try using a different browser (Chrome, Firefox, Safari)</li>
                <li>Check if you have an ad blocker blocking payment scripts</li>
                <li>Ensure JavaScript is enabled in your browser</li>
              </ul>
            </div>

            <div className="flex gap-2 pt-2">
              <Button 
                onClick={this.handleReset} 
                variant="outline"
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
              <Button 
                onClick={() => window.location.reload()} 
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Reload Page
              </Button>
            </div>

            <div className="pt-4 border-t border-red-200">
              <p className="text-sm text-slate-600">
                If the problem persists, please contact support at{" "}
                <a 
                  href="mailto:support@pineappletours.com.au" 
                  className="text-red-600 hover:underline"
                >
                  support@pineappletours.com.au
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}
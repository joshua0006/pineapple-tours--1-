import { AlertCircle, RefreshCw, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface BlogErrorProps {
  error: string;
  onRetry: () => void;
  variant?: "card" | "alert" | "full";
}

export function BlogError({
  error,
  onRetry,
  variant = "alert",
}: BlogErrorProps) {
  const isNetworkError =
    error.toLowerCase().includes("fetch") ||
    error.toLowerCase().includes("network") ||
    error.toLowerCase().includes("cors");

  if (variant === "full") {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-6">
          {isNetworkError ? (
            <WifiOff className="w-8 h-8 text-red-600" />
          ) : (
            <AlertCircle className="w-8 h-8 text-red-600" />
          )}
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Unable to Load Blog Posts
        </h2>

        <p className="text-gray-600 mb-6 max-w-md">
          {isNetworkError
            ? "We're having trouble connecting to our blog server. Please check your internet connection and try again."
            : "Something went wrong while loading the blog posts. Our team has been notified."}
        </p>

        <div className="text-sm text-gray-500 mb-6 p-3 bg-gray-50 rounded-md font-mono">
          Error: {error}
        </div>

        <Button
          onClick={onRetry}
          className="bg-brand-accent hover:bg-brand-accent/90"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  if (variant === "card") {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              {isNetworkError ? (
                <WifiOff className="w-5 h-5 text-red-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600" />
              )}
            </div>

            <div className="flex-1">
              <h3 className="font-semibold text-red-900 mb-2">
                Failed to Load Blog Posts
              </h3>
              <p className="text-red-700 text-sm mb-4">
                {isNetworkError
                  ? "Connection issue detected. Please check your internet connection."
                  : "An error occurred while fetching blog content."}
              </p>
              <Button
                onClick={onRetry}
                size="sm"
                variant="outline"
                className="border-red-300 text-red-700 hover:bg-red-100"
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Retry
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Alert variant="destructive" className="mb-6">
      {isNetworkError ? (
        <WifiOff className="h-4 w-4" />
      ) : (
        <AlertCircle className="h-4 w-4" />
      )}
      <AlertTitle>
        {isNetworkError ? "Connection Error" : "Loading Error"}
      </AlertTitle>
      <AlertDescription className="flex items-center justify-between">
        <span>
          {isNetworkError
            ? "Unable to connect to the blog server. Please check your connection."
            : `Failed to load blog posts: ${error}`}
        </span>
        <Button
          onClick={onRetry}
          size="sm"
          variant="outline"
          className="ml-4 h-8"
        >
          <RefreshCw className="w-3 h-3 mr-1" />
          Retry
        </Button>
      </AlertDescription>
    </Alert>
  );
}

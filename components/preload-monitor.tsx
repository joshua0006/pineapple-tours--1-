"use client";

import { useState, useEffect } from "react";
import { usePreloadStatus } from "@/components/data-preloader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { dataPreloader } from "@/lib/services/data-preloader";
import {
  Database,
  Clock,
  Activity,
  RefreshCw,
  CheckCircle,
  XCircle,
  TrendingUp,
  BarChart3,
} from "lucide-react";

interface PreloadMonitorProps {
  /**
   * Show in compact mode (default: false)
   */
  compact?: boolean;

  /**
   * Update interval in ms (default: 2000)
   */
  updateInterval?: number;

  /**
   * Show only when enabled (default: development only)
   */
  enabled?: boolean;
}

export function PreloadMonitor({
  compact = false,
  updateInterval = 2000,
  enabled = process.env.NODE_ENV === "development",
}: PreloadMonitorProps) {
  const { stats } = usePreloadStatus();
  const [isVisible, setIsVisible] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  useEffect(() => {
    if (!enabled) return;

    const interval = setInterval(() => {
      setLastUpdate(Date.now());
    }, updateInterval);

    return () => clearInterval(interval);
  }, [enabled, updateInterval]);

  const handleRefresh = async () => {
    try {
      await dataPreloader.invalidateAndRefresh();
    } catch (error) {
      console.error("Failed to refresh cache:", error);
    }
  };

  const handleReset = () => {
    dataPreloader.resetStats();
  };

  if (!enabled) return null;

  const successRate =
    stats.totalPreloads > 0
      ? (stats.successfulPreloads / stats.totalPreloads) * 100
      : 0;

  if (compact) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsVisible(!isVisible)}
          className="bg-white/90 backdrop-blur-sm shadow-lg"
        >
          <Activity className="h-4 w-4 mr-2" />
          Cache: {(stats.cacheHitRate * 100).toFixed(0)}%
        </Button>

        {isVisible && (
          <Card className="absolute bottom-12 right-0 w-80 bg-white/95 backdrop-blur-sm shadow-xl border-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center justify-between">
                Preload Monitor
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsVisible(false)}
                  className="h-6 w-6 p-0"
                >
                  ×
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <PreloadStats
                stats={stats}
                onRefresh={handleRefresh}
                onReset={handleReset}
              />
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-2">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Database className="h-5 w-5" />
            Preload Monitor
            <Badge
              variant={successRate > 80 ? "default" : "destructive"}
              className="ml-auto"
            >
              {successRate.toFixed(0)}% Success
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PreloadStats
            stats={stats}
            onRefresh={handleRefresh}
            onReset={handleReset}
          />

          <div className="text-xs text-muted-foreground mt-4 text-center">
            Last updated: {new Date(lastUpdate).toLocaleTimeString()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PreloadStats({
  stats,
  onRefresh,
  onReset,
}: {
  stats: any;
  onRefresh: () => void;
  onReset: () => void;
}) {
  return (
    <div className="space-y-4">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {(stats.cacheHitRate * 100).toFixed(1)}%
          </div>
          <div className="text-xs text-muted-foreground">Cache Hit Rate</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {Math.round(stats.averageLoadTime)}ms
          </div>
          <div className="text-xs text-muted-foreground">Avg Load Time</div>
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            Successful
          </span>
          <Badge variant="outline">{stats.successfulPreloads}</Badge>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2">
            <XCircle className="h-4 w-4 text-red-600" />
            Failed
          </span>
          <Badge variant="outline">{stats.failedPreloads}</Badge>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-gray-600" />
            Total Preloads
          </span>
          <Badge variant="outline">{stats.totalPreloads}</Badge>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          className="flex-1"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
        <Button variant="ghost" size="sm" onClick={onReset} className="flex-1">
          Reset Stats
        </Button>
      </div>

      {/* Performance Indicator */}
      <div className="pt-2 border-t">
        <div className="flex items-center justify-between text-xs">
          <span>Performance</span>
          <div className="flex items-center gap-1">
            <TrendingUp
              className={`h-3 w-3 ${
                stats.cacheHitRate > 0.8
                  ? "text-green-600"
                  : stats.cacheHitRate > 0.5
                  ? "text-yellow-600"
                  : "text-red-600"
              }`}
            />
            <span
              className={
                stats.cacheHitRate > 0.8
                  ? "text-green-600"
                  : stats.cacheHitRate > 0.5
                  ? "text-yellow-600"
                  : "text-red-600"
              }
            >
              {stats.cacheHitRate > 0.8
                ? "Excellent"
                : stats.cacheHitRate > 0.5
                ? "Good"
                : "Needs Attention"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

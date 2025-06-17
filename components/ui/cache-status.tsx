import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Database,
  Clock,
  RefreshCw,
  Trash2,
  CheckCircle,
  AlertCircle,
  Info,
} from "lucide-react";

interface CacheStats {
  hasPosts: boolean;
  hasCategories: boolean;
  postsCount: number;
  categoriesCount: number;
  lastFetch: Date | null;
  cacheAge: number;
  isFresh: boolean;
  memoryEntries: number;
}

interface CacheStatusProps {
  stats: CacheStats;
  onRefresh: () => void;
  onClearCache: () => void;
  loading?: boolean;
  compact?: boolean;
}

export function CacheStatus({
  stats,
  onRefresh,
  onClearCache,
  loading = false,
  compact = false,
}: CacheStatusProps) {
  const getCacheHealthStatus = () => {
    if (!stats.isFresh)
      return { status: "empty", color: "gray", icon: AlertCircle };
    if (stats.cacheAge < 5)
      return { status: "fresh", color: "green", icon: CheckCircle };
    if (stats.cacheAge < 15)
      return { status: "good", color: "blue", icon: Info };
    return { status: "stale", color: "orange", icon: AlertCircle };
  };

  const health = getCacheHealthStatus();

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <div className="flex items-center gap-1">
          <health.icon className={`w-4 h-4 text-${health.color}-500`} />
          <span className="text-muted-foreground">Cache:</span>
        </div>
        {stats.isFresh ? (
          <span className={`text-${health.color}-600 font-medium`}>
            {stats.cacheAge}m ago
          </span>
        ) : (
          <span className="text-gray-500">Empty</span>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onRefresh}
          disabled={loading}
          className="h-6 px-2"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2">
            <Database className="w-4 h-4" />
            Cache Status
          </h3>
          <Badge
            variant={health.status === "fresh" ? "default" : "secondary"}
            className={
              health.status === "fresh"
                ? "bg-green-100 text-green-800"
                : health.status === "good"
                ? "bg-blue-100 text-blue-800"
                : health.status === "stale"
                ? "bg-orange-100 text-orange-800"
                : "bg-gray-100 text-gray-800"
            }
          >
            <health.icon className="w-3 h-3 mr-1" />
            {health.status.charAt(0).toUpperCase() + health.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Cache Data Info */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Posts Cached:</span>
            <span className="font-medium">
              {stats.hasPosts ? stats.postsCount : "None"}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Categories Cached:</span>
            <span className="font-medium">
              {stats.hasCategories ? stats.categoriesCount : "None"}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Memory Entries:</span>
            <span className="font-medium">{stats.memoryEntries}</span>
          </div>
        </div>

        {/* Cache Timing */}
        {stats.isFresh && stats.lastFetch && (
          <div className="border-t pt-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Cache Age:
              </span>
              <span className={`font-medium text-${health.color}-600`}>
                {stats.cacheAge} minute{stats.cacheAge !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Last Updated:</span>
              <span className="font-medium text-xs">
                {stats.lastFetch.toLocaleString()}
              </span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={loading}
            className="flex-1"
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            {loading ? "Refreshing..." : "Refresh"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onClearCache}
            disabled={loading}
            className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
            title="Clear all cached data"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        {/* Cache Health Description */}
        <div className="text-xs text-muted-foreground bg-gray-50 p-2 rounded">
          {health.status === "fresh" && "Cache is fresh and up-to-date"}
          {health.status === "good" && "Cache is still good, data is recent"}
          {health.status === "stale" &&
            "Cache is getting old, consider refreshing"}
          {health.status === "empty" && "No cached data available"}
        </div>
      </CardContent>
    </Card>
  );
}

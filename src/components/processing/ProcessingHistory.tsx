"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/Button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Play,
  Square,
  RefreshCw,
  FileText,
  Calendar,
} from "lucide-react";
import { getQueueStats } from "@/app/actions/processing";
import { toast } from "sonner";

interface QueueStats {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  paused: number;
}

interface ProcessingHistoryProps {
  className?: string;
}

const statusConfig = {
  waiting: {
    label: "Waiting",
    color: "bg-yellow-500",
    icon: Clock,
    variant: "secondary" as const,
  },
  active: {
    label: "Processing",
    color: "bg-blue-500",
    icon: Play,
    variant: "default" as const,
  },
  completed: {
    label: "Completed",
    color: "bg-green-500",
    icon: CheckCircle,
    variant: "success" as const,
  },
  failed: {
    label: "Failed",
    color: "bg-red-500",
    icon: AlertCircle,
    variant: "destructive" as const,
  },
  delayed: {
    label: "Delayed",
    color: "bg-orange-500",
    icon: Clock,
    variant: "secondary" as const,
  },
  paused: {
    label: "Paused",
    color: "bg-gray-500",
    icon: Square,
    variant: "outline" as const,
  },
};

export function ProcessingHistory({ className }: ProcessingHistoryProps) {
  const [stats, setStats] = useState<QueueStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchStats = async () => {
    if (loading) return;

    setLoading(true);
    try {
      const result = await getQueueStats();
      if (result.success && result.stats) {
        setStats(result.stats);
        setLastUpdated(new Date());
      } else if (result.error) {
        toast.error(`Failed to fetch queue stats: ${result.error}`);
      }
    } catch (error) {
      console.error("Error fetching queue stats:", error);
      toast.error("Failed to fetch queue statistics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const totalJobs = stats
    ? Object.values(stats).reduce((sum, count) => sum + count, 0)
    : 0;

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Processing Queue</span>
          </div>
          <div className="flex items-center space-x-2">
            {lastUpdated && (
              <div className="flex items-center text-xs text-gray-500">
                <Calendar className="h-3 w-3 mr-1" />
                {lastUpdated.toLocaleTimeString()}
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchStats}
              disabled={loading}
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!stats ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
            <span className="ml-2">Loading queue statistics...</span>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Summary */}
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {totalJobs}
              </div>
              <div className="text-sm text-gray-600">Total Jobs</div>
            </div>

            <Separator />

            {/* Detailed Stats */}
            <ScrollArea className="h-64">
              <div className="space-y-3">
                {Object.entries(stats).map(([status, count]) => {
                  const config =
                    statusConfig[status as keyof typeof statusConfig];
                  if (!config) return null;

                  const Icon = config.icon;
                  const percentage =
                    totalJobs > 0 ? Math.round((count / totalJobs) * 100) : 0;

                  return (
                    <div
                      key={status}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-3 h-3 rounded-full ${config.color}`}
                        />
                        <Icon className="h-4 w-4 text-gray-600" />
                        <span className="font-medium capitalize">
                          {config.label}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={config.variant}>{count}</Badge>
                        {totalJobs > 0 && (
                          <span className="text-xs text-gray-500">
                            ({percentage}%)
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>

            {/* Status Indicators */}
            {stats.active > 0 && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex items-center space-x-2">
                  <Play className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium text-blue-800">
                    {stats.active} job{stats.active !== 1 ? "s" : ""} currently
                    processing
                  </span>
                </div>
              </div>
            )}

            {stats.failed > 0 && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-medium text-red-800">
                    {stats.failed} job{stats.failed !== 1 ? "s" : ""} failed
                  </span>
                </div>
              </div>
            )}

            {stats.waiting > 0 && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium text-yellow-800">
                    {stats.waiting} job{stats.waiting !== 1 ? "s" : ""} waiting
                    in queue
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

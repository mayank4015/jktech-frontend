"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Play,
  Square,
  RotateCcw,
} from "lucide-react";
import {
  getProcessingStatus,
  cancelProcessing,
  retryProcessing,
} from "@/app/actions/processing";
import { toast } from "sonner";

interface ProcessingStatus {
  status: "waiting" | "active" | "completed" | "failed" | "delayed" | "paused";
  progress: number;
  error?: string;
  jobId?: string;
  createdAt?: string;
  processedAt?: string;
  finishedAt?: string;
}

interface ProcessingStatusProps {
  ingestionId: string;
  initialStatus?: ProcessingStatus;
  onStatusChange?: (status: ProcessingStatus) => void;
  showActions?: boolean;
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

export function ProcessingStatus({
  ingestionId,
  initialStatus,
  onStatusChange,
  showActions = true,
}: ProcessingStatusProps) {
  const [status, setStatus] = useState<ProcessingStatus | null>(
    initialStatus || null
  );
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchStatus = async () => {
    if (loading) return;

    setLoading(true);
    try {
      const result = await getProcessingStatus(ingestionId);
      if (result.success && result.status) {
        setStatus(result.status);
        onStatusChange?.(result.status);
      } else if (result.error) {
        toast.error(`Failed to fetch status: ${result.error}`);
      }
    } catch (error) {
      console.error("Error fetching status:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();

    // Poll for status updates if processing is active
    const shouldPoll =
      status?.status === "active" || status?.status === "waiting";
    if (shouldPoll) {
      const interval = setInterval(fetchStatus, 2000); // Poll every 2 seconds
      return () => clearInterval(interval);
    }
  }, [ingestionId, status?.status]);

  const handleCancel = async () => {
    if (
      !status ||
      (status.status !== "active" && status.status !== "waiting")
    ) {
      return;
    }

    setActionLoading("cancel");
    try {
      const result = await cancelProcessing(ingestionId);
      if (result.success) {
        toast.success("Processing cancelled successfully");
        await fetchStatus();
      } else {
        toast.error(`Failed to cancel: ${result.error}`);
      }
    } catch (error) {
      toast.error("Failed to cancel processing");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRetry = async () => {
    if (!status || status.status !== "failed") {
      return;
    }

    setActionLoading("retry");
    try {
      const result = await retryProcessing(ingestionId);
      if (result.success) {
        toast.success("Processing restarted successfully");
        await fetchStatus();
      } else {
        toast.error(`Failed to retry: ${result.error}`);
      }
    } catch (error) {
      toast.error("Failed to retry processing");
    } finally {
      setActionLoading(null);
    }
  };

  if (!status) {
    return (
      <Card className="w-full">
        <CardContent className="p-4">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
            <span className="ml-2">Loading status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const config = statusConfig[status.status];
  const Icon = config.icon;

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Icon className="h-5 w-5" />
            <span>Processing Status</span>
          </div>
          <Badge
            variant={config.variant}
            className="flex items-center space-x-1"
          >
            <div className={`w-2 h-2 rounded-full ${config.color}`} />
            <span>{config.label}</span>
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{status.progress}%</span>
          </div>
          <Progress value={status.progress} className="w-full" />
        </div>

        {/* Error Message */}
        {status.error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">Error</p>
                <p className="text-sm text-red-700">{status.error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Job Details */}
        {status.jobId && (
          <div className="text-xs text-gray-500 space-y-1">
            <div>Job ID: {status.jobId}</div>
            {status.createdAt && (
              <div>Created: {new Date(status.createdAt).toLocaleString()}</div>
            )}
            {status.processedAt && (
              <div>
                Started: {new Date(status.processedAt).toLocaleString()}
              </div>
            )}
            {status.finishedAt && (
              <div>
                Finished: {new Date(status.finishedAt).toLocaleString()}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex space-x-2 pt-2">
            {(status.status === "active" || status.status === "waiting") && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                disabled={actionLoading === "cancel"}
              >
                {actionLoading === "cancel" ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900" />
                ) : (
                  <Square className="h-4 w-4" />
                )}
                <span className="ml-1">Cancel</span>
              </Button>
            )}

            {status.status === "failed" && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetry}
                disabled={actionLoading === "retry"}
              >
                {actionLoading === "retry" ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900" />
                ) : (
                  <RotateCcw className="h-4 w-4" />
                )}
                <span className="ml-1">Retry</span>
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

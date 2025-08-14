"use client";

import { IngestionStats as IIngestionStats } from "@/types/ingestion";

interface IngestionStatsProps {
  stats: IIngestionStats;
  isLoading?: boolean;
}

const formatDuration = (seconds: number) => {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
};

export function IngestionStats({
  stats,
  isLoading = false,
}: IngestionStatsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-lg border border-gray-200 p-6"
          >
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Ingestions",
      value: stats.total.toLocaleString(),
      icon: (
        <svg
          className="w-6 h-6 text-blue-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
      color: "blue",
      description: "All ingestion jobs",
    },
    {
      title: "Success Rate",
      value: `${stats.successRate ?? 0}%`,
      icon: (
        <svg
          className="w-6 h-6 text-green-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      color: "green",
      description: "Completed successfully",
    },
    {
      title: "Avg Processing Time",
      value: formatDuration(stats.averageProcessingTime),
      icon: (
        <svg
          className="w-6 h-6 text-purple-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      color: "purple",
      description: "Average completion time",
    },
    {
      title: "Currently Processing",
      value: stats.processing.toLocaleString(),
      icon: (
        <svg
          className="w-6 h-6 text-orange-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      ),
      color: "orange",
      description: "Jobs in progress",
    },
  ];

  const statusBreakdown = [
    { label: "Completed", value: stats.completed, color: "bg-green-500" },
    { label: "Processing", value: stats.processing, color: "bg-blue-500" },
    { label: "Queued", value: stats.queued, color: "bg-yellow-500" },
    { label: "Failed", value: stats.failed, color: "bg-red-500" },
  ];

  return (
    <div className="space-y-6">
      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-lg border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stat.value}
                </p>
                <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
              </div>
              <div className="flex-shrink-0">{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Status Breakdown */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Status Breakdown
        </h3>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex rounded-full overflow-hidden h-3 bg-gray-200">
            {statusBreakdown.map((status, index) => {
              const percentage =
                stats.total > 0 ? (status.value / stats.total) * 100 : 0;
              return (
                <div
                  key={index}
                  className={status.color}
                  style={{ width: `${percentage}%` }}
                  title={`${status.label}: ${status.value} (${percentage.toFixed(1)}%)`}
                />
              );
            })}
          </div>
        </div>

        {/* Status Legend */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statusBreakdown.map((status, index) => {
            const percentage =
              stats.total > 0 ? (status.value / stats.total) * 100 : 0;
            return (
              <div key={index} className="flex items-center">
                <div
                  className={`w-3 h-3 rounded-full ${status.color} mr-2`}
                ></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {status.label}
                  </p>
                  <p className="text-sm text-gray-500">
                    {status.value} ({percentage.toFixed(1)}%)
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Performance Metrics */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Performance
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Success Rate</span>
              <div className="flex items-center">
                <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${stats.successRate ?? 0}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {stats.successRate ?? 0}%
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Avg Processing Time</span>
              <span className="text-sm font-medium text-gray-900">
                {formatDuration(stats.averageProcessingTime)}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Jobs</span>
              <span className="text-sm font-medium text-gray-900">
                {stats.total.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="space-y-3">
            {stats.failed > 0 && (
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-red-800">
                    Failed Jobs
                  </p>
                  <p className="text-xs text-red-600">
                    {stats.failed} jobs need attention
                  </p>
                </div>
                <button className="text-sm text-red-600 hover:text-red-800 font-medium">
                  Review →
                </button>
              </div>
            )}

            {stats.queued > 0 && (
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-yellow-800">
                    Queued Jobs
                  </p>
                  <p className="text-xs text-yellow-600">
                    {stats.queued} jobs waiting
                  </p>
                </div>
                <button className="text-sm text-yellow-600 hover:text-yellow-800 font-medium">
                  View →
                </button>
              </div>
            )}

            {stats.processing > 0 && (
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-blue-800">
                    Processing
                  </p>
                  <p className="text-xs text-blue-600">
                    {stats.processing} jobs running
                  </p>
                </div>
                <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                  Monitor →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

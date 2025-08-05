"use client";

import { IngestionStep } from "@/types/ingestion";

interface StatusTimelineProps {
  steps: IngestionStep[];
  className?: string;
}

const getStepIcon = (status: IngestionStep["status"]) => {
  switch (status) {
    case "completed":
      return (
        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
          <svg
            className="w-5 h-5 text-white"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      );
    case "processing":
      return (
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
          <svg
            className="w-5 h-5 text-white animate-spin"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
      );
    case "failed":
      return (
        <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
          <svg
            className="w-5 h-5 text-white"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      );
    case "pending":
      return (
        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
          <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
        </div>
      );
    default:
      return (
        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
          <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
        </div>
      );
  }
};

const getConnectorColor = (
  currentStatus: IngestionStep["status"],
  nextStatus?: IngestionStep["status"]
) => {
  if (currentStatus === "completed") {
    return "bg-green-500";
  }
  if (currentStatus === "processing") {
    return "bg-blue-500";
  }
  if (currentStatus === "failed") {
    return "bg-red-500";
  }
  return "bg-gray-300";
};

const formatTime = (timestamp?: string) => {
  if (!timestamp) return "Not started";
  return new Date(timestamp).toLocaleString();
};

const formatDuration = (startTime?: string, endTime?: string) => {
  if (!startTime) return "";

  const start = new Date(startTime);
  const end = endTime ? new Date(endTime) : new Date();
  const diffMs = end.getTime() - start.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffSecs = Math.floor((diffMs % 60000) / 1000);

  if (diffMins > 0) {
    return `(${diffMins}m ${diffSecs}s)`;
  }
  return `(${diffSecs}s)`;
};

export function StatusTimeline({ steps, className = "" }: StatusTimelineProps) {
  return (
    <div className={`space-y-0 ${className}`}>
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        const nextStep = !isLast ? steps[index + 1] : undefined;

        return (
          <div key={step.id} className="relative">
            {/* Step Content */}
            <div className="flex items-start">
              {/* Icon */}
              <div className="flex-shrink-0 relative">
                {getStepIcon(step.status)}

                {/* Connector Line */}
                {!isLast && (
                  <div
                    className={`absolute top-8 left-1/2 transform -translate-x-1/2 w-0.5 h-12 ${getConnectorColor(step.status, nextStep?.status)}`}
                  />
                )}
              </div>

              {/* Content */}
              <div className="ml-4 flex-1 pb-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-900">
                    {step.name}
                  </h3>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      step.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : step.status === "processing"
                          ? "bg-blue-100 text-blue-800"
                          : step.status === "failed"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {step.status}
                  </span>
                </div>

                {/* Progress Bar for Processing Steps */}
                {step.status === "processing" && (
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{step.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${step.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Details */}
                {step.details && (
                  <p className="text-sm text-gray-600 mt-2">{step.details}</p>
                )}

                {/* Timestamps */}
                <div className="mt-2 space-y-1 text-xs text-gray-500">
                  {step.startedAt && (
                    <div>
                      Started: {formatTime(step.startedAt)}
                      {step.status === "processing" &&
                        ` ${formatDuration(step.startedAt)}`}
                    </div>
                  )}
                  {step.completedAt && (
                    <div>
                      Completed: {formatTime(step.completedAt)}{" "}
                      {formatDuration(step.startedAt, step.completedAt)}
                    </div>
                  )}
                </div>

                {/* Error Message */}
                {step.error && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
                    <div className="flex">
                      <svg
                        className="w-4 h-4 text-red-400 mr-1 mt-0.5 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <p className="text-xs text-red-700">{step.error}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

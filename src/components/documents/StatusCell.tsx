"use client";

import React from "react";
import { Document } from "@/types/document";

interface StatusCellProps {
  document: Document;
}

export function StatusCell({ document }: StatusCellProps) {
  const { status, processingProgress } = document;

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "processed":
        return { color: "bg-green-100 text-green-800", text: "Processed" };
      case "pending":
        return { color: "bg-yellow-100 text-yellow-800", text: "Processing" };
      case "failed":
        return { color: "bg-red-100 text-red-800", text: "Failed" };
      default:
        return { color: "bg-gray-100 text-gray-800", text: status };
    }
  };

  const statusConfig = getStatusConfig(status);

  return (
    <div className="flex items-center space-x-2">
      <span
        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusConfig.color}`}
      >
        {statusConfig.text}
      </span>
      {status === "pending" && processingProgress !== undefined && (
        <div className="w-16 bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${processingProgress}%` }}
          />
        </div>
      )}
    </div>
  );
}

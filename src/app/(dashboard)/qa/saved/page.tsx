"use client";

import { useState } from "react";
import { useQA } from "@/hooks/useQA";
import { SavedQAList } from "@/components/qa/SavedQAList";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { SavedQAFilters, QAFilters } from "@/types/qa";

export default function SavedQAPage() {
  const [exportFormat, setExportFormat] = useState<"json" | "csv">("json");

  const {
    savedQAs,
    pagination,
    filters,
    isLoading,
    error,
    setPage,
    setFilters,
  } = useQA();

  const handleFiltersChange = (newFilters: SavedQAFilters) => {
    // Convert SavedQAFilters to QAFilters by handling the savedAt sortBy case
    const { sortBy, ...otherFilters } = newFilters;
    const qaFilters = {
      ...otherFilters,
      // If sortBy is "savedAt", we'll handle it client-side, so use "createdAt" for the API
      sortBy: sortBy === "savedAt" ? "createdAt" : sortBy,
    };
    setFilters({ ...filters, ...qaFilters });
  };

  const handleRemoveSavedQA = async (id: string) => {
    try {
      // This would be implemented in the service
      console.log("Remove saved Q&A:", id);
    } catch (err) {
      console.error("Failed to remove saved Q&A:", err);
    }
  };

  const handleUpdateNotes = async (id: string, notes: string) => {
    try {
      // This would be implemented in the service
      console.log("Update notes:", id, notes);
    } catch (err) {
      console.error("Failed to update notes:", err);
    }
  };

  const handleUpdateTags = async (id: string, tags: string[]) => {
    try {
      // This would be implemented in the service
      console.log("Update tags:", id, tags);
    } catch (err) {
      console.error("Failed to update tags:", err);
    }
  };

  const handleExport = () => {
    const dataToExport = savedQAs.map((savedQA) => ({
      id: savedQA.id,
      question: savedQA.question.text,
      answer: savedQA.answer.text,
      confidence: savedQA.answer.confidence,
      sources: savedQA.answer.sources.length,
      savedAt: savedQA.savedAt,
      notes: savedQA.notes,
      tags: savedQA.tags.join(", "),
    }));

    if (exportFormat === "json") {
      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `saved-qa-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      // CSV export
      const headers = [
        "ID",
        "Question",
        "Answer",
        "Confidence",
        "Sources",
        "Saved At",
        "Notes",
        "Tags",
      ];
      const csvContent = [
        headers.join(","),
        ...dataToExport.map((row) =>
          [
            row.id,
            `"${row.question.replace(/"/g, '""')}"`,
            `"${row.answer.replace(/"/g, '""')}"`,
            row.confidence,
            row.sources,
            row.savedAt,
            `"${(row.notes || "").replace(/"/g, '""')}"`,
            `"${row.tags}"`,
          ].join(",")
        ),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `saved-qa-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Saved Q&As</h1>
          <p className="text-gray-600 mt-1">
            Manage your saved questions and answers
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {savedQAs.length > 0 && (
            <>
              <select
                value={exportFormat}
                onChange={(e) =>
                  setExportFormat(e.target.value as "json" | "csv")
                }
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="json">JSON</option>
                <option value="csv">CSV</option>
              </select>

              <Button variant="outline" onClick={handleExport}>
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Export
              </Button>
            </>
          )}

          <Button
            variant="primary"
            onClick={() => (window.location.href = "/qa")}
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Ask Question
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 text-red-400 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-sm text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6">
          <SavedQAList
            savedQAs={savedQAs}
            onRemove={handleRemoveSavedQA}
            onUpdateNotes={handleUpdateNotes}
            onUpdateTags={handleUpdateTags}
            onFiltersChange={handleFiltersChange}
            pagination={pagination}
            onPageChange={setPage}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Quick Actions */}
      {savedQAs.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No saved Q&As yet
          </h3>
          <p className="text-gray-500 mb-6">
            Start asking questions and save the ones you find useful for future
            reference.
          </p>
          <div className="flex justify-center space-x-3">
            <Button
              variant="primary"
              onClick={() => (window.location.href = "/qa")}
            >
              Ask Your First Question
            </Button>
            <Button
              variant="outline"
              onClick={() => (window.location.href = "/qa/history")}
            >
              Browse History
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

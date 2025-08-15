"use client";

import { useState, useEffect } from "react";
import { Document } from "@/types/document";
import { fetchDocuments } from "@/app/actions/documents";

interface DocumentSelectorProps {
  onDocumentsChange?: (documents: Document[]) => void;
}

export function DocumentSelector({ onDocumentsChange }: DocumentSelectorProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    async function loadDocuments() {
      try {
        setLoading(true);
        const response = await fetchDocuments(1, 100, { status: "processed" });

        if (response.success && response.data) {
          const processedDocs = response.data.documents;
          setDocuments(processedDocs);
          onDocumentsChange?.(processedDocs);
        } else {
          console.error("Failed to fetch documents:", response.error);
          setDocuments([]);
        }
      } catch (error) {
        console.error("Failed to fetch documents:", error);
        setDocuments([]);
      } finally {
        setLoading(false);
      }
    }

    loadDocuments();
  }, [onDocumentsChange]);

  if (loading) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center space-x-2">
          <svg
            className="animate-spin h-4 w-4 text-blue-600"
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
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span className="text-sm text-blue-700">
            Loading available documents...
          </span>
        </div>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div className="flex items-start space-x-3">
          <svg
            className="h-5 w-5 text-yellow-600 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <h3 className="text-sm font-medium text-yellow-800">
              No processed documents found
            </h3>
            <p className="text-sm text-yellow-700 mt-1">
              You need to upload and process documents before you can ask
              questions.
              <a
                href="/documents"
                className="font-medium underline hover:text-yellow-900 ml-1"
              >
                Upload documents here
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <svg
            className="h-5 w-5 text-green-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <h3 className="text-sm font-medium text-green-800">
              Knowledge Base Ready
            </h3>
            <p className="text-sm text-green-700">
              {documents.length} processed document
              {documents.length !== 1 ? "s" : ""} available for Q&A
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm text-green-700 hover:text-green-900 focus:outline-none"
        >
          {isExpanded ? "Hide" : "Show"} documents
        </button>
      </div>

      {isExpanded && (
        <div className="mt-4 border-t border-green-200 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {documents.slice(0, 10).map((doc) => (
              <div
                key={doc.id}
                className="flex items-center space-x-3 p-2 bg-white rounded border border-green-100"
              >
                <div className="flex-shrink-0">
                  <svg
                    className="h-4 w-4 text-green-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {doc.title}
                  </p>
                  <p className="text-xs text-gray-500">
                    {doc.category} •{" "}
                    {new Date(doc.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}

            {documents.length > 10 && (
              <div className="col-span-full text-center">
                <p className="text-sm text-green-700">
                  ... and {documents.length - 10} more documents
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

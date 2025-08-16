"use client";

import { DocumentSearchResult } from "@/types/qa";

interface DocumentSearchSelectorProps {
  documents: DocumentSearchResult[];
  selectedDocument: DocumentSearchResult | null;
  onDocumentSelect: (document: DocumentSearchResult | null) => void;
}

export function DocumentSearchSelector({
  documents,
  selectedDocument,
  onDocumentSelect,
}: DocumentSearchSelectorProps) {
  if (documents.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <input
          type="radio"
          id="all-documents"
          name="document-selection"
          checked={selectedDocument === null}
          onChange={() => onDocumentSelect(null)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
        />
        <label
          htmlFor="all-documents"
          className="text-sm font-medium text-gray-700"
        >
          Search all documents
        </label>
      </div>

      {documents.map((doc) => (
        <div key={doc.documentId} className="flex items-start space-x-2">
          <input
            type="radio"
            id={`doc-${doc.documentId}`}
            name="document-selection"
            checked={selectedDocument?.documentId === doc.documentId}
            onChange={() => onDocumentSelect(doc)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 mt-0.5"
          />
          <label
            htmlFor={`doc-${doc.documentId}`}
            className="flex-1 cursor-pointer"
          >
            <div className="text-sm font-medium text-gray-900">
              {doc.documentTitle}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {doc.excerpt.length > 100
                ? `${doc.excerpt.substring(0, 100)}...`
                : doc.excerpt}
            </div>
            <div className="text-xs text-blue-600 mt-1">
              Match: {doc.matchType} • Relevance:{" "}
              {Math.round(doc.relevanceScore * 100)}%
            </div>
          </label>
        </div>
      ))}
    </div>
  );
}

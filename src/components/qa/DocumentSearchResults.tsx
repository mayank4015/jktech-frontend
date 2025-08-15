import { DocumentSearchResult } from "@/types/qa";
import { RelevanceScore } from "@/components/ui/RelevanceScore";
import { MatchTypeBadge } from "@/components/ui/MatchTypeBadge";
import { HighlightedText } from "@/components/ui/HighlightedText";
import Link from "next/link";

interface DocumentSearchResultsProps {
  results: DocumentSearchResult[];
  query: string;
  onSelectDocument?: (document: DocumentSearchResult) => void;
}

export function DocumentSearchResults({
  results,
  query,
  onSelectDocument,
}: DocumentSearchResultsProps) {
  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">🔍</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No documents found
        </h3>
        <p className="text-gray-600">
          Try different keywords or check your spelling
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {results.map((result) => (
        <div
          key={result.documentId}
          className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                <HighlightedText text={result.documentTitle} query={query} />
              </h3>
              <div className="flex items-center gap-2 mb-3">
                <MatchTypeBadge type={result.matchType} />
                <RelevanceScore score={result.relevanceScore} />
              </div>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-gray-700 leading-relaxed">
              <HighlightedText text={result.excerpt} query={query} />
            </p>
            {result.context && (
              <p className="text-sm text-gray-500 mt-2">
                Context: {result.context}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {onSelectDocument && (
                <button
                  onClick={() => onSelectDocument(result)}
                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                >
                  Ask Questions
                </button>
              )}
              <Link
                href={`/documents/${result.documentId}`}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
              >
                View Document
              </Link>
            </div>
            <span className="text-xs text-gray-400">
              Score: {(result.relevanceScore * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

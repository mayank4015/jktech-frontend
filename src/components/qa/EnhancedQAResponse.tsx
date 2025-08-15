import { EnhancedQAResult } from "@/types/qa";
import { RelevanceScore } from "@/components/ui/RelevanceScore";
import Link from "next/link";

interface EnhancedQAResponseProps {
  result: EnhancedQAResult;
}

export function EnhancedQAResponse({ result }: EnhancedQAResponseProps) {
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-green-600 bg-green-50";
    if (confidence >= 0.6) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 0.8) return "🎯";
    if (confidence >= 0.6) return "⚡";
    return "⚠️";
  };

  return (
    <div className="space-y-6">
      {/* Answer Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Answer</h3>
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${getConfidenceColor(
                result.confidence
              )}`}
            >
              <span className="mr-1">
                {getConfidenceIcon(result.confidence)}
              </span>
              {Math.round(result.confidence * 100)}% confidence
            </span>
            <span className="text-sm text-gray-500">
              ⏱️ {result.processingTime}ms
            </span>
          </div>
        </div>

        <div className="prose max-w-none">
          <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">
            {result.answer}
          </div>
        </div>
      </div>

      {/* Sources Section */}
      {result.sources && result.sources.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            📚 Sources ({result.sources.length})
          </h3>

          <div className="space-y-4">
            {result.sources.map((source, index) => (
              <div
                key={`${source.documentId}-${index}`}
                className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{source.title}</h4>
                  <RelevanceScore score={source.relevanceScore} />
                </div>

                <p className="text-gray-700 text-sm leading-relaxed mb-3">
                  {source.excerpt}
                </p>

                <div className="flex items-center justify-between">
                  <Link
                    href={`/documents/${source.documentId}`}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View Full Document →
                  </Link>
                  <span className="text-xs text-gray-400">
                    Relevance: {(source.relevanceScore * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Metrics Section */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-2">📊 Response Metrics</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Confidence:</span>
            <div className="font-medium">
              {Math.round(result.confidence * 100)}%
            </div>
          </div>
          <div>
            <span className="text-gray-500">Processing Time:</span>
            <div className="font-medium">{result.processingTime}ms</div>
          </div>
          <div>
            <span className="text-gray-500">Sources Found:</span>
            <div className="font-medium">{result.sources?.length || 0}</div>
          </div>
          <div>
            <span className="text-gray-500">Answer Length:</span>
            <div className="font-medium">{result.answer.length} chars</div>
          </div>
        </div>
      </div>
    </div>
  );
}

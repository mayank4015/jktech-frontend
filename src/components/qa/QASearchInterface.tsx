import { Suspense } from "react";
import { DocumentSearchResult } from "@/types/qa";
import { DocumentSearchResults } from "./DocumentSearchResults";
import { SearchForm } from "./SearchForm";

interface QASearchInterfaceProps {
  initialQuery: string;
  searchResults: DocumentSearchResult[];
  searchError: string | null;
}

export function QASearchInterface({
  initialQuery,
  searchResults,
  searchError,
}: QASearchInterfaceProps) {
  return (
    <div className="space-y-6">
      {/* Search Form */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            🔍 Search Documents
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Find relevant documents from your knowledge base
          </p>
        </div>

        <SearchForm initialQuery={initialQuery} />
      </div>

      {/* Search Results */}
      {initialQuery && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Search Results
            </h3>
            {initialQuery && (
              <p className="text-sm text-gray-600 mt-1">
                Results for &quot;{initialQuery}&quot;
              </p>
            )}
          </div>

          <Suspense fallback={<SearchResultsSkeleton />}>
            {searchError ? (
              <div className="text-center py-8">
                <div className="text-red-400 text-4xl mb-2">⚠️</div>
                <p className="text-red-600">{searchError}</p>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 text-4xl mb-2">🔍</div>
                <p className="text-gray-600">
                  No documents found for &quot;{initialQuery}&quot;
                </p>
              </div>
            ) : (
              <DocumentSearchResults
                results={searchResults}
                query={initialQuery}
              />
            )}
          </Suspense>
        </div>
      )}
    </div>
  );
}

function SearchResultsSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-full"></div>
        </div>
      ))}
    </div>
  );
}

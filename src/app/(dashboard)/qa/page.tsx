import { searchDocuments } from "@/app/actions/qa";
import { QASearchInterface } from "@/components/qa/QASearchInterface";
import { QAClientInterface } from "@/components/qa/QAClientInterface";
import { DocumentSearchResult } from "@/types/qa";

// Mark this page as dynamic since it uses cookies for authentication
export const dynamic = "force-dynamic";

interface QAPageProps {
  searchParams: Promise<{ q?: string; limit?: string }>;
}

export default async function QAPage({ searchParams }: QAPageProps) {
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams.q;
  const limit = parseInt(resolvedSearchParams.limit || "10");

  // Fetch search results on server if query exists
  let searchResults: DocumentSearchResult[] = [];
  let searchError: string | null = null;

  if (query?.trim()) {
    try {
      searchResults = await searchDocuments(query, limit);
    } catch (error) {
      searchError = error instanceof Error ? error.message : "Search failed";
      console.error("Server-side search failed:", error);
    }
  }

  return (
    <div className="px-4 sm:px-0">
      {/* Header Section */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Ask Questions
        </h1>
        <p className="mt-1 text-sm sm:text-base text-gray-500">
          Search documents and get AI-powered answers from your knowledge base
        </p>
      </div>

      {/* Search Interface */}
      <QASearchInterface
        initialQuery={query || ""}
        searchResults={searchResults}
        searchError={searchError}
      />

      {/* Client-side Q&A Interface */}
      <QAClientInterface searchResults={searchResults} />
    </div>
  );
}

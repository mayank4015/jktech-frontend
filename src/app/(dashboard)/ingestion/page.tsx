import { Suspense } from "react";
import { getIngestions, getIngestionStats } from "@/app/actions/ingestion";
import { fetchDocuments } from "@/app/actions/documents";
import { fetchUsers } from "@/app/actions/users";
import { IngestionPageClient } from "./IngestionPageClient";
import { Loading } from "@/components/ui";

interface IngestionPageProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    search?: string;
    status?: string;
    documentId?: string;
    createdBy?: string;
    dateStart?: string;
    dateEnd?: string;
    sortBy?: string;
    sortOrder?: string;
  }>;
}

export default async function IngestionPage({
  searchParams,
}: IngestionPageProps) {
  // Await search params for Next.js 15 compatibility
  const params = await searchParams;

  // Parse search params
  const page = parseInt(params.page || "1");
  const limit = parseInt(params.limit || "10");

  const filters = {
    search: params.search,
    status: params.status as
      | "all"
      | "queued"
      | "processing"
      | "completed"
      | "failed"
      | undefined,
    documentId: params.documentId,
    createdBy: params.createdBy,
    dateRange:
      params.dateStart && params.dateEnd
        ? {
            start: params.dateStart,
            end: params.dateEnd,
          }
        : undefined,
    sortBy: params.sortBy as
      | "createdAt"
      | "startedAt"
      | "completedAt"
      | "progress"
      | "documentTitle"
      | undefined,
    sortOrder: params.sortOrder as "asc" | "desc" | undefined,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Ingestion Management
          </h1>
          <p className="text-gray-600 mt-1">
            Monitor and manage document ingestion processes
          </p>
        </div>
      </div>

      <Suspense fallback={<Loading />}>
        <IngestionPageContent page={page} limit={limit} filters={filters} />
      </Suspense>
    </div>
  );
}

interface IngestionPageContentProps {
  page: number;
  limit: number;
  filters: {
    search?: string;
    status?: "all" | "queued" | "processing" | "completed" | "failed";
    documentId?: string;
    createdBy?: string;
    dateRange?: {
      start: string;
      end: string;
    };
    sortBy?:
      | "createdAt"
      | "startedAt"
      | "completedAt"
      | "progress"
      | "documentTitle";
    sortOrder?: "asc" | "desc";
  };
}

async function IngestionPageContent({
  page,
  limit,
  filters,
}: IngestionPageContentProps) {
  try {
    // Fetch all data in parallel
    const [
      ingestionsResult,
      statsResult,
      documentsResult,
      usersResult,
      allIngestionsResult,
    ] = await Promise.all([
      getIngestions(page, limit, filters),
      getIngestionStats(),
      fetchDocuments(1, 1000), // Fetch all documents with a high limit
      fetchUsers(1, 1000), // Fetch all users with a high limit
      getIngestions(1, 1000, {}), // Get all ingestions to check availability
    ]);

    // Get active ingestions to check which documents are currently being processed
    const activeIngestions =
      allIngestionsResult.data?.filter(
        (ingestion) =>
          ingestion.status === "queued" || ingestion.status === "processing"
      ) || [];

    console.log("🔍 Ingestions data:", {
      allIngestionsResult,
      hasData: !!allIngestionsResult.data,
      dataLength: allIngestionsResult.data?.length,
      activeIngestions: activeIngestions.length,
    });

    // Create a set of document IDs that have active ingestions
    const activeIngestionDocumentIds = new Set(
      activeIngestions.map((ingestion) => ingestion.documentId)
    );

    // Debug logging
    console.log("📊 Ingestion availability check:", {
      totalDocuments: documentsResult.data?.documents?.length || 0,
      processedDocuments:
        documentsResult.data?.documents?.filter(
          (doc) => doc.status === "processed"
        ).length || 0,
      totalIngestions: allIngestionsResult.data?.length || 0,
      activeIngestions: activeIngestions.length,
      activeIngestionDocumentIds: Array.from(activeIngestionDocumentIds),
      documentStatuses:
        documentsResult.data?.documents?.map((doc) => ({
          id: doc.id,
          title: doc.title,
          status: doc.status,
        })) || [],
    });

    // Filter documents to only show processed ones that don't have active ingestions
    // TEMPORARY: Allow all documents for debugging
    const availableDocuments =
      documentsResult.success && documentsResult.data?.documents
        ? documentsResult.data.documents
            .filter(
              (doc) =>
                // doc.status === "processed" &&  // Temporarily commented out for debugging
                !activeIngestionDocumentIds.has(doc.id)
            )
            .map((doc) => ({
              id: doc.id,
              title: doc.title,
              status: doc.status,
            }))
        : [];

    // Temporary debug: show all documents regardless of status for debugging
    const allDocumentsForDebug =
      documentsResult.success && documentsResult.data?.documents
        ? documentsResult.data.documents.map((doc) => ({
            id: doc.id,
            title: doc.title,
            status: doc.status,
          }))
        : [];

    console.log("🐛 All documents (debug):", allDocumentsForDebug);

    console.log(
      "✅ Available documents for ingestion:",
      availableDocuments.length,
      availableDocuments
    );

    // Additional debugging for API results
    console.log("🔍 API Results:", {
      documentsSuccess: documentsResult.success,
      documentsError: documentsResult.error,
      ingestionsSuccess: !!allIngestionsResult.data,
      ingestionsDataLength: allIngestionsResult.data?.length || 0,
    });

    // Map users for filters
    const availableUsers = usersResult.data
      ? usersResult.data.map((user) => ({
          id: user.id,
          name: user.name,
        }))
      : [];

    // Map all documents for filters
    const availableDocumentsForFilter =
      documentsResult.success && documentsResult.data?.documents
        ? documentsResult.data.documents.map((doc) => ({
            id: doc.id,
            title: doc.title,
          }))
        : [];

    return (
      <IngestionPageClient
        initialIngestions={ingestionsResult.data || []}
        initialStats={statsResult}
        initialPagination={{
          page: ingestionsResult.page || page,
          limit: ingestionsResult.limit || limit,
          total: ingestionsResult.total || 0,
          totalPages: ingestionsResult.totalPages || 0,
        }}
        initialFilters={filters}
        availableDocuments={availableDocuments}
        availableUsers={availableUsers}
        availableDocumentsForFilter={availableDocumentsForFilter}
      />
    );
  } catch (error) {
    console.error("Error loading ingestion data:", error);

    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <svg
            className="w-5 h-5 text-red-400 mr-2 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <p className="text-sm text-red-700 mt-1">
              Failed to load ingestion data. Please try refreshing the page.
            </p>
          </div>
        </div>
      </div>
    );
  }
}

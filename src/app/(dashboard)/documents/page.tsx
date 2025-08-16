import { Suspense } from "react";
import { Metadata } from "next";
import { DocumentSearchParams } from "@/types/document";
import { fetchDocuments, fetchDocumentStats } from "@/app/actions/documents";
import { DocumentManagement } from "@/components/documents/DocumentManagement";
import { DocumentsLoading } from "@/components/documents/DocumentsLoading";

// Mark this page as dynamic since it uses cookies for authentication
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Document Management | JKTech",
  description:
    "Upload, organize, and manage your documents with AI-powered processing",
};

interface DocumentsPageProps {
  searchParams: Promise<DocumentSearchParams>;
}

async function DocumentsPageContent({ searchParams }: DocumentsPageProps) {
  const params = await searchParams;

  // Parse search parameters
  const page = parseInt(params.page || "1", 10);
  const limit = parseInt(params.limit || "10", 10);

  // Build filters from search params
  const filters = {
    search: params.search,
    status: params.status as
      | "all"
      | "pending"
      | "processing"
      | "processed"
      | "failed"
      | undefined,
    category: params.category,
    uploadedBy: params.uploadedBy,
    sortBy: params.sortBy as
      | "title"
      | "createdAt"
      | "fileSize"
      | "status"
      | undefined,
    sortOrder: params.sortOrder as "asc" | "desc" | undefined,
    tags: Array.isArray(params.tags)
      ? params.tags
      : params.tags
        ? [params.tags]
        : undefined,
    dateRange:
      params.dateStart && params.dateEnd
        ? {
            start: params.dateStart,
            end: params.dateEnd,
          }
        : undefined,
  };

  // Fetch data in parallel
  const [documentsResult, statsResult] = await Promise.allSettled([
    fetchDocuments(page, limit, filters),
    fetchDocumentStats(),
  ]);

  // Handle documents result
  const documentsData =
    documentsResult.status === "fulfilled" && documentsResult.value.success
      ? documentsResult.value.data
      : null;

  // Handle stats result
  const statsData =
    statsResult.status === "fulfilled" && statsResult.value.success
      ? statsResult.value.data
      : null;

  // Handle errors
  const documentsError =
    documentsResult.status === "rejected"
      ? documentsResult.reason?.message || "Failed to load documents"
      : documentsResult.status === "fulfilled" && !documentsResult.value.success
        ? documentsResult.value.error
        : null;

  const statsError =
    statsResult.status === "rejected"
      ? "Failed to load statistics"
      : statsResult.status === "fulfilled" && !statsResult.value.success
        ? "Failed to load statistics"
        : null;

  return (
    <DocumentManagement
      initialDocuments={documentsData?.documents || []}
      initialTotalDocuments={documentsData?.pagination?.total || 0}
      initialCurrentPage={documentsData?.pagination?.page || page}
      initialTotalPages={documentsData?.pagination?.totalPages || 0}
      initialLimit={documentsData?.pagination?.limit || limit}
      initialStats={statsData ?? null}
      initialFilters={filters}
      initialError={documentsError}
      statsError={statsError}
    />
  );
}

export default function DocumentsPage(props: DocumentsPageProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Document Management
          </h1>
          <p className="text-gray-600">
            Upload, organize, and manage your documents with AI-powered
            processing
          </p>
        </div>
      </div>

      {/* Content with Suspense */}
      <Suspense fallback={<DocumentsLoading />}>
        <DocumentsPageContent {...props} />
      </Suspense>
    </div>
  );
}

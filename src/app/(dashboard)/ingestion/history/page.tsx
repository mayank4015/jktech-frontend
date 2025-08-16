import Link from "next/link";
import { getIngestions } from "@/app/actions/ingestion";
import { Button } from "@/components/ui";

// Mark this page as dynamic since it uses cookies for authentication
export const dynamic = "force-dynamic";

interface IngestionHistoryPageProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    search?: string;
    status?: "all" | "queued" | "processing" | "completed" | "failed";
  }>;
}

export default async function IngestionHistoryPage({
  searchParams,
}: IngestionHistoryPageProps) {
  const resolvedSearchParams = await searchParams;
  const page = parseInt(resolvedSearchParams.page || "1");
  const limit = parseInt(resolvedSearchParams.limit || "10");
  const search = resolvedSearchParams.search;
  const status = resolvedSearchParams.status;

  // Fetch data using server actions
  const ingestionsResponse = await getIngestions(page, limit, {
    search,
    status,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <Link
              href="/ingestion"
              className="text-blue-600 hover:text-blue-800"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">
              Ingestion History
            </h1>
          </div>
          <p className="text-gray-600 mt-1">
            Complete history of all ingestion processes
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-3">
          <Link href="/ingestion">
            <Button>Back to Overview</Button>
          </Link>
        </div>
      </div>

      {/* Simple Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Document
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Started At
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created By
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {ingestionsResponse.data.map((ingestion) => (
                <tr key={ingestion.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {ingestion.documentTitle}
                    </div>
                    <div className="text-sm text-gray-500">
                      ID: {ingestion.id}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        ingestion.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : ingestion.status === "processing"
                            ? "bg-blue-100 text-blue-800"
                            : ingestion.status === "failed"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {ingestion.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {ingestion.progress}%
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div
                        className={`h-2 rounded-full ${
                          ingestion.status === "completed"
                            ? "bg-green-600"
                            : ingestion.status === "processing"
                              ? "bg-blue-600"
                              : ingestion.status === "failed"
                                ? "bg-red-600"
                                : "bg-yellow-600"
                        }`}
                        style={{ width: `${ingestion.progress}%` }}
                      ></div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    <div>
                      {new Date(ingestion.startedAt).toLocaleDateString()}
                    </div>
                    <div className="text-xs">
                      {new Date(ingestion.startedAt).toLocaleTimeString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {ingestion.createdByName}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {ingestionsResponse.data.length === 0 && (
          <div className="p-8 text-center">
            <p className="text-gray-500">No ingestions found.</p>
          </div>
        )}
      </div>

      {/* Simple Pagination Info */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Showing {(ingestionsResponse.page - 1) * ingestionsResponse.limit + 1}{" "}
          to{" "}
          {Math.min(
            ingestionsResponse.page * ingestionsResponse.limit,
            ingestionsResponse.total
          )}{" "}
          of {ingestionsResponse.total} ingestions
        </div>
        <div className="text-sm text-gray-500">
          Page {ingestionsResponse.page} of {ingestionsResponse.totalPages}
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";
import { getCurrentUser } from "@/app/actions";
import { fetchDocuments, fetchDocumentStats } from "@/app/actions/documents";
import { getIngestionStats } from "@/app/actions/ingestion";
import { getQAStats } from "@/app/actions/qa";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  // Fetch real data from server actions
  const [documentStats, ingestionStats, qaStats, recentDocuments] =
    await Promise.all([
      fetchDocumentStats().catch(() => ({
        total: 0,
        processed: 0,
        pending: 0,
      })),
      getIngestionStats().catch(() => ({
        total: 0,
        completed: 0,
        processing: 0,
        failed: 0,
        queued: 0,
      })),
      getQAStats().catch(() => ({ totalQuestions: 0, totalConversations: 0 })),
      fetchDocuments(1, 4).catch(() => ({ data: [], total: 0 })),
    ]);

  const stats = [
    { name: "Total Documents", value: documentStats.total.toString() },
    { name: "Processed Documents", value: ingestionStats.completed.toString() },
    {
      name: "Processing Documents",
      value: ingestionStats.processing.toString(),
    },
    {
      name: "Total Q&A Sessions",
      value: qaStats.totalConversations.toString(),
    },
  ];

  return (
    <div className="px-4 sm:px-0">
      {/* Header Section */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Dashboard
        </h1>
        <p className="mt-1 text-sm sm:text-base text-gray-500">
          Welcome back, {user?.name}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6 sm:mb-8">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200"
          >
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">
                {stat.name}
              </dt>
              <dd className="mt-1 text-2xl sm:text-3xl font-semibold text-gray-900">
                {stat.value}
              </dd>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Recent Documents */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Recent Documents
            </h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {recentDocuments.data.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {recentDocuments.data.map((doc) => (
                  <li key={doc.id}>
                    <Link
                      href={`/documents/${doc.id}`}
                      className="block hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors duration-150"
                    >
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0 pr-4">
                            <p className="text-sm font-medium text-blue-600 truncate">
                              {doc.title}
                            </p>
                            <div className="mt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                              <p className="flex items-center text-sm text-gray-500">
                                <svg
                                  className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                {doc.fileType}
                              </p>
                              <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                <svg
                                  className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                <time dateTime={doc.createdAt}>
                                  {new Date(doc.createdAt).toLocaleDateString()}
                                </time>
                              </div>
                            </div>
                          </div>
                          <div className="flex-shrink-0">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                doc.status === "processed"
                                  ? "bg-green-100 text-green-800"
                                  : doc.status === "processing"
                                    ? "bg-blue-100 text-blue-800"
                                    : doc.status === "failed"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {doc.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-6 text-center text-gray-500">
                No documents found
              </div>
            )}
          </div>
          <div className="border-t border-gray-200 px-4 py-4 sm:px-6">
            <Link
              href="/documents"
              className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500 focus:outline-none focus:underline transition-colors duration-150"
            >
              View all documents
              <svg
                className="ml-1 h-4 w-4"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </Link>
          </div>
        </div>

        {/* Ingestion Status */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Ingestion Status
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {ingestionStats.completed}
                </div>
                <div className="text-sm text-gray-500">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {ingestionStats.processing}
                </div>
                <div className="text-sm text-gray-500">Processing</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {ingestionStats.queued}
                </div>
                <div className="text-sm text-gray-500">Queued</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {ingestionStats.failed}
                </div>
                <div className="text-sm text-gray-500">Failed</div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-200 px-4 py-4 sm:px-6">
            <Link
              href="/ingestion"
              className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500 focus:outline-none focus:underline transition-colors duration-150"
            >
              View Ingestion Dashboard
              <svg
                className="ml-1 h-4 w-4"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

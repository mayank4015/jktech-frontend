import { getCurrentUser } from "@/app/actions";
import { ConversationHistory } from "@/components/qa";

interface SearchParams {
  page?: string;
  search?: string;
  isBookmarked?: string;
  dateStart?: string;
  dateEnd?: string;
  tags?: string | string[];
}

interface HistoryPageProps {
  searchParams: Promise<SearchParams>;
}

export default async function HistoryPage({ searchParams }: HistoryPageProps) {
  await getCurrentUser(); // Ensure user is authenticated
  const params = await searchParams;

  // Build filters from search params
  const filters = {
    search: params.search,
    isBookmarked: params.isBookmarked === "true" ? true : undefined,
    dateStart: params.dateStart,
    dateEnd: params.dateEnd,
    tags: Array.isArray(params.tags)
      ? params.tags
      : params.tags
        ? [params.tags]
        : undefined,
  };

  // Mock conversations data (until backend is implemented)
  const conversationsData = {
    data: [
      {
        id: "conv-1",
        title: "Questions about document processing",
        userId: "user-1",
        userName: "Current User",
        createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
        questionCount: 3,
        lastQuestionAt: new Date(Date.now() - 86400000).toISOString(),
        isBookmarked: true,
        tags: ["processing", "documents"],
        summary:
          "Discussion about document processing workflows and best practices",
      },
      {
        id: "conv-2",
        title: "How to upload multiple files?",
        userId: "user-1",
        userName: "Current User",
        createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        updatedAt: new Date(Date.now() - 172800000).toISOString(),
        questionCount: 1,
        lastQuestionAt: new Date(Date.now() - 172800000).toISOString(),
        isBookmarked: false,
        tags: ["upload", "files"],
        summary: "Quick question about bulk file upload functionality",
      },
    ],
    total: 2,
    page: 1,
    limit: 10,
    totalPages: 1,
  };

  return (
    <div className="px-4 sm:px-0">
      {/* Header Section */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Q&A History
        </h1>
        <p className="mt-1 text-sm sm:text-base text-gray-500">
          Browse your previous conversations and questions
        </p>
      </div>

      {/* Conversation History Component */}
      <ConversationHistory
        conversations={conversationsData.data}
        pagination={{
          page: conversationsData.page,
          limit: conversationsData.limit,
          total: conversationsData.total,
          totalPages: conversationsData.totalPages,
        }}
        filters={filters}
      />
    </div>
  );
}

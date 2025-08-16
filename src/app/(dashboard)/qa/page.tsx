import { getCurrentUser } from "@/app/actions";
import { EnhancedQAInterface } from "@/components/qa";

// Mark this page as dynamic since it uses cookies for authentication
export const dynamic = "force-dynamic";
export default async function QAPage() {
  const user = await getCurrentUser();

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

      {/* Enhanced Q&A Interface */}
      <EnhancedQAInterface user={user} />
    </div>
  );
}

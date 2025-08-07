export function DocumentsLoading() {
  return (
    <div className="space-y-6">
      {/* Stats Loading */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
              </div>
              <div className="ml-4 flex-1">
                <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-6 bg-gray-200 rounded animate-pulse w-16"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters Loading */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
              <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          <div className="h-10 bg-gray-200 rounded animate-pulse w-24"></div>
          <div className="h-10 bg-gray-200 rounded animate-pulse w-20"></div>
        </div>
      </div>

      {/* Table Loading */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Table Header */}
        <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
          <div className="grid grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-4 bg-gray-200 rounded animate-pulse"
              ></div>
            ))}
          </div>
        </div>

        {/* Table Rows */}
        <div className="divide-y divide-gray-200">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="px-6 py-4">
              <div className="grid grid-cols-6 gap-4 items-center">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-6 bg-gray-200 rounded-full animate-pulse w-20"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="flex gap-2">
                  <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination Loading */}
      <div className="flex justify-between items-center">
        <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
        <div className="flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-10 w-10 bg-gray-200 rounded animate-pulse"
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}

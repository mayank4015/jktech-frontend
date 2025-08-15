interface MatchTypeBadgeProps {
  type: "title" | "content" | "keywords" | "summary";
}

export function MatchTypeBadge({ type }: MatchTypeBadgeProps) {
  const getTypeConfig = (type: string) => {
    switch (type) {
      case "title":
        return {
          label: "Title Match",
          icon: "📝",
          className: "text-blue-600 bg-blue-50",
        };
      case "content":
        return {
          label: "Content Match",
          icon: "📄",
          className: "text-purple-600 bg-purple-50",
        };
      case "keywords":
        return {
          label: "Keywords",
          icon: "🏷️",
          className: "text-orange-600 bg-orange-50",
        };
      case "summary":
        return {
          label: "Summary",
          icon: "📋",
          className: "text-teal-600 bg-teal-50",
        };
      default:
        return {
          label: "Match",
          icon: "🔍",
          className: "text-gray-600 bg-gray-50",
        };
    }
  };

  const config = getTypeConfig(type);

  return (
    <span
      className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${config.className}`}
    >
      <span className="mr-1">{config.icon}</span>
      {config.label}
    </span>
  );
}

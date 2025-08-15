interface RelevanceScoreProps {
  score: number;
}

export function RelevanceScore({ score }: RelevanceScoreProps) {
  const percentage = Math.round(score * 100);

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return "text-green-600 bg-green-50";
    if (score >= 0.6) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  const getScoreIcon = (score: number) => {
    if (score >= 0.8) return "🎯";
    if (score >= 0.6) return "📊";
    return "📉";
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getScoreColor(
        score
      )}`}
    >
      <span className="mr-1">{getScoreIcon(score)}</span>
      {percentage}% match
    </span>
  );
}

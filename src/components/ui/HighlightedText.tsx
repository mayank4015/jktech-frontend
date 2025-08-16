interface HighlightedTextProps {
  text: string;
  query: string;
}

export function HighlightedText({ text, query }: HighlightedTextProps) {
  if (!query.trim()) {
    return <span>{text}</span>;
  }

  // Split query into individual keywords for partial matching
  const keywords = query
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word.length > 2);

  if (keywords.length === 0) {
    return <span>{text}</span>;
  }

  // Create a regex pattern that matches any of the keywords
  const escapedKeywords = keywords.map((keyword) =>
    keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  );

  // Create regex that matches whole words or partial words
  const regexPattern = `\\b(${escapedKeywords.join("|")})\\w*|\\w*(${escapedKeywords.join("|")})\\b|(${escapedKeywords.join("|")})`;
  const regex = new RegExp(regexPattern, "gi");

  const parts = text.split(regex).filter(Boolean);

  return (
    <span>
      {parts.map((part, index) => {
        // Check if this part contains any of our keywords
        const partLower = part.toLowerCase();
        const isMatch = keywords.some((keyword) => partLower.includes(keyword));

        return isMatch ? (
          <mark
            key={index}
            className="bg-yellow-200 text-yellow-900 px-1 rounded"
          >
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        );
      })}
    </span>
  );
}

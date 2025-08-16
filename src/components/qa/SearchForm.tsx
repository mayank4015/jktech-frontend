"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface SearchFormProps {
  initialQuery: string;
}

export function SearchForm({ initialQuery }: SearchFormProps) {
  const [query, setQuery] = useState(initialQuery);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    startTransition(() => {
      const params = new URLSearchParams(searchParams);
      params.set("q", query.trim());
      params.set("limit", "10");
      router.push(`/qa?${params.toString()}`);
    });
  };

  const handleClear = () => {
    setQuery("");
    startTransition(() => {
      router.push("/qa");
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-3">
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for documents..."
          className="flex-1"
          disabled={isPending}
        />
        <Button type="submit" disabled={isPending || !query.trim()}>
          {isPending ? "Searching..." : "Search"}
        </Button>
        {query && (
          <Button
            type="button"
            variant="outline"
            onClick={handleClear}
            disabled={isPending}
          >
            Clear
          </Button>
        )}
      </div>
    </form>
  );
}

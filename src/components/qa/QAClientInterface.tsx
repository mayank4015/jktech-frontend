"use client";

import { useState } from "react";
import { DocumentSearchResult, EnhancedQAResult } from "@/types/qa";
import { askEnhancedQuestion } from "@/app/actions/qa";
import { DocumentSearchSelector } from "./DocumentSearchSelector";
import { EnhancedQAResponse } from "./EnhancedQAResponse";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";

interface QAClientInterfaceProps {
  searchResults: DocumentSearchResult[];
}

export function QAClientInterface({ searchResults }: QAClientInterfaceProps) {
  const [selectedDocument, setSelectedDocument] =
    useState<DocumentSearchResult | null>(null);
  const [question, setQuestion] = useState("");
  const [qaResult, setQaResult] = useState<EnhancedQAResult | null>(null);
  const [isAsking, setIsAsking] = useState(false);

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setIsAsking(true);
    try {
      const result = await askEnhancedQuestion(
        question,
        selectedDocument?.documentId
      );
      setQaResult(result);
    } catch (error) {
      console.error("Q&A failed:", error);
      setQaResult(null);
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <div className="mt-8 space-y-6">
      {/* Q&A Interface */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            💬 Ask Questions
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Get AI-powered answers from your documents
          </p>
        </div>

        <form onSubmit={handleAskQuestion} className="space-y-4">
          {/* Document Selector */}
          {searchResults.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Document (Optional)
              </label>
              <DocumentSearchSelector
                documents={searchResults}
                selectedDocument={selectedDocument}
                onDocumentSelect={setSelectedDocument}
              />
            </div>
          )}

          {/* Question Input */}
          <div>
            <label
              htmlFor="question"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Your Question
            </label>
            <Textarea
              id="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a question about your documents..."
              rows={3}
              className="w-full"
              required
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isAsking || !question.trim()}
              className="min-w-[120px]"
            >
              {isAsking ? "Asking..." : "Ask Question"}
            </Button>
          </div>
        </form>
      </div>

      {/* Q&A Response */}
      {qaResult && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Answer</h3>
          </div>
          <EnhancedQAResponse result={qaResult} />
        </div>
      )}
    </div>
  );
}

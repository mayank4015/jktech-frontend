"use client";

import { useState } from "react";
import { User } from "@/types";
import { DocumentSearchResult, EnhancedQAResult } from "@/types/qa";
import { searchDocuments, askEnhancedQuestion } from "@/app/actions/qa";
import { DocumentSelector } from "./DocumentSelector";
import { DocumentSearchResults } from "./DocumentSearchResults";
import { EnhancedQAResponse } from "./EnhancedQAResponse";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

interface EnhancedQAInterfaceProps {
  user: User | null;
}

export function EnhancedQAInterface({ user: _user }: EnhancedQAInterfaceProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<DocumentSearchResult[]>(
    []
  );
  const [selectedDocument, setSelectedDocument] =
    useState<DocumentSearchResult | null>(null);
  const [question, setQuestion] = useState("");
  const [qaResult, setQaResult] = useState<EnhancedQAResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isAsking, setIsAsking] = useState(false);
  const [activeTab, setActiveTab] = useState<"search" | "ask">("search");

  // Handle document search
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const results = await searchDocuments(searchQuery, 10);
      setSearchResults(results);
      setActiveTab("search");
    } catch (error) {
      console.error("Search failed:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle Q&A
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
      setActiveTab("ask");
    } catch (error) {
      console.error("Q&A failed:", error);
      setQaResult(null);
    } finally {
      setIsAsking(false);
    }
  };

  // Select document from search results
  const handleSelectDocument = (document: DocumentSearchResult) => {
    setSelectedDocument(document);
    setActiveTab("ask");
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Document Status */}
      <DocumentSelector />

      {/* Main Interface */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab("search")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "search"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            🔍 Search Documents
          </button>
          <button
            onClick={() => setActiveTab("ask")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ml-4 ${
              activeTab === "ask"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            💬 Ask Questions
          </button>
        </div>

        {/* Search Tab */}
        {activeTab === "search" && (
          <div className="space-y-6">
            <form onSubmit={handleSearch} className="space-y-4">
              <div>
                <label
                  htmlFor="search"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Search Documents
                </label>
                <div className="flex gap-3">
                  <Input
                    id="search"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for documents..."
                    className="flex-1"
                  />
                  <Button
                    type="submit"
                    disabled={isSearching || !searchQuery.trim()}
                  >
                    {isSearching ? "Searching..." : "Search"}
                  </Button>
                </div>
              </div>
            </form>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Search Results ({searchResults.length})
                </h3>
                <DocumentSearchResults
                  results={searchResults}
                  query={searchQuery}
                  onSelectDocument={handleSelectDocument}
                />
              </div>
            )}

            {searchQuery && searchResults.length === 0 && !isSearching && (
              <div className="text-center py-8">
                <div className="text-gray-400 text-4xl mb-2">🔍</div>
                <p className="text-gray-600">
                  No documents found for &quot;{searchQuery}&quot;
                </p>
              </div>
            )}
          </div>
        )}

        {/* Q&A Tab */}
        {activeTab === "ask" && (
          <div className="space-y-6">
            {/* Selected Document Context */}
            {selectedDocument && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-blue-900">
                      Selected Document: {selectedDocument.documentTitle}
                    </h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Your question will be answered specifically from this
                      document
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedDocument(null)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleAskQuestion} className="space-y-4">
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
                  placeholder={
                    selectedDocument
                      ? `Ask a question about "${selectedDocument.documentTitle}"...`
                      : "Ask a question about your documents..."
                  }
                  rows={4}
                  className="w-full"
                />
              </div>

              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  {selectedDocument ? (
                    <span>✨ Document-specific Q&A</span>
                  ) : (
                    <span>🌐 General knowledge base Q&A</span>
                  )}
                </div>
                <Button type="submit" disabled={isAsking || !question.trim()}>
                  {isAsking ? "Processing..." : "Ask Question"}
                </Button>
              </div>
            </form>

            {/* Q&A Result */}
            {qaResult && (
              <div className="mt-8">
                <div className="bg-blue-50 p-4 rounded-lg mb-6">
                  <h3 className="font-semibold text-blue-900">Question:</h3>
                  <p className="text-blue-800">{question}</p>
                  {selectedDocument && (
                    <p className="text-sm text-blue-600 mt-2">
                      Asked about: {selectedDocument.documentTitle}
                    </p>
                  )}
                </div>
                <EnhancedQAResponse result={qaResult} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

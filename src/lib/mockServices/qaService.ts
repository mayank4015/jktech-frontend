import {
  Question,
  Answer,
  AnswerSource,
  Conversation,
  QASession,
  QAMessage,
  QuestionSuggestion,
  QAFilters,
  QAStats,
  SavedQA,
  QASearchResult,
} from "@/types/qa";
import { PaginatedResponse } from "@/types/common";

// Mock answer sources
const mockSources: AnswerSource[] = [
  {
    documentId: "doc-1",
    documentTitle: "Annual Report 2023.pdf",
    excerpt:
      "The company achieved a 15% increase in revenue compared to the previous year, driven by strong performance in the technology sector.",
    relevanceScore: 0.95,
    pageNumber: 12,
    chunkId: "chunk-1-12",
    startPosition: 245,
    endPosition: 389,
    context: "Financial Performance Overview",
  },
  {
    documentId: "doc-2",
    documentTitle: "Technical Specification.docx",
    excerpt:
      "The system architecture follows a microservices pattern with containerized deployment using Docker and Kubernetes orchestration.",
    relevanceScore: 0.87,
    pageNumber: 5,
    chunkId: "chunk-2-5",
    startPosition: 120,
    endPosition: 267,
    context: "System Architecture",
  },
];

// Mock conversations
const mockConversations: Conversation[] = [
  {
    id: "conv-1",
    title: "Revenue Analysis Discussion",
    userId: "user-1",
    userName: "John Doe",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:30:00Z",
    questionCount: 5,
    lastQuestionAt: "2024-01-15T10:30:00Z",
    isBookmarked: true,
    tags: ["finance", "revenue", "analysis"],
    summary: "Discussion about company revenue trends and growth factors",
  },
  {
    id: "conv-2",
    title: "Technical Architecture Questions",
    userId: "user-2",
    userName: "Jane Smith",
    createdAt: "2024-01-15T11:00:00Z",
    updatedAt: "2024-01-15T11:45:00Z",
    questionCount: 3,
    lastQuestionAt: "2024-01-15T11:45:00Z",
    isBookmarked: false,
    tags: ["technical", "architecture", "microservices"],
    summary: "Questions about system architecture and deployment strategies",
  },
];

// Mock questions and answers
const mockQuestions: Question[] = [
  {
    id: "q-1",
    text: "What was the revenue growth in 2023?",
    createdAt: "2024-01-15T10:00:00Z",
    userId: "user-1",
    userName: "John Doe",
    conversationId: "conv-1",
    metadata: {
      intent: "information_seeking",
      confidence: 0.92,
      suggestedQuestions: [
        "What factors contributed to the revenue growth?",
        "How does this compare to industry averages?",
      ],
    },
  },
  {
    id: "q-2",
    text: "How is the system architecture designed?",
    createdAt: "2024-01-15T11:00:00Z",
    userId: "user-2",
    userName: "Jane Smith",
    conversationId: "conv-2",
    metadata: {
      intent: "technical_inquiry",
      confidence: 0.88,
      suggestedQuestions: [
        "What deployment strategies are used?",
        "How is scalability handled?",
      ],
    },
  },
];

const mockAnswers: Answer[] = [
  {
    id: "a-1",
    questionId: "q-1",
    text: "According to the annual report, the company achieved a 15% increase in revenue in 2023 compared to the previous year. This growth was primarily driven by strong performance in the technology sector and successful expansion into new markets.",
    createdAt: "2024-01-15T10:01:00Z",
    sources: [mockSources[0]],
    confidence: 0.95,
    processingTime: 1200,
    model: "gpt-4-turbo",
    metadata: {
      tokenCount: 156,
      reasoning:
        "High confidence answer based on direct financial data from annual report",
    },
  },
  {
    id: "a-2",
    questionId: "q-2",
    text: "The system follows a microservices architecture pattern with containerized deployment. It uses Docker for containerization and Kubernetes for orchestration, enabling scalable and maintainable service deployment.",
    createdAt: "2024-01-15T11:01:00Z",
    sources: [mockSources[1]],
    confidence: 0.87,
    processingTime: 980,
    model: "gpt-4-turbo",
    metadata: {
      tokenCount: 134,
      reasoning: "Technical answer based on architecture documentation",
    },
  },
];

// Mock question suggestions
const mockSuggestions: QuestionSuggestion[] = [
  {
    id: "sug-1",
    text: "What are the key financial metrics for this quarter?",
    category: "Finance",
    popularity: 85,
    relatedDocuments: ["doc-1", "doc-3"],
  },
  {
    id: "sug-2",
    text: "How do I configure the deployment pipeline?",
    category: "Technical",
    popularity: 72,
    relatedDocuments: ["doc-2", "doc-4"],
  },
  {
    id: "sug-3",
    text: "What are the security best practices?",
    category: "Security",
    popularity: 68,
    relatedDocuments: ["doc-2", "doc-5"],
  },
];

// Mock saved Q&As
const mockSavedQAs: SavedQA[] = [
  {
    id: "saved-1",
    questionId: "q-1",
    answerId: "a-1",
    userId: "user-1",
    savedAt: "2024-01-15T10:05:00Z",
    notes: "Important revenue data for quarterly review",
    tags: ["quarterly-review", "revenue"],
    question: mockQuestions[0],
    answer: mockAnswers[0],
  },
];

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Generate mock QA messages for a conversation
const generateMockMessages = (conversationId: string): QAMessage[] => {
  const conversation = mockConversations.find((c) => c.id === conversationId);
  if (!conversation) return [];

  const messages: QAMessage[] = [];
  const relatedQuestions = mockQuestions.filter(
    (q) => q.conversationId === conversationId
  );

  relatedQuestions.forEach((question) => {
    // Add question message
    messages.push({
      id: `msg-q-${question.id}`,
      type: "question",
      content: question.text,
      timestamp: question.createdAt,
    });

    // Add corresponding answer message
    const answer = mockAnswers.find((a) => a.questionId === question.id);
    if (answer) {
      messages.push({
        id: `msg-a-${answer.id}`,
        type: "answer",
        content: answer.text,
        timestamp: answer.createdAt,
        sources: answer.sources,
        confidence: answer.confidence,
      });
    }
  });

  return messages.sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
};

export const mockQAService = {
  // Ask a question
  askQuestion: async (
    text: string,
    conversationId?: string
  ): Promise<{ question: Question; answer: Answer }> => {
    await delay(1500); // Simulate AI processing time

    // Create new conversation if none provided
    let convId = conversationId;
    if (!convId) {
      convId = `conv-${Date.now()}`;
      const newConversation: Conversation = {
        id: convId,
        title: text.substring(0, 50) + (text.length > 50 ? "..." : ""),
        userId: "current-user",
        userName: "Current User",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        questionCount: 1,
        lastQuestionAt: new Date().toISOString(),
        isBookmarked: false,
        tags: [],
      };
      mockConversations.unshift(newConversation);
    }

    const question: Question = {
      id: `q-${Date.now()}`,
      text,
      createdAt: new Date().toISOString(),
      userId: "current-user",
      userName: "Current User",
      conversationId: convId,
      metadata: {
        intent: "information_seeking",
        confidence: 0.85 + Math.random() * 0.15,
        suggestedQuestions: [
          "Can you provide more details about this topic?",
          "What are the related implications?",
        ],
      },
    };

    const answer: Answer = {
      id: `a-${Date.now()}`,
      questionId: question.id,
      text: `Based on the available documents, here's what I found regarding "${text}". This is a comprehensive answer that addresses your question with relevant information from the knowledge base.`,
      createdAt: new Date(Date.now() + 1000).toISOString(),
      sources: mockSources.slice(0, Math.floor(Math.random() * 2) + 1),
      confidence: 0.8 + Math.random() * 0.2,
      processingTime: 1200 + Math.random() * 800,
      model: "gpt-4-turbo",
      metadata: {
        tokenCount: 120 + Math.floor(Math.random() * 100),
        reasoning:
          "Answer generated based on semantic search through document corpus",
      },
    };

    // Add to mock data
    mockQuestions.push(question);
    mockAnswers.push(answer);

    return { question, answer };
  },

  // Get conversations
  getConversations: async (
    page: number = 1,
    limit: number = 10,
    filters: QAFilters = {}
  ): Promise<PaginatedResponse<Conversation>> => {
    await delay(600);

    let filtered = [...mockConversations];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (conv) =>
          conv.title.toLowerCase().includes(searchLower) ||
          conv.userName.toLowerCase().includes(searchLower) ||
          conv.tags.some((tag) => tag.toLowerCase().includes(searchLower))
      );
    }

    if (filters.userId) {
      filtered = filtered.filter((conv) => conv.userId === filters.userId);
    }

    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter((conv) =>
        filters.tags!.some((tag) => conv.tags.includes(tag))
      );
    }

    // Sort
    filtered.sort((a, b) => {
      const aValue = new Date(a.updatedAt).getTime();
      const bValue = new Date(b.updatedAt).getTime();
      return filters.sortOrder === "asc" ? aValue - bValue : bValue - aValue;
    });

    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const data = filtered.slice(start, start + limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
    };
  },

  // Get conversation with messages
  getConversation: async (id: string): Promise<QASession | null> => {
    await delay(500);

    const conversation = mockConversations.find((c) => c.id === id);
    if (!conversation) return null;

    const messages = generateMockMessages(id);

    return {
      conversation,
      messages,
    };
  },

  // Get question suggestions
  getQuestionSuggestions: async (
    category?: string
  ): Promise<QuestionSuggestion[]> => {
    await delay(400);

    let suggestions = [...mockSuggestions];

    if (category) {
      suggestions = suggestions.filter(
        (s) => s.category.toLowerCase() === category.toLowerCase()
      );
    }

    return suggestions.sort((a, b) => b.popularity - a.popularity);
  },

  // Search Q&As
  searchQAs: async (
    query: string,
    filters: QAFilters = {}
  ): Promise<QASearchResult[]> => {
    await delay(800);

    const results: QASearchResult[] = [];
    const queryLower = query.toLowerCase();

    // Search questions
    mockQuestions.forEach((question) => {
      if (question.text.toLowerCase().includes(queryLower)) {
        results.push({
          type: "question",
          id: question.id,
          title: question.text,
          excerpt: question.text.substring(0, 150) + "...",
          relevanceScore: 0.8 + Math.random() * 0.2,
          createdAt: question.createdAt,
          metadata: {
            userId: question.userId,
            conversationId: question.conversationId,
          },
        });
      }
    });

    // Search answers
    mockAnswers.forEach((answer) => {
      if (answer.text.toLowerCase().includes(queryLower)) {
        const question = mockQuestions.find((q) => q.id === answer.questionId);
        results.push({
          type: "answer",
          id: answer.id,
          title: question?.text || "Answer",
          excerpt: answer.text.substring(0, 150) + "...",
          relevanceScore: answer.confidence,
          createdAt: answer.createdAt,
          metadata: {
            questionId: answer.questionId,
            confidence: answer.confidence,
          },
        });
      }
    });

    return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
  },

  // Get saved Q&As
  getSavedQAs: async (
    page: number = 1,
    limit: number = 10,
    filters: QAFilters = {}
  ): Promise<PaginatedResponse<SavedQA>> => {
    await delay(600);

    let filtered = [...mockSavedQAs];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (saved) =>
          saved.question.text.toLowerCase().includes(searchLower) ||
          saved.answer.text.toLowerCase().includes(searchLower) ||
          saved.notes?.toLowerCase().includes(searchLower)
      );
    }

    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter((saved) =>
        filters.tags!.some((tag) => saved.tags.includes(tag))
      );
    }

    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const data = filtered.slice(start, start + limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
    };
  },

  // Save Q&A
  saveQA: async (
    questionId: string,
    answerId: string,
    notes?: string,
    tags: string[] = []
  ): Promise<SavedQA> => {
    await delay(500);

    const question = mockQuestions.find((q) => q.id === questionId);
    const answer = mockAnswers.find((a) => a.id === answerId);

    if (!question || !answer) {
      throw new Error("Question or answer not found");
    }

    const savedQA: SavedQA = {
      id: `saved-${Date.now()}`,
      questionId,
      answerId,
      userId: "current-user",
      savedAt: new Date().toISOString(),
      notes,
      tags,
      question,
      answer,
    };

    mockSavedQAs.push(savedQA);
    return savedQA;
  },

  // Get Q&A statistics
  getQAStats: async (): Promise<QAStats> => {
    await delay(500);

    const totalQuestions = mockQuestions.length;
    const totalConversations = mockConversations.length;
    const averageConfidence =
      mockAnswers.reduce((sum, a) => sum + a.confidence, 0) /
      mockAnswers.length;
    const averageResponseTime =
      mockAnswers.reduce((sum, a) => sum + a.processingTime, 0) /
      mockAnswers.length;

    const topCategories = [
      { category: "Finance", count: 15 },
      { category: "Technical", count: 12 },
      { category: "Security", count: 8 },
      { category: "Operations", count: 6 },
    ];

    const recentActivity = [
      { date: "2024-01-15", questionCount: 8 },
      { date: "2024-01-14", questionCount: 12 },
      { date: "2024-01-13", questionCount: 6 },
      { date: "2024-01-12", questionCount: 15 },
      { date: "2024-01-11", questionCount: 9 },
    ];

    return {
      totalQuestions,
      totalConversations,
      averageConfidence: Math.round(averageConfidence * 100) / 100,
      averageResponseTime: Math.round(averageResponseTime),
      topCategories,
      recentActivity,
    };
  },

  // Delete conversation
  deleteConversation: async (id: string): Promise<void> => {
    await delay(400);

    const index = mockConversations.findIndex((c) => c.id === id);
    if (index === -1) {
      throw new Error("Conversation not found");
    }

    mockConversations.splice(index, 1);
  },

  // Update conversation
  updateConversation: async (
    id: string,
    updates: Partial<Conversation>
  ): Promise<Conversation> => {
    await delay(500);

    const conversation = mockConversations.find((c) => c.id === id);
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    Object.assign(conversation, updates, {
      updatedAt: new Date().toISOString(),
    });
    return conversation;
  },
};

// Service factory
export const getQAService = () => {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") {
    return mockQAService;
  }

  // In Phase 2, we'll implement the real service
  return mockQAService;
};

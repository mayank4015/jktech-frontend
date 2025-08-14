export interface Question {
  id: string;
  text: string;
  createdAt: string;
  userId: string;
  userName: string;
  conversationId: string;
  metadata?: {
    intent?: string;
    confidence?: number;
    suggestedQuestions?: string[];
  };
}

export interface Answer {
  id: string;
  questionId: string;
  text: string;
  createdAt: string;
  sources: AnswerSource[];
  confidence: number;
  processingTime: number;
  model?: string;
  metadata?: {
    tokenCount?: number;
    reasoning?: string;
  };
}

export interface AnswerSource {
  documentId: string;
  documentTitle: string;
  excerpt: string;
  relevanceScore: number;
  pageNumber?: number;
  chunkId?: string;
  startPosition?: number;
  endPosition?: number;
  context?: string;
}

export interface Conversation {
  id: string;
  title: string;
  userId: string;
  userName: string;
  createdAt: string;
  updatedAt: string;
  questionCount: number;
  lastQuestionAt: string;
  isBookmarked: boolean;
  tags: string[];
  summary?: string;
}

export interface ConversationWithQuestions extends Conversation {
  questions: (Question & { answer?: Answer })[];
}

export interface QASession {
  conversation: Conversation;
  messages: QAMessage[];
}

export interface QAMessage {
  id: string;
  type: "question" | "answer";
  content: string;
  timestamp: string;
  sources?: AnswerSource[];
  confidence?: number;
  isLoading?: boolean;
  error?: string;
}

export interface QuestionSuggestion {
  id: string;
  text: string;
  category: string;
  popularity: number;
  relatedDocuments: string[];
}

export interface QAFilters {
  search?: string;
  userId?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  dateStart?: string;
  dateEnd?: string;
  isBookmarked?: boolean;
  hasAnswers?: boolean;
  minConfidence?: number;
  documentIds?: string[];
  tags?: string[];
  sortBy?: "createdAt" | "confidence" | "relevance" | "popularity";
  sortOrder?: "asc" | "desc";
}

export interface QAStats {
  totalQuestions: number;
  totalAnswers: number;
  totalConversations: number;
  totalSavedQAs: number;
  averageConfidence: number;
  popularTopics: Array<{
    topic: string;
    count: number;
  }>;
  recentActivity: Array<{
    date: string;
    questionCount: number;
  }>;
}

export interface SavedQA {
  id: string;
  questionId: string;
  answerId: string;
  userId: string;
  savedAt: string;
  notes?: string;
  tags: string[];
  question: Question;
  answer: Answer;
}

export interface SavedQAFilters extends Omit<QAFilters, "sortBy"> {
  sortBy?: "createdAt" | "confidence" | "relevance" | "popularity" | "savedAt";
}

export interface QASearchResult {
  type: "question" | "answer" | "document";
  id: string;
  title: string;
  excerpt: string;
  relevanceScore: number;
  createdAt: string;
  metadata?: Record<string, any>;
}

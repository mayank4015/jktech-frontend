import {
  Question,
  Answer,
  Conversation,
  QAFilters,
  QAStats,
  QASearchResult,
} from "@/types/qa";
import { PaginatedResponse } from "@/types/common";
import * as qaActions from "@/app/actions/qa";

/**
 * Real QA service that connects to the backend API
 */
export class QAService {
  /**
   * Ask a question and get an AI-generated answer
   */
  async askQuestion(
    text: string,
    conversationId?: string
  ): Promise<{ question: Question; answer: Answer }> {
    const result = await qaActions.askQuestion(text, conversationId);
    return {
      question: result.question,
      answer: result.question.answer,
    };
  }

  /**
   * Get paginated list of conversations
   */
  async getConversations(
    page: number = 1,
    limit: number = 10,
    filters: QAFilters = {}
  ): Promise<PaginatedResponse<Conversation>> {
    return qaActions.getConversations(page, limit, filters);
  }

  /**
   * Get Q&A statistics
   */
  async getQAStats(): Promise<QAStats> {
    return qaActions.getQAStats();
  }

  /**
   * Search through Q&As
   */
  async searchQAs(
    query: string,
    filters: QAFilters = {}
  ): Promise<QASearchResult[]> {
    return qaActions.searchQAs(query, filters);
  }
}

/**
 * Get QA service instance based on configuration
 */
export function getQAService(): QAService {
  return new QAService();
}

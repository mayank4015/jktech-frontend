import {
  Question,
  Answer,
  Conversation,
  ConversationWithQuestions,
  SavedQA,
  QAFilters,
  QAStats,
  QuestionSuggestion,
  QASearchResult,
  QASession,
  QAMessage,
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
   * Create a new conversation
   */
  async createConversation(title: string): Promise<Conversation> {
    return qaActions.createConversation(title);
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
   * Get a specific conversation with its questions and answers
   */
  async getConversation(id: string): Promise<QASession | null> {
    try {
      const conversationWithQuestions = await qaActions.getConversation(id);

      // Transform the conversation data to QASession format
      const messages: QAMessage[] = [];

      if (conversationWithQuestions.questions) {
        conversationWithQuestions.questions.forEach((question) => {
          // Add question message
          messages.push({
            id: `msg-q-${question.id}`,
            type: "question",
            content: question.text,
            timestamp: question.createdAt,
          });

          // Add answer message if exists
          if (question.answer) {
            messages.push({
              id: `msg-a-${question.answer.id}`,
              type: "answer",
              content: question.answer.text,
              timestamp: question.answer.createdAt,
              sources: question.answer.sources,
              confidence: question.answer.confidence,
            });
          }
        });
      }

      // Sort messages by timestamp
      messages.sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );

      // Extract the base conversation data (without questions) for the QASession
      const { questions, ...conversation } = conversationWithQuestions;

      return {
        conversation,
        messages,
      };
    } catch (error) {
      console.error("Failed to get conversation:", error);
      return null;
    }
  }

  /**
   * Update a conversation
   */
  async updateConversation(
    id: string,
    updates: Partial<Conversation>
  ): Promise<Conversation> {
    return qaActions.updateConversation(id, updates);
  }

  /**
   * Delete a conversation
   */
  async deleteConversation(id: string): Promise<void> {
    return qaActions.deleteConversation(id);
  }

  /**
   * Save a Q&A pair for future reference
   */
  async saveQA(
    questionId: string,
    answerId: string,
    notes?: string,
    tags?: string[]
  ): Promise<SavedQA> {
    return qaActions.saveQA(questionId, answerId, notes, tags);
  }

  /**
   * Get paginated list of saved Q&As
   */
  async getSavedQAs(
    page: number = 1,
    limit: number = 10,
    filters: QAFilters = {}
  ): Promise<PaginatedResponse<SavedQA>> {
    return qaActions.getSavedQAs(page, limit, filters);
  }

  /**
   * Delete a saved Q&A
   */
  async deleteSavedQA(id: string): Promise<void> {
    return qaActions.deleteSavedQA(id);
  }

  /**
   * Get Q&A statistics
   */
  async getQAStats(): Promise<QAStats> {
    return qaActions.getQAStats();
  }

  /**
   * Get question suggestions
   */
  async getQuestionSuggestions(
    category?: string
  ): Promise<QuestionSuggestion[]> {
    return qaActions.getQuestionSuggestions(category);
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

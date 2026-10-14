import type { CareerAnalysisInput, AICareerAnalysisResult, ChatMessage } from '../types/aiCareer';


/**
 * AI Service Interface Contract
 * Enables switching between MockAIProvider and BackendAIProvider in future phases
 * without modifying React components or page layouts.
 */
export interface AIService {
  analyzeCareer(input: CareerAnalysisInput): Promise<AICareerAnalysisResult>;
  sendCareerChatMessage(input: CareerAnalysisInput, userQuery: string, history: ChatMessage[]): Promise<string>;
}

/**
 * Mock AI Provider
 * Simulates a realistic network delay (500ms - 1000ms) and returns structured analysis
 * and chat responses derived from normalized student performance metrics.
 */


// Active AI Service Instance (MockAIProvider for current frontend-only development phase)
// Backend provider that forwards requests to the Express API endpoints.
class BackendAIProvider implements AIService {
  private readonly basePath = '/api/ai/career';

  async analyzeCareer(input: CareerAnalysisInput): Promise<AICareerAnalysisResult> {
    const response = await fetch(`${this.basePath}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(input),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error?.message ?? 'Failed to analyze career');
    }
    const data = await response.json();
    return data?.data as AICareerAnalysisResult;
  }

  async sendCareerChatMessage(input: CareerAnalysisInput, userQuery: string, history: ChatMessage[]): Promise<string> {
    const response = await fetch(`${this.basePath}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ input, userQuery, history }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error?.message ?? 'Failed to chat with career assistant');
    }
    const data = await response.json();
    return data?.data as string;
  }
}

const activeAIService: AIService = new BackendAIProvider();

export const requestAICareerAnalysis = (input: CareerAnalysisInput): Promise<AICareerAnalysisResult> => {
  return activeAIService.analyzeCareer(input);
};

export const sendAICareerMessage = (
  input: CareerAnalysisInput,
  userQuery: string,
  history: ChatMessage[]
): Promise<string> => {
  return activeAIService.sendCareerChatMessage(input, userQuery, history);
};
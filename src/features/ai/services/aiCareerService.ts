import type { CareerAnalysisInput, AICareerAnalysisResult, ChatMessage } from '../types/aiCareer';
import { fallbackMockCareerAnalysis } from '../data/mockCareerData';

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
class MockAIProvider implements AIService {
  async analyzeCareer(input: CareerAnalysisInput): Promise<AICareerAnalysisResult> {
    // Simulate natural AI network latency (700ms)
    await new Promise((resolve) => setTimeout(resolve, 700));

    // Dynamically tailor mock summary based on student inputs
    const studentName = input.student.name || 'Alex';
    const targetCareer = input.student.targetCareer || 'Software Engineer';
    const role = input.internship.role || 'Frontend Intern';
    const company = input.internship.company || 'TechCorp Solutions';

    const summary = `${studentName} demonstrates strong technical capabilities as a ${role} at ${company}. Performance metrics show consistent attendance (${input.performance.attendancePercentage}%) and strong problem-solving capabilities (${input.evaluations.problemSolvingScore}/10). To accelerate readiness for a target ${targetCareer} position, focus on backend API integrations and automated testing practices.`;

    return {
      ...fallbackMockCareerAnalysis,
      summary,
      timestamp: new Date().toLocaleTimeString(),
      isDemo: true,
    };
  }

  async sendCareerChatMessage(input: CareerAnalysisInput, userQuery: string, history: ChatMessage[]): Promise<string> {
    // Simulate natural response latency (600ms)
    await new Promise((resolve) => setTimeout(resolve, 600));

    const queryLower = userQuery.toLowerCase();
    const studentName = input.student.name || 'Alex';
    const targetCareer = input.student.targetCareer || 'Software Developer';
    const topSkills = input.skills.technical.slice(0, 3).join(', ');

    if (queryLower.includes('career') || queryLower.includes('choose') || queryLower.includes('role')) {
      return `Hi ${studentName}! Based on your current proficiency in ${topSkills} and high problem-solving evaluation score (${input.evaluations.problemSolvingScore}/10), a ${targetCareer} or Frontend Engineer path is an excellent fit for your profile.`;
    }

    if (queryLower.includes('skill') || queryLower.includes('improve') || queryLower.includes('learn') || queryLower.includes('next')) {
      return `To advance your readiness beyond your current ${input.performance.taskCompletionPercentage}% task completion rate, I recommend focusing on Node.js/Express backend APIs, PostgreSQL database design, and automated testing with Jest.`;
    }

    if (queryLower.includes('internship') || queryLower.includes('ready') || queryLower.includes('placement') || queryLower.includes('prepare')) {
      return `Your overall internship readiness is strong! With an attendance rate of ${input.performance.attendancePercentage}% and mentor satisfaction rating of ${input.performance.mentorEvaluationScore}/10, you are well-prepared. Keep building full-stack projects to strengthen your resume portfolio.`;
    }

    return `Great question! Continuing to build end-to-end applications combining ${topSkills} with backend REST APIs will strengthen your competitive edge for ${targetCareer} opportunities.`;
  }
}

// Active AI Service Instance (MockAIProvider for current frontend-only development phase)
const activeAIService: AIService = new MockAIProvider();

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
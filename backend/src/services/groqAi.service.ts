import { Groq } from 'groq-sdk';
import { env } from '../config/env';
import { AppError } from '../middleware/errorHandler';

// ─────────────────────────────────────────────────────────────────────────────
// Types matching frontend AICareerAnalysisResult and CareerAnalysisInput
// ─────────────────────────────────────────────────────────────────────────────

export interface SkillGapItem {
  skill: string;
  importance: 'High' | 'Medium' | 'Low';
  reason: string;
}

export interface CareerRecommendationItem {
  career: string;
  fit: 'High Fit' | 'Moderate Fit' | 'Potential Match';
  reason: string;
}

export interface LearningRecommendationItem {
  topic: string;
  priority: 'High' | 'Medium' | 'Low';
  reason: string;
}

export interface AICareerAnalysisResult {
  summary: string;
  strengths: string[];
  improvementAreas: string[];
  skillGaps: SkillGapItem[];
  careerRecommendations: CareerRecommendationItem[];
  learningRecommendations: LearningRecommendationItem[];
  nextSteps: string[];
  timestamp?: string;
  isDemo?: boolean;
}

export interface CareerAnalysisInput {
  student: {
    name: string;
    education: string;
    targetCareer?: string;
  };
  skills: {
    technical: string[];
    tools: string[];
    languages: string[];
  };
  internship: {
    role: string;
    company: string;
    workMode: string;
    duration: string;
  };
  performance: {
    attendancePercentage: number;
    taskCompletionPercentage: number;
    milestoneCompletionPercentage: number;
    mentorEvaluationScore: number;
    totalHoursLogged: number;
  };
  milestones: {
    completedCount: number;
    totalCount: number;
    currentMilestoneTitle?: string;
  };
  evaluations: {
    technicalSkillsScore: number;
    problemSolvingScore: number;
    communicationScore: number;
    professionalismScore: number;
    mentorFeedback: string;
    strengths: string[];
    improvementAreas: string[];
  };
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Groq Client Initialization
// ─────────────────────────────────────────────────────────────────────────────

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || env.GROQ_API_KEY || '',
});

/**
 * Strips markdown code fences (```json ... ``` or ``` ... ```)
 * and extracts the outermost JSON object substring.
 */
function cleanAndExtractJson(rawContent: string): string {
  let text = rawContent.trim();

  // 1. If surrounded or preceded by markdown code fences
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (codeBlockMatch && codeBlockMatch[1]) {
    text = codeBlockMatch[1].trim();
  }

  // 2. Extract content from the first '{' to the last '}'
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    text = text.substring(firstBrace, lastBrace + 1);
  }

  return text;
}

/**
 * Safely parses the cleaned JSON string.
 * Retries with trailing-comma cleanup if standard JSON.parse fails.
 */
function parseJsonSafely(rawContent: string): unknown {
  if (!rawContent || !rawContent.trim()) {
    throw new AppError(502, 'AI service returned an empty response');
  }

  const cleaned = cleanAndExtractJson(rawContent);

  try {
    return JSON.parse(cleaned);
  } catch (primaryErr) {
    // Attempt secondary parse after stripping trailing commas before closing braces/brackets
    try {
      const sanitized = cleaned.replace(/,\s*([}\]])/g, '$1');
      return JSON.parse(sanitized);
    } catch {
      const errMsg = primaryErr instanceof Error ? primaryErr.message : String(primaryErr);
      throw new AppError(502, `Failed to parse AI response as valid JSON: ${errMsg}`);
    }
  }
}

/**
 * Sanitizes the summary field, stripping any nested code fences or JSON structures.
 */
function sanitizeSummaryText(summary: string): string {
  let text = summary.trim();

  // If summary itself contains a markdown code block (e.g. ```json ... ```)
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (codeBlockMatch && codeBlockMatch[1]) {
    const inside = codeBlockMatch[1].trim();
    if (inside.startsWith('{') && inside.endsWith('}')) {
      try {
        const parsed = JSON.parse(inside);
        if (typeof parsed.summary === 'string' && parsed.summary.trim()) {
          return sanitizeSummaryText(parsed.summary.trim());
        }
      } catch {
        // Not JSON
      }
    }
    text = inside;
  }

  // If summary is a raw JSON string e.g. {"summary": "..."}
  if (text.startsWith('{') && text.endsWith('}')) {
    try {
      const parsed = JSON.parse(text);
      if (typeof parsed.summary === 'string' && parsed.summary.trim()) {
        return sanitizeSummaryText(parsed.summary.trim());
      }
    } catch {
      // Continue
    }
  }

  // Strip any remaining code fence artifacts and markdown tags
  return text.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();
}

/**
 * Validates and normalizes the parsed JSON object against AICareerAnalysisResult schema.
 * Throws AppError(502) if required fields are missing or have invalid types.
 */
function validateCareerAnalysisResult(data: unknown): AICareerAnalysisResult {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new AppError(502, 'AI response is not a valid JSON object');
  }

  const obj = data as Record<string, unknown>;

  // 1. Validate summary
  if (typeof obj.summary !== 'string' || !obj.summary.trim()) {
    throw new AppError(502, 'AI response is missing a valid "summary" string');
  }
  const cleanedSummary = sanitizeSummaryText(obj.summary);
  if (!cleanedSummary) {
    throw new AppError(502, 'AI response is missing a valid "summary" text');
  }

  // 2. Validate strengths
  if (!Array.isArray(obj.strengths) || obj.strengths.length === 0) {
    throw new AppError(502, 'AI response is missing valid "strengths" array');
  }
  const strengths = obj.strengths
    .filter((s): s is string => typeof s === 'string' && s.trim().length > 0)
    .map(s => s.trim());
  if (strengths.length === 0) {
    throw new AppError(502, 'AI response "strengths" contains no valid text items');
  }

  // 3. Validate improvementAreas
  if (!Array.isArray(obj.improvementAreas) || obj.improvementAreas.length === 0) {
    throw new AppError(502, 'AI response is missing valid "improvementAreas" array');
  }
  const improvementAreas = obj.improvementAreas
    .filter((s): s is string => typeof s === 'string' && s.trim().length > 0)
    .map(s => s.trim());
  if (improvementAreas.length === 0) {
    throw new AppError(502, 'AI response "improvementAreas" contains no valid text items');
  }

  // 4. Validate skillGaps
  if (!Array.isArray(obj.skillGaps) || obj.skillGaps.length === 0) {
    throw new AppError(502, 'AI response is missing valid "skillGaps" array');
  }
  const skillGaps: SkillGapItem[] = obj.skillGaps.map((item, idx) => {
    if (!item || typeof item !== 'object') {
      throw new AppError(502, `Invalid skillGap item at index ${idx}`);
    }
    const sg = item as Record<string, unknown>;
    const skill = typeof sg.skill === 'string' ? sg.skill.trim() : '';
    if (!skill) {
      throw new AppError(502, `Skill gap at index ${idx} is missing a skill name`);
    }

    let importance: 'High' | 'Medium' | 'Low' = 'Medium';
    if (typeof sg.importance === 'string') {
      const imp = sg.importance.trim().toLowerCase();
      if (imp.startsWith('h')) importance = 'High';
      else if (imp.startsWith('l')) importance = 'Low';
      else importance = 'Medium';
    }

    const reason =
      typeof sg.reason === 'string' && sg.reason.trim()
        ? sg.reason.trim()
        : `Proficiency in ${skill} is recommended for targeted role advancement.`;

    return { skill, importance, reason };
  });

  // 5. Validate careerRecommendations
  if (!Array.isArray(obj.careerRecommendations) || obj.careerRecommendations.length === 0) {
    throw new AppError(502, 'AI response is missing valid "careerRecommendations" array');
  }
  const careerRecommendations: CareerRecommendationItem[] = obj.careerRecommendations.map((item, idx) => {
    if (!item || typeof item !== 'object') {
      throw new AppError(502, `Invalid careerRecommendation item at index ${idx}`);
    }
    const cr = item as Record<string, unknown>;
    const career = typeof cr.career === 'string' ? cr.career.trim() : '';
    if (!career) {
      throw new AppError(502, `Career recommendation at index ${idx} is missing a role title`);
    }

    let fit: 'High Fit' | 'Moderate Fit' | 'Potential Match' = 'High Fit';
    if (typeof cr.fit === 'string') {
      const fitLower = cr.fit.trim().toLowerCase();
      if (fitLower.includes('mod')) fit = 'Moderate Fit';
      else if (fitLower.includes('pot')) fit = 'Potential Match';
      else fit = 'High Fit';
    }

    const reason =
      typeof cr.reason === 'string' && cr.reason.trim()
        ? cr.reason.trim()
        : `Recommended career path aligned with current technical profile.`;

    return { career, fit, reason };
  });

  // 6. Validate learningRecommendations
  if (!Array.isArray(obj.learningRecommendations) || obj.learningRecommendations.length === 0) {
    throw new AppError(502, 'AI response is missing valid "learningRecommendations" array');
  }
  const learningRecommendations: LearningRecommendationItem[] = obj.learningRecommendations.map((item, idx) => {
    if (!item || typeof item !== 'object') {
      throw new AppError(502, `Invalid learningRecommendation item at index ${idx}`);
    }
    const lr = item as Record<string, unknown>;
    const topic = typeof lr.topic === 'string' ? lr.topic.trim() : '';
    if (!topic) {
      throw new AppError(502, `Learning recommendation at index ${idx} is missing a topic`);
    }

    let priority: 'High' | 'Medium' | 'Low' = 'High';
    if (typeof lr.priority === 'string') {
      const pLower = lr.priority.trim().toLowerCase();
      if (pLower.startsWith('l')) priority = 'Low';
      else if (pLower.startsWith('m')) priority = 'Medium';
      else priority = 'High';
    }

    const reason =
      typeof lr.reason === 'string' && lr.reason.trim()
        ? lr.reason.trim()
        : `Topic recommended to bridge competency gaps.`;

    return { topic, priority, reason };
  });

  // 7. Validate nextSteps
  if (!Array.isArray(obj.nextSteps) || obj.nextSteps.length === 0) {
    throw new AppError(502, 'AI response is missing valid "nextSteps" array');
  }
  const nextSteps = obj.nextSteps
    .filter((s): s is string => typeof s === 'string' && s.trim().length > 0)
    .map(s => s.trim());
  if (nextSteps.length === 0) {
    throw new AppError(502, 'AI response "nextSteps" contains no valid text items');
  }

  return {
    summary: cleanedSummary,
    strengths,
    improvementAreas,
    skillGaps,
    careerRecommendations,
    learningRecommendations,
    nextSteps,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    isDemo: false,
  };
}

/** Helper to build a comprehensive prompt for career analysis */
function buildAnalysisPrompt(input: CareerAnalysisInput): string {
  const { student, internship, performance, milestones, evaluations, skills } = input;

  const technicalSkills = skills?.technical?.length ? skills.technical.join(', ') : 'Not specified';
  const tools = skills?.tools?.length ? skills.tools.join(', ') : 'Not specified';
  const languages = skills?.languages?.length ? skills.languages.join(', ') : 'Not specified';

  const strengthsList = evaluations?.strengths?.length ? evaluations.strengths.join('; ') : 'None recorded';
  const improvementsList = evaluations?.improvementAreas?.length ? evaluations.improvementAreas.join('; ') : 'None recorded';

  return `You are an AI career advisor. Evaluate the following authenticated student's internship performance and profile to generate a structured career intelligence report.

STUDENT PROFILE:
- Name: ${student.name}
- Education: ${student.education}
- Target Career Goal: ${student.targetCareer || 'Software Engineering / Tech Professional'}

INTERNSHIP CONTEXT:
- Role: ${internship.role}
- Company: ${internship.company}
- Work Mode: ${internship.workMode}
- Duration: ${internship.duration}

PERFORMANCE METRICS:
- Attendance: ${performance.attendancePercentage}%
- Task Completion: ${performance.taskCompletionPercentage}%
- Milestone Completion: ${performance.milestoneCompletionPercentage}%
- Mentor Evaluation Score: ${performance.mentorEvaluationScore}/10
- Total Hours Logged: ${performance.totalHoursLogged} hours
- Milestones: ${milestones?.completedCount ?? 0} of ${milestones?.totalCount ?? 0} completed (Current: ${milestones?.currentMilestoneTitle || 'In progress'})

TECHNICAL & SOFT SKILLS:
- Technical Skills: ${technicalSkills}
- Tools & Technologies: ${tools}
- Languages: ${languages}

MENTOR EVALUATIONS & FEEDBACK:
- Technical Skills Score: ${evaluations.technicalSkillsScore}/10
- Problem Solving Score: ${evaluations.problemSolvingScore}/10
- Communication Score: ${evaluations.communicationScore}/10
- Professionalism Score: ${evaluations.professionalismScore}/10
- Mentor Feedback: "${evaluations.mentorFeedback || 'Consistently contributing to team objectives.'}"
- Mentor Observed Strengths: ${strengthsList}
- Mentor Observed Improvement Areas: ${improvementsList}

OUTPUT REQUIREMENTS:
Respond with a SINGLE JSON object matching this exact structure:
{
  "summary": "A 2-4 sentence executive performance assessment evaluating the student's internship progress, work ethic, and readiness for full-time roles.",
  "strengths": [
    "Specific core strength 1 based on actual metrics and performance",
    "Specific core strength 2",
    "Specific core strength 3"
  ],
  "improvementAreas": [
    "Specific technical or professional area for growth 1",
    "Specific technical or professional area for growth 2",
    "Specific technical or professional area for growth 3"
  ],
  "skillGaps": [
    {
      "skill": "Skill or technology name",
      "importance": "High",
      "reason": "Detailed explanation of why this skill is needed for career advancement"
    }
  ],
  "careerRecommendations": [
    {
      "career": "Target job title",
      "fit": "High Fit",
      "reason": "Explanation connecting student's skills and performance to this role"
    }
  ],
  "learningRecommendations": [
    {
      "topic": "Recommended learning topic or technology",
      "priority": "High",
      "reason": "Explanation of how mastering this topic bridges identified skill gaps"
    }
  ],
  "nextSteps": [
    "Concrete actionable immediate step 1",
    "Concrete actionable immediate step 2",
    "Concrete actionable immediate step 3"
  ]
}

ALLOWED VALUES:
- For "importance": ONLY "High", "Medium", or "Low"
- For "fit": ONLY "High Fit", "Moderate Fit", or "Potential Match"
- For "priority": ONLY "High", "Medium", or "Low"

Do NOT include any markdown code blocks, prefixes, or commentary outside of the JSON object. Return strictly raw JSON.`;
}

/** Helper to build a chat prompt */
function buildChatPrompt(input: CareerAnalysisInput, userQuery: string, history: ChatMessage[]): string {
  const previous = history.map(m => `${m.sender === 'assistant' ? 'Assistant' : 'User'}: ${m.text}`).join('\n');
  return `You are an AI career assistant. Use the following conversation history and the student's profile to answer the user's question.

Student Profile: ${JSON.stringify(input)}

Conversation History:\n${previous}\n
User: ${userQuery}\n
Respond with a concise plain text answer.`;
}

export async function analyzeCareer(input: CareerAnalysisInput): Promise<AICareerAnalysisResult> {
  const apiKey = process.env.GROQ_API_KEY || env.GROQ_API_KEY || '';
  if (!apiKey) {
    throw new AppError(500, 'GROQ_API_KEY is not configured on the server');
  }

  const model = process.env.GROQ_MODEL || env.GROQ_MODEL || 'openai/gpt-oss-120b';
  const prompt = buildAnalysisPrompt(input);

  let rawContent = '';
  try {
    let response;
    try {
      response = await groq.chat.completions.create({
        model,
        messages: [
          {
            role: 'system',
            content:
              'You are an expert AI career analyst. You analyze student internship performance and return structured career intelligence. You must respond with a valid JSON object only.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.5,
        response_format: { type: 'json_object' },
      });
    } catch (apiError: any) {
      const errorMsg = apiError?.message || apiError?.error?.message || '';
      // If the model does not support response_format: { type: 'json_object' }, retry without response_format
      if (apiError?.status === 400 && errorMsg.toLowerCase().includes('response_format')) {
        response = await groq.chat.completions.create({
          model,
          messages: [
            {
              role: 'system',
              content:
                'You are an expert AI career analyst. You analyze student internship performance and return structured career intelligence. You must respond with a valid JSON object only.',
            },
            { role: 'user', content: prompt },
          ],
          temperature: 0.5,
        });
      } else {
        throw apiError;
      }
    }

    rawContent = response.choices[0]?.message?.content?.trim() ?? '';
  } catch (err: any) {
    if (err instanceof AppError) {
      throw err;
    }
    const message = err?.message || 'Failed to communicate with Groq AI service';
    throw new AppError(502, `AI service error: ${message}`);
  }

  if (!rawContent) {
    throw new AppError(502, 'AI service returned an empty response');
  }

  const parsed = parseJsonSafely(rawContent);
  const validatedResult = validateCareerAnalysisResult(parsed);

  return validatedResult;
}

export async function chatCareer(
  input: CareerAnalysisInput,
  userQuery: string,
  history: ChatMessage[]
): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY || env.GROQ_API_KEY || '';
  if (!apiKey) {
    throw new AppError(500, 'GROQ_API_KEY is not configured on the server');
  }

  const model = process.env.GROQ_MODEL || env.GROQ_MODEL || 'openai/gpt-oss-120b';
  const prompt = buildChatPrompt(input, userQuery, history);

  try {
    const response = await groq.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: 'You are an AI career assistant providing helpful guidance to students.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
    });
    return response.choices[0]?.message?.content?.trim() ?? '';
  } catch (err: any) {
    if (err instanceof AppError) {
      throw err;
    }
    const message = err?.message || 'Failed to chat with AI assistant';
    throw new AppError(502, `AI chat service error: ${message}`);
  }
}

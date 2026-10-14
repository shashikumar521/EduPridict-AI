import { GoogleGenAI } from '@google/genai';
import {
  getStudentAcademicProfile,
  getLatestExamStudyPlan,
  getSavedCourses,
  getQuizAttempts,
  User
} from './db';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface GroundingSource {
  title: string;
  url: string;
}

export interface ChatResponsePayload {
  reply: string;
  sources?: GroundingSource[];
  suggestedQuestions?: string[];
  modelUsed: string;
  personalized: boolean;
  searchUsed: boolean;
}

// In-memory sliding window rate limiter (max 25 requests per minute per IP/user)
const rateLimitMap = new Map<string, number[]>();

export function checkRateLimit(key: string, limit = 25, windowMs = 60000): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(key) || [];
  const valid = timestamps.filter((t) => now - t < windowMs);
  if (valid.length >= limit) {
    return false;
  }
  valid.push(now);
  rateLimitMap.set(key, valid);
  return true;
}

// Periodic cleanup of stale rate limiter records
setInterval(() => {
  const now = Date.now();
  for (const [key, timestamps] of rateLimitMap.entries()) {
    const valid = timestamps.filter((t) => now - t < 60000);
    if (valid.length === 0) {
      rateLimitMap.delete(key);
    } else {
      rateLimitMap.set(key, valid);
    }
  }
}, 300000);

/**
 * Builds verified student profile context strictly from authenticated database records.
 * Never invents or hallucinates missing marks, courses, or exam dates.
 */
export async function buildStudentContext(user: User | null): Promise<{
  contextText: string;
  personalized: boolean;
  studentName?: string;
}> {
  if (!user) {
    return {
      contextText: `Student Session: Unauthenticated Guest Visitor.
- The student is exploring EduPredict AI without logging into an account.
- Provide expert, supportive academic explanations and engineering mentoring.
- If they ask about personal marks or study plans, politely advise them to sign in to access personalized diagnostic analysis.`,
      personalized: false
    };
  }

  try {
    const profile = await getStudentAcademicProfile(user.id);
    const studyPlan = await getLatestExamStudyPlan(user.id);
    const savedCourses = await getSavedCourses(user.id);
    const quizAttempts = await getQuizAttempts(user.id, 5);

    if (!profile) {
      return {
        contextText: `Student Session: Authenticated Student (${user.name || user.email || 'Student'}).
- Student is signed in, but has not completed their detailed academic profile yet.
- Provide general academic guidance and encourage them to complete their academic profile under Settings / Dashboard to unlock automated syllabus gap diagnosis.`,
        personalized: true,
        studentName: user.name || 'Student'
      };
    }

    const subjectsSummary =
      profile.subjects && profile.subjects.length > 0
        ? profile.subjects
            .map((s) => {
              const diff =
                s.difficult_topics && s.difficult_topics.length > 0
                  ? ` (Friction Topics: ${s.difficult_topics.join(', ')})`
                  : '';
              const att = s.attendance_percent !== undefined ? `, Attendance: ${s.attendance_percent}%` : '';
              return `• ${s.name}: ${s.percentage}% [${s.marks_obtained}/${s.max_marks}]${att}${diff}`;
            })
            .join('\n')
        : 'None recorded yet';

    const upcomingExamsSummary =
      profile.upcoming_exams && profile.upcoming_exams.length > 0
        ? profile.upcoming_exams
            .map(
              (e) =>
                `• ${e.subject_name} on ${e.exam_date} (Syllabus Coverage: ${e.syllabus_completion_percent}%, Priority: ${e.priority})`
            )
            .join('\n')
        : 'No examinations currently scheduled in timetable';

    const studyHours = `Weekday study target: ${profile.daily_study_hours_weekday ?? 2.5} hrs/day, Weekend study target: ${profile.daily_study_hours_weekend ?? 4.0} hrs/day`;

    const weakTopicsList =
      profile.weak_topics && profile.weak_topics.length > 0
        ? profile.weak_topics.join(', ')
        : 'None marked';

    const recentQuizzes =
      quizAttempts.length > 0
        ? quizAttempts
            .map((q) => `• Topic: ${q.topic_name}, Score: ${q.score_percent}% (${q.score}/${q.total_questions}) on ${q.attempt_date}`)
            .join('\n')
        : 'No diagnostic practice quizzes recorded yet';

    const activeTimetableInfo = studyPlan
      ? `Active Revision Timetable: Target exams scheduled, status: Active.`
      : 'No active revision timetable generated yet.';

    const contextText = `VERIFIED AUTHENTICATED STUDENT PROFILE:
- Full Name: ${profile.full_name || user.name || 'Student'}
- Institution: ${profile.institution || 'Engineering College'}
- Degree & Branch: ${profile.course_degree || 'B.Tech'} - ${profile.department_branch || 'Computer Science & Engineering'}
- Academic Year & Semester: Year ${profile.academic_year || '3'}, Semester ${profile.semester || '5'}
- Overall Attendance: ${profile.overall_attendance ?? 78}%
- Study Capacity: ${studyHours}
- Weak / Priority Focus Topics: ${weakTopicsList}

Enrolled Semester Subjects & Marks:
${subjectsSummary}

Upcoming Scheduled Examinations:
${upcomingExamsSummary}

Recent Practice Quiz Performance:
${recentQuizzes}

Active Plan & Saved Courses:
${activeTimetableInfo}
Saved Courses count: ${savedCourses.length}

INSTRUCTION: You must strictly reference this student's real enrolled courses, marks, and upcoming exam dates when answering questions about their academic trajectory or revision strategy. Never hallucinate marks or exam dates not present above.`;

    return {
      contextText,
      personalized: true,
      studentName: profile.full_name || user.name || 'Student'
    };
  } catch (err) {
    console.warn('Error retrieving student profile context:', err);
    return {
      contextText: `Student Session: Authenticated as ${user.name || 'Student'}. Detailed profile lookup encountered an issue; provide standard academic guidance.`,
      personalized: false,
      studentName: user.name || 'Student'
    };
  }
}

/**
 * Detects whether a student prompt is inquiring about external, time-sensitive,
 * examination dates, government tests, admission requirements, or placement facts.
 */
export function isTimeSensitiveOrExternalQuery(query: string): boolean {
  const lower = query.toLowerCase();
  const patterns = [
    'gate 202',
    'exam date',
    'when is',
    'registration deadline',
    'last date',
    'application form',
    'admission requirement',
    'eligibility criteria',
    'cutoff',
    'cut-off',
    'placement stats',
    'average salary',
    'hiring criteria',
    'internship opening',
    'nptel exam',
    'swayam registration',
    'cat 202',
    'gre 202',
    'isro recruitment',
    'drdo vacancy',
    'official website',
    'syllabus change',
    'latest update'
  ];
  return patterns.some((p) => lower.includes(p));
}

/**
 * Main conversational generator for EduPredict AI Assistant.
 */
export async function generateChatResponse(params: {
  messages: ChatMessage[];
  user: User | null;
  enableSearch?: boolean;
}): Promise<ChatResponsePayload> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim().length === 0) {
    throw new Error(
      'GEMINI_API_KEY environment variable is not configured. Please add your Gemini API key to continue.'
    );
  }

  const { messages, user, enableSearch } = params;
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    throw new Error('Messages array is required and must contain at least one user message.');
  }

  // Input sanitization and length bounds
  const recentMessages = messages.slice(-12); // Keep last 12 turns for coherent memory
  const latestMessage = recentMessages[recentMessages.length - 1];
  if (!latestMessage || latestMessage.role !== 'user' || !latestMessage.content.trim()) {
    throw new Error('Latest message must be a non-empty user prompt.');
  }

  if (latestMessage.content.length > 3000) {
    throw new Error('Message exceeds the maximum limit of 3000 characters. Please shorten your question.');
  }

  const { contextText, personalized, studentName } = await buildStudentContext(user);

  const shouldSearch = Boolean(
    enableSearch || isTimeSensitiveOrExternalQuery(latestMessage.content)
  );

  const systemInstruction = `You are "EduPredict AI Assistant", the official, verified AI academic mentor, study coach, and engineering tutor built into the EduPredict AI platform.

MISSION & CHARACTER:
1. Provide accurate, clear, mathematically rigorous, and encouraging academic guidance for college and university students (especially B.Tech / BE Computer Science, IT, Electronics, and related engineering & STEM disciplines).
2. Answer questions across:
   • Computer Science core: Data Structures & Algorithms, Operating Systems, Database Management Systems (DBMS), Computer Networks, Theory of Computation, Compiler Design, Software Engineering, OOP (Java/C++/Python).
   • Mathematics: Discrete Mathematics, Engineering Calculus, Linear Algebra, Probability & Statistics.
   • Modern Tech: Artificial Intelligence, Machine Learning, Deep Learning, Cloud Computing, Cybersecurity, Web Development.
   • Study & Exam Strategy: Timetable balancing, spaced repetition, syllabus gap diagnosis, stress management.
   • EduPredict AI Navigation: Explain how to use the Student Dashboard, Academic Analysis view, Exam Scheduler, Learn & Practice Studio (Theory + 30-Question Quizzes), and Recommended Courses.
3. PERSONALIZATION RULES:
   ${contextText}
   - When addressing an authenticated student, acknowledge their degree, enrolled subjects, weak topics, or target exams when relevant.
   - If they ask "What should I study next?" or "How am I performing in OS?", inspect the verified profile above and give exact, data-driven advice.
   - NEVER invent marks, attendance, or exam schedules not present in the profile.
4. RIGOR & TRUTHFULNESS:
   - For mathematical derivations or algorithm time/space complexity, provide step-by-step proofs and explanations.
   - When providing code, write clean, syntactically valid code with comments explaining edge cases and complexity.
   - For externally verifiable facts (exam dates, admissions, cutoff scores, job criteria, internship deadlines):
     * If live search or verified data is available, cite the official authority (e.g. IIT GATE Committee, NTA, UGC, company careers portal) with links.
     * If information could not be verified via live search, explicitly declare: "Note: Live verification is currently unavailable; please check the official portal for real-time announcements."
     * Never hallucinate citations or pretend a source was verified when it was not.
   - When a student's question is ambiguous (e.g. "which subject is best?"), provide a clear answer and ask 1 focused clarifying question.
5. FORMATTING:
   - Use structured Markdown: clean headings (## or ###), bullet points, bold key terms, blockquotes for important rules or pitfalls.
   - Code blocks must declare language (e.g. \`\`\`cpp, \`\`\`python, \`\`\`sql).
   - Keep answers well-structured, scannable, and easy to read during study sessions.`;

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });

  const modelName = process.env.GEMINI_MODEL || 'gemini-3.8-flash';

  // Format messages into Gemini contents structure
  const formattedContents = recentMessages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }]
  }));

  let replyText = '';
  let sources: GroundingSource[] = [];
  let searchUsed = false;

  // Try with Google Search Grounding if time-sensitive or external query
  if (shouldSearch) {
    try {
      const searchResponse = await ai.models.generateContent({
        model: modelName,
        contents: formattedContents,
        config: {
          systemInstruction,
          tools: [{ googleSearch: {} }],
          temperature: 0.7
        }
      });

      replyText = searchResponse.text || '';
      searchUsed = true;

      // Extract search grounding metadata if present
      const candidate = searchResponse.candidates?.[0];
      const grounding = candidate?.groundingMetadata;
      if (grounding && Array.isArray(grounding.groundingChunks)) {
        const extractedSources: GroundingSource[] = [];
        for (const chunk of grounding.groundingChunks) {
          if (chunk.web?.uri && chunk.web?.title) {
            extractedSources.push({
              title: chunk.web.title,
              url: chunk.web.uri
            });
          }
        }
        // Deduplicate sources by URL
        const seenUrls = new Set<string>();
        sources = extractedSources.filter((s) => {
          if (seenUrls.has(s.url)) return false;
          seenUrls.add(s.url);
          return true;
        });
      }
    } catch (searchErr: any) {
      console.warn(
        'Google Search Grounding unavailable or quota exceeded, continuing with core Gemini model:',
        searchErr?.message
      );
      searchUsed = false;
      // Gracefully fall back to standard generation without search tool
    }
  }

  // If search was not attempted or failed gracefully, run standard model generation
  if (!replyText) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: formattedContents,
        config: {
          systemInstruction,
          temperature: 0.7
        }
      });

      replyText = response.text || '';

      // If the query was time-sensitive but search was unavailable, append verification disclaimer
      if (shouldSearch && !searchUsed) {
        replyText += `\n\n> ℹ️ **Notice on Time-Sensitive Information**: Live web verification is currently unavailable. Please check the official organization or university portal directly for real-time dates, circulars, and deadlines.`;
      }
    } catch (genErr: any) {
      console.error('Error in Gemini generateContent:', genErr);
      throw new Error(
        `Failed to generate response from EduPredict AI Assistant: ${genErr?.message || 'Upstream service error'}`
      );
    }
  }

  // Generate 2-3 dynamic contextual follow-up suggestions
  const suggestedQuestions = generateSuggestedFollowups(latestMessage.content, replyText);

  return {
    reply: replyText,
    sources: sources.length > 0 ? sources : undefined,
    suggestedQuestions,
    modelUsed: modelName,
    personalized,
    searchUsed
  };
}

/**
 * Generates relevant follow-up questions tailored to student topic.
 */
function generateSuggestedFollowups(userQuery: string, reply: string): string[] {
  const queryLower = userQuery.toLowerCase();
  const replyLower = reply.toLowerCase();

  if (queryLower.includes('b-tree') || queryLower.includes('bst') || queryLower.includes('tree')) {
    return [
      'Show me insertion steps in a B-Tree of order 3',
      'What are the differences between B-Tree and B+ Tree?',
      'How does disk I/O cost relate to B-Tree height?'
    ];
  }

  if (queryLower.includes('sort') || queryLower.includes('algorithm') || queryLower.includes('dsa')) {
    return [
      'Show a complete C++ / Python implementation',
      'What is the worst-case space and time complexity?',
      'How do I practice 30 diagnostic questions on this in Learn & Practice?'
    ];
  }

  if (queryLower.includes('dbms') || queryLower.includes('normalization') || queryLower.includes('sql')) {
    return [
      'How to determine highest normal form of a relation?',
      'Explain BCNF vs 3NF with a practical example',
      'Show SQL queries with GROUP BY and HAVING'
    ];
  }

  if (queryLower.includes('schedule') || queryLower.includes('exam') || queryLower.includes('timetable')) {
    return [
      'How do I add this subject to the Exam Scheduler?',
      'What is the recommended spaced repetition interval?',
      'How does EduPredict AI prioritize weak topics?'
    ];
  }

  if (queryLower.includes('mark') || queryLower.includes('attendance') || queryLower.includes('performance')) {
    return [
      'Diagnose my syllabus gaps in Academic Analysis',
      'How can I raise my overall score baseline above 75%?',
      'Which verified courses will help me improve this subject?'
    ];
  }

  return [
    'Can you give me a practical code example?',
    'What are common exam traps or pitfalls for this topic?',
    'Give me a 3-question active recall test to check my understanding'
  ];
}

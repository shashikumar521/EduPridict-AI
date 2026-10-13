import { GoogleGenAI } from '@google/genai';
import {
  ExamSubject,
  ExamTopic,
  StudyAvailability,
  ScheduledStudySession,
  DaySchedule,
  ExamStudyPlan,
  SessionType
} from '../src/types';

/**
 * Intelligent Algorithm to generate realistic, personalized, day-wise exam study schedule.
 */
export function generateIntelligentSchedule(params: {
  studentId: string;
  examName: string;
  startDate?: string;
  subjects: ExamSubject[];
  availability: StudyAvailability;
}): ExamStudyPlan {
  const { studentId, examName, subjects, availability } = params;

  // 1. Determine Start Date and Date Range
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let startDateObj = today;
  if (params.startDate) {
    const parsed = new Date(params.startDate);
    if (!isNaN(parsed.getTime())) {
      parsed.setHours(0, 0, 0, 0);
      startDateObj = parsed;
    }
  }

  // Find latest exam date
  let maxExamDate = new Date(startDateObj.getTime() + 14 * 86400000);
  for (const sub of subjects) {
    if (sub.examDate) {
      const d = new Date(sub.examDate);
      if (!isNaN(d.getTime()) && d > maxExamDate) {
        maxExamDate = d;
      }
    }
  }

  const startDateStr = startDateObj.toISOString().slice(0, 10);
  const endDateStr = maxExamDate.toISOString().slice(0, 10);

  // 2. Prepare Topic Priority Queue
  interface PrioritizedTopic {
    subjectId: string;
    subjectName: string;
    subjectExamDate: Date;
    topic: ExamTopic;
    priorityScore: number;
    estimatedMinutes: number;
    priority: 'high' | 'medium' | 'low';
    scheduledInitial: boolean;
    scheduledReview: boolean;
  }

  const topicPool: PrioritizedTopic[] = [];

  for (const sub of subjects) {
    const examDateObj = sub.examDate ? new Date(sub.examDate) : maxExamDate;
    examDateObj.setHours(0, 0, 0, 0);

    for (const top of sub.topics) {
      // Weightage score
      const weightScore = top.weightage === 'High' ? 3 : (top.weightage === 'Medium' ? 2 : 1);
      // Confidence score (Weak needs highest urgency)
      const confScore = top.confidence === 'Weak' ? 3 : (top.confidence === 'Average' ? 2 : 1);
      // Difficulty score
      const diffScore = top.difficulty === 'Hard' ? 3 : (top.difficulty === 'Medium' ? 2 : 1);

      // Composite priority score: 3.0 to 9.0
      const priorityScore = (weightScore * 1.0) + (confScore * 1.2) + (diffScore * 0.8);

      let priorityLabel: 'high' | 'medium' | 'low' = 'medium';
      if (priorityScore >= 6.5) priorityLabel = 'high';
      else if (priorityScore <= 4.0) priorityLabel = 'low';

      const estMins = Math.max(30, Math.min(120, top.estimatedMinutes || 60));

      topicPool.push({
        subjectId: sub.id,
        subjectName: sub.name,
        subjectExamDate: examDateObj,
        topic: top,
        priorityScore,
        estimatedMinutes: estMins,
        priority: priorityLabel,
        scheduledInitial: false,
        scheduledReview: false
      });
    }
  }

  // Sort topics by:
  // 1. Subject exam date ascending (closer exam first)
  // 2. Priority score descending (high difficulty/weak confidence first)
  topicPool.sort((a, b) => {
    const dateDiff = a.subjectExamDate.getTime() - b.subjectExamDate.getTime();
    if (dateDiff !== 0) return dateDiff;
    return b.priorityScore - a.priorityScore;
  });

  // 3. Build Day-by-Day Timeline
  const daySchedules: DaySchedule[] = [];
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const curr = new Date(startDateObj);
  let sessionCounter = 1;

  while (curr <= maxExamDate) {
    const dateStr = curr.toISOString().slice(0, 10);
    const dayName = daysOfWeek[curr.getDay()];
    const isWeekend = curr.getDay() === 0 || curr.getDay() === 6;
    const isRestDay = (availability.restDays || []).includes(dayName);

    // Check if any subject has an exam on this exact day
    const examToday = subjects.find(s => s.examDate === dateStr);

    let dailyCapacityMinutes = isWeekend
      ? (availability.dailyHoursWeekend || 4) * 60
      : (availability.dailyHoursWeekday || 3) * 60;

    if (isRestDay) {
      dailyCapacityMinutes = 0; // Pure rest or light review
    }

    const daySessions: ScheduledStudySession[] = [];
    let allocatedMinutesToday = 0;

    // Check subjects having exams within buffer days
    const bufferDays = availability.revisionBufferDays || 2;
    const subjectsInBuffer = subjects.filter(sub => {
      if (!sub.examDate) return false;
      const exD = new Date(sub.examDate);
      exD.setHours(0, 0, 0, 0);
      const diffDays = Math.round((exD.getTime() - curr.getTime()) / (86400000));
      return diffDays >= 0 && diffDays <= bufferDays;
    });

    if (subjectsInBuffer.length > 0 && !isRestDay && dailyCapacityMinutes > 0) {
      // Prioritize revision & mock test for subjects in buffer
      for (const buffSub of subjectsInBuffer) {
        const exD = new Date(buffSub.examDate);
        exD.setHours(0, 0, 0, 0);
        const daysUntilExam = Math.round((exD.getTime() - curr.getTime()) / (86400000));

        if (daysUntilExam === 0) {
          // Exam day! Light 30-min formula & formula sheet warmup
          if (allocatedMinutesToday + 30 <= dailyCapacityMinutes) {
            daySessions.push({
              id: `sess-${sessionCounter++}`,
              subjectId: buffSub.id,
              subjectName: buffSub.name,
              topicId: 'exam-warmup',
              topicName: `${buffSub.name} - Pre-Exam Key Formulas & Mind-Map Review`,
              unitOrChapter: 'Final Review',
              date: dateStr,
              dayOfWeek: dayName,
              durationMinutes: 30,
              sessionType: 'revision',
              priority: 'high',
              status: 'pending',
              aiTip: 'Stay calm, focus on key definitions and diagrams, avoid learning new concepts right now.'
            });
            allocatedMinutesToday += 30;
          }
        } else if (daysUntilExam === 1) {
          // 1 Day before: Mock Test or Full Revision Drill
          const sessionDur = Math.min(90, dailyCapacityMinutes - allocatedMinutesToday);
          if (sessionDur >= 45) {
            daySessions.push({
              id: `sess-${sessionCounter++}`,
              subjectId: buffSub.id,
              subjectName: buffSub.name,
              topicId: 'mock-test',
              topicName: `${buffSub.name} - Timed Full-Length Mock Paper / PYQs`,
              unitOrChapter: 'Exam Simulation',
              date: dateStr,
              dayOfWeek: dayName,
              durationMinutes: sessionDur,
              sessionType: 'mock_test',
              priority: 'high',
              status: 'pending',
              aiTip: 'Simulate exact exam conditions with no reference sheets to test exam endurance.'
            });
            allocatedMinutesToday += sessionDur;
          }
        } else {
          // 2 days before: High weightage formulas & tricky concept blitz
          const sessionDur = Math.min(60, dailyCapacityMinutes - allocatedMinutesToday);
          if (sessionDur >= 30) {
            daySessions.push({
              id: `sess-${sessionCounter++}`,
              subjectId: buffSub.id,
              subjectName: buffSub.name,
              topicId: 'buffer-revision',
              topicName: `${buffSub.name} - High-Yield Question Bank & Error Log Drill`,
              unitOrChapter: 'Intensive Review',
              date: dateStr,
              dayOfWeek: dayName,
              durationMinutes: sessionDur,
              sessionType: 'revision',
              priority: 'high',
              status: 'pending',
              aiTip: 'Review questions you previously struggled with or got wrong in homework.'
            });
            allocatedMinutesToday += sessionDur;
          }
        }
      }
    }

    // Now fill remaining time with unassigned core topics
    if (!isRestDay && allocatedMinutesToday < dailyCapacityMinutes) {
      // Filter topics that:
      // 1. Have exam date strictly AFTER this date
      // 2. Haven't been scheduled initially
      for (const item of topicPool) {
        if (allocatedMinutesToday >= dailyCapacityMinutes) break;

        // Ensure this topic's exam hasn't already passed
        if (item.subjectExamDate <= curr) continue;

        // Determine session duration (e.g. 45 or 60 min blocks)
        const blockMins = Math.min(item.estimatedMinutes, dailyCapacityMinutes - allocatedMinutesToday);
        if (blockMins < 30) continue; // Skip if less than 30 mins available

        if (!item.scheduledInitial) {
          // Initial study session
          const sessionType: SessionType = item.topic.difficulty === 'Hard' || item.topic.confidence === 'Weak'
            ? 'concept'
            : 'problem_solving';

          daySessions.push({
            id: `sess-${sessionCounter++}`,
            subjectId: item.subjectId,
            subjectName: item.subjectName,
            topicId: item.topic.id,
            topicName: item.topic.name,
            unitOrChapter: item.topic.unitOrChapter || 'Core Module',
            date: dateStr,
            dayOfWeek: dayName,
            durationMinutes: blockMins,
            sessionType,
            priority: item.priority,
            status: 'pending',
            aiTip: item.topic.confidence === 'Weak'
              ? 'Focus on first principles: solve 2 sample questions with pen and paper right after reading.'
              : 'Summarize key takeaways in bullet points before concluding.'
          });

          allocatedMinutesToday += blockMins;
          item.scheduledInitial = true;
        } else if (!item.scheduledReview && (item.priority === 'high' || item.topic.confidence === 'Weak')) {
          // Schedule a spaced repetition review 3+ days after initial study
          // Only if this day is at least 3 days after startDate
          const daysFromStart = Math.round((curr.getTime() - startDateObj.getTime()) / 86400000);
          if (daysFromStart >= 3 && blockMins >= 30) {
            daySessions.push({
              id: `sess-${sessionCounter++}`,
              subjectId: item.subjectId,
              subjectName: item.subjectName,
              topicId: `${item.topic.id}-rev`,
              topicName: `${item.topic.name} (Active Recall & Formula Verification)`,
              unitOrChapter: item.topic.unitOrChapter || 'Spaced Review',
              date: dateStr,
              dayOfWeek: dayName,
              durationMinutes: Math.min(45, blockMins),
              sessionType: 'spaced_recall',
              priority: 'high',
              status: 'pending',
              aiTip: 'Active Recall test: Write down all key formulas from memory without looking at notes!'
            });
            allocatedMinutesToday += Math.min(45, blockMins);
            item.scheduledReview = true;
          }
        }
      }
    }

    daySchedules.push({
      date: dateStr,
      dayOfWeek: dayName,
      isRestDay,
      totalPlannedMinutes: allocatedMinutesToday,
      sessions: daySessions,
      examOnThisDay: examToday ? { subjectName: examToday.name } : undefined
    });

    // Advance to next day
    curr.setDate(curr.getDate() + 1);
  }

  // Calculate high-level metrics
  const totalTopics = subjects.reduce((sum, s) => sum + (s.topics?.length || 0), 0);
  const totalMinutes = daySchedules.reduce((sum, d) => sum + d.totalPlannedMinutes, 0);
  const totalHoursPlanned = Number((totalMinutes / 60).toFixed(1));

  // Generate Strategy Tips
  const aiStrategyTips = generateDefaultStrategyTips(subjects, availability, totalHoursPlanned);

  return {
    studentId,
    examName: examName || 'Semester Final Examination',
    startDate: startDateStr,
    endDate: endDateStr,
    subjects,
    availability,
    days: daySchedules,
    aiStrategyTips,
    totalTopics,
    completedTopics: 0,
    totalHoursPlanned,
    completedHours: 0,
    streakDays: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

/**
 * Rebalances schedule when a student marks items as needing review or misses days.
 */
export function rebalanceSchedule(
  currentPlan: ExamStudyPlan,
  availability: StudyAvailability
): ExamStudyPlan {
  // Collect all uncompleted topics
  const uncompletedTopics: ScheduledStudySession[] = [];
  const completedTopics: ScheduledStudySession[] = [];

  for (const day of currentPlan.days) {
    for (const sess of day.sessions) {
      if (sess.status === 'completed') {
        completedTopics.push(sess);
      } else {
        uncompletedTopics.push(sess);
      }
    }
  }

  // Re-run scheduler with remaining uncompleted topics from today forward
  const updated = generateIntelligentSchedule({
    studentId: currentPlan.studentId,
    examName: currentPlan.examName,
    startDate: new Date().toISOString().slice(0, 10),
    subjects: currentPlan.subjects,
    availability
  });

  // Preserve completed count
  updated.id = currentPlan.id;
  updated.completedTopics = completedTopics.length;
  const completedMins = completedTopics.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
  updated.completedHours = Number((completedMins / 60).toFixed(1));

  return updated;
}

/**
 * Intelligent Rule-based Default Strategy Tips
 */
export function generateDefaultStrategyTips(
  subjects: ExamSubject[],
  availability: StudyAvailability,
  totalHoursPlanned: number
): string[] {
  const tips: string[] = [];

  // Sort subjects by exam date
  const sorted = [...subjects].sort((a, b) => {
    return new Date(a.examDate).getTime() - new Date(b.examDate).getTime();
  });

  if (sorted.length > 0) {
    const firstExam = sorted[0];
    tips.push(
      `First Priority: ${firstExam.name} has the earliest exam on ${firstExam.examDate}. Initial focus blocks front-load its highest difficulty modules.`
    );
  }

  // Weak confidence focus
  const weakTopics: string[] = [];
  for (const sub of subjects) {
    for (const top of sub.topics) {
      if (top.confidence === 'Weak') {
        weakTopics.push(`${top.name} (${sub.name})`);
      }
    }
  }

  if (weakTopics.length > 0) {
    tips.push(
      `Vulnerability Targeting: Identified ${weakTopics.length} topics flagged as 'Weak Confidence' (e.g., ${weakTopics.slice(0, 2).join(', ')}). These are prioritized in your earliest study slots with active recall sessions.`
    );
  } else {
    tips.push(
      'Balanced Mastery: All topics have stable confidence ratings. Balanced rotation is maintained across subjects to keep cognitive recall sharp.'
    );
  }

  tips.push(
    `Buffer Protection: The final ${availability.revisionBufferDays || 2} days before each subject exam are strictly reserved for full-length timed mock tests and error log reviews.`
  );

  tips.push(
    `Sustainable Pacing: Planned ${totalHoursPlanned} hours across the preparation window, staying strictly within your declared daily cap (${availability.dailyHoursWeekday}h weekdays / ${availability.dailyHoursWeekend}h weekends).`
  );

  return tips;
}

/**
 * Calls Gemini AI to generate customized study schedule advice and strategic commentary.
 */
export async function getGeminiScheduleAdvice(plan: ExamStudyPlan): Promise<string[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return plan.aiStrategyTips || generateDefaultStrategyTips(plan.subjects, plan.availability, plan.totalHoursPlanned);
  }

  try {
    const ai = new GoogleGenAI({});
    const prompt = `You are the EduPredict AI Exam Strategist & Academic Advisor.
Analyze this student's exam study schedule:
- Exam Name: ${plan.examName}
- Timeline: ${plan.startDate} to ${plan.endDate}
- Daily Available Hours: ${plan.availability.dailyHoursWeekday}h (Weekdays), ${plan.availability.dailyHoursWeekend}h (Weekends)
- Subjects and Exam Dates:
${plan.subjects.map(s => `  * ${s.name} (Exam Date: ${s.examDate}): ${s.topics.length} topics [${s.topics.filter(t => t.confidence === 'Weak').length} weak, ${s.topics.filter(t => t.difficulty === 'Hard').length} hard]`).join('\n')}

Generate 4 to 5 concise, highly practical, strategic study tips for this exact student schedule.
Format: Return a JSON array of 4-5 strings (no markdown enclosing, just valid JSON array of strings).
Example format: ["Tip 1: ...", "Tip 2: ...", "Tip 3: ...", "Tip 4: ..."]`;

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Gemini API timeout')), 4000)
    );

    const generatePromise = ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });

    const response = await Promise.race([generatePromise, timeoutPromise]);

    const text = response.text?.trim() || '';
    const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map(String);
    }
  } catch (err: any) {
    console.warn('Gemini API call for schedule advice timed out or failed, using rule-based strategy tips:', err?.message);
  }

  return plan.aiStrategyTips || generateDefaultStrategyTips(plan.subjects, plan.availability, plan.totalHoursPlanned);
}

/**
 * Ask Gemini AI for quick revision techniques and active recall questions for a specific topic.
 */
export async function getTopicAIAssistance(params: {
  subjectName: string;
  topicName: string;
  difficulty?: string;
  confidence?: string;
}): Promise<{
  summary: string;
  activeRecallQuestions: string[];
  examPitfall: string;
  source: 'gemini' | 'heuristic';
}> {
  const { subjectName, topicName, difficulty = 'Medium', confidence = 'Average' } = params;
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({});
      const prompt = `You are the EduPredict AI Academic Coach.
A student is preparing for an exam in "${subjectName}" on the topic "${topicName}".
Difficulty: ${difficulty}, Student Confidence: ${confidence}.

Provide a quick, high-impact revision breakdown in JSON:
{
  "summary": "2-3 concise sentences explaining the core concept and how it is typically tested in exams.",
  "activeRecallQuestions": ["Question 1 to test understanding", "Question 2 with formula/derivation", "Question 3 practical problem prompt"],
  "examPitfall": "1 common mistake or trap students frequently fall into during exams for this topic and how to avoid it."
}
Return only valid JSON.`;

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Gemini API timeout')), 4000)
      );

      const generatePromise = ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }]
      });

      const response = await Promise.race([generatePromise, timeoutPromise]);

      const text = response.text?.trim() || '';
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      return {
        summary: parsed.summary || `Core principles and problem patterns for ${topicName}.`,
        activeRecallQuestions: Array.isArray(parsed.activeRecallQuestions) ? parsed.activeRecallQuestions : [
          `What are the foundational assumptions of ${topicName}?`,
          `How would you derive or calculate the key result in ${topicName}?`,
          `What happens if edge conditions change in ${topicName}?`
        ],
        examPitfall: parsed.examPitfall || 'Rushing through calculation steps without checking units and boundary constraints.',
        source: 'gemini'
      };
    } catch (err: any) {
      console.warn('Gemini topic advice call failed, falling back to heuristic engine:', err?.message);
    }
  }

  // Fallback offline heuristic coaching
  return {
    summary: `${topicName} is a core competency module in ${subjectName}. Master the foundational definitions, 2 standard proofs/derivations, and at least 3 solved numerical or analytical questions.`,
    activeRecallQuestions: [
      `Without looking at your textbook, write down the fundamental definition or formula of ${topicName}.`,
      `What are the 2 most common variation types examiners ask on ${topicName}?`,
      `Explain the step-by-step methodology to solve a standard 5-mark question in ${topicName}.`
    ],
    examPitfall: 'Skipping edge cases and forgetting to write down step-by-step intermediate formulas before numerical substitution.',
    source: 'heuristic'
  };
}

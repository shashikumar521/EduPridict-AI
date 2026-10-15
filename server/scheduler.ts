import { GoogleGenAI } from '@google/genai';
import {
  ExamSubject,
  ExamTopic,
  StudyAvailability,
  ScheduledStudySession,
  DaySchedule,
  ExamStudyPlan,
  SessionType,
  WorkloadDeficitInfo
} from '../src/types';

/**
 * Time utility functions for realistic session scheduling with non-overlapping slots and breaks
 */
function parseTimeToMinutes(timeStr?: string, defaultHour: number = 9): number {
  if (!timeStr) return defaultHour * 60;
  const trimmed = timeStr.trim().toUpperCase();
  const match12 = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/);
  if (match12) {
    let hours = parseInt(match12[1], 10);
    const mins = parseInt(match12[2], 10);
    const meridiem = match12[3];
    if (meridiem === 'PM' && hours < 12) hours += 12;
    if (meridiem === 'AM' && hours === 12) hours = 0;
    return hours * 60 + mins;
  }
  const match24 = trimmed.match(/^(\d{1,2}):(\d{2})$/);
  if (match24) {
    return parseInt(match24[1], 10) * 60 + parseInt(match24[2], 10);
  }
  return defaultHour * 60;
}

function formatMinutesToTime(totalMins: number): string {
  const normalized = ((totalMins % 1440) + 1440) % 1440;
  const h = Math.floor(normalized / 60);
  const m = normalized % 60;
  const meridiem = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 === 0 ? 12 : h % 12;
  const displayM = m < 10 ? `0${m}` : `${m}`;
  return `${displayH}:${displayM} ${meridiem}`;
}

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
  let totalRequiredMinutes = 0;
  let alreadyCompletedCount = 0;

  for (const sub of subjects) {
    const examDateObj = sub.examDate ? new Date(sub.examDate) : maxExamDate;
    examDateObj.setHours(0, 0, 0, 0);

    for (const top of sub.topics) {
      if (top.isCompleted) {
        alreadyCompletedCount++;
      }

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

      // Preferred block duration respect
      const defaultBlock = availability.sessionDurationMinutes || 45;
      const estMins = top.estimatedMinutes || (top.difficulty === 'Hard' ? defaultBlock * 1.5 : defaultBlock);

      if (!top.isCompleted) {
        totalRequiredMinutes += estMins;
      }

      topicPool.push({
        subjectId: sub.id,
        subjectName: sub.name,
        subjectExamDate: examDateObj,
        topic: top,
        priorityScore,
        estimatedMinutes: estMins,
        priority: priorityLabel,
        scheduledInitial: Boolean(top.isCompleted),
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

  const sessionBlockMinutes = availability.sessionDurationMinutes || 45;
  const breakMinutes = availability.breakDurationMinutes !== undefined ? availability.breakDurationMinutes : 10;
  const startDayMinute = parseTimeToMinutes(availability.startTime, 9); // default 09:00 AM

  const weekdayMinutes = (availability.dailyHoursWeekday || availability.dailyHours || 3) * 60 + (availability.dailyMinutes || 0);
  const weekendMinutes = (availability.dailyHoursWeekend || availability.dailyHours || 4) * 60 + (availability.dailyMinutes || 0);

  let totalAvailableMinutes = 0;
  const curr = new Date(startDateObj);
  let sessionCounter = 1;

  while (curr <= maxExamDate) {
    const dateStr = curr.toISOString().slice(0, 10);
    const dayName = daysOfWeek[curr.getDay()];
    const isWeekend = curr.getDay() === 0 || curr.getDay() === 6;
    const isRestDay = (availability.restDays || []).includes(dayName);

    // Check if any subject has an exam on this exact day
    const examToday = subjects.find(s => s.examDate === dateStr);

    let dailyCapacityMinutes = isWeekend ? weekendMinutes : weekdayMinutes;
    if (isRestDay) {
      dailyCapacityMinutes = 0;
    } else {
      totalAvailableMinutes += dailyCapacityMinutes;
    }

    const daySessions: ScheduledStudySession[] = [];
    let allocatedMinutesToday = 0;
    let currentSessionMinute = startDayMinute;

    // Helper to push session with calculated realistic start and end time
    const addSession = (
      subId: string,
      subName: string,
      topId: string,
      topName: string,
      unitOrChapter: string,
      dur: number,
      sType: SessionType,
      prio: 'high' | 'medium' | 'low',
      tip: string
    ) => {
      const sStart = formatMinutesToTime(currentSessionMinute);
      const sEnd = formatMinutesToTime(currentSessionMinute + dur);
      daySessions.push({
        id: `sess-${sessionCounter++}`,
        subjectId: subId,
        subjectName: subName,
        topicId: topId,
        topicName: topName,
        unitOrChapter,
        date: dateStr,
        dayOfWeek: dayName,
        durationMinutes: dur,
        startTime: sStart,
        endTime: sEnd,
        timeSlot: `${sStart} – ${sEnd}`,
        sessionType: sType,
        priority: prio,
        status: 'pending',
        aiTip: tip
      });
      allocatedMinutesToday += dur;
      currentSessionMinute += dur + breakMinutes;
    };

    // Check subjects having exams within buffer days
    const bufferDays = availability.revisionBufferDays || 2;
    const subjectsInBuffer = subjects.filter(sub => {
      if (!sub.examDate) return false;
      const exD = new Date(sub.examDate);
      exD.setHours(0, 0, 0, 0);
      const diffDays = Math.round((exD.getTime() - curr.getTime()) / 86400000);
      return diffDays >= 0 && diffDays <= bufferDays;
    });

    if (subjectsInBuffer.length > 0 && !isRestDay && dailyCapacityMinutes > 0) {
      for (const buffSub of subjectsInBuffer) {
        const exD = new Date(buffSub.examDate);
        exD.setHours(0, 0, 0, 0);
        const daysUntilExam = Math.round((exD.getTime() - curr.getTime()) / 86400000);

        if (daysUntilExam === 0) {
          if (allocatedMinutesToday + 30 <= dailyCapacityMinutes) {
            addSession(
              buffSub.id,
              buffSub.name,
              'exam-warmup',
              `${buffSub.name} - Pre-Exam Key Formulas & Mind-Map Review`,
              'Final Exam Review',
              30,
              'revision',
              'high',
              'Stay calm, review flash formulas and core definitions. Avoid cramming new topics today.'
            );
          }
        } else if (daysUntilExam === 1) {
          const sessionDur = Math.min(Math.max(45, sessionBlockMinutes), dailyCapacityMinutes - allocatedMinutesToday);
          if (sessionDur >= 30) {
            addSession(
              buffSub.id,
              buffSub.name,
              'mock-test',
              `${buffSub.name} - Timed Full-Length Mock Paper / PYQs`,
              'Exam Simulation',
              sessionDur,
              'mock_test',
              'high',
              'Simulate exact examination conditions with a strict timer to sharpen your exam endurance.'
            );
          }
        } else {
          const sessionDur = Math.min(Math.max(40, sessionBlockMinutes), dailyCapacityMinutes - allocatedMinutesToday);
          if (sessionDur >= 30) {
            addSession(
              buffSub.id,
              buffSub.name,
              'buffer-revision',
              `${buffSub.name} - High-Yield Question Bank & Error Log Drill`,
              'Spaced Revision',
              sessionDur,
              'revision',
              'high',
              'Review questions you previously struggled with or got wrong during past assessments.'
            );
          }
        }
      }
    }

    // Now fill remaining time with unassigned core topics
    if (!isRestDay && allocatedMinutesToday < dailyCapacityMinutes) {
      for (const item of topicPool) {
        if (allocatedMinutesToday >= dailyCapacityMinutes) break;

        // Ensure this topic's exam hasn't already passed
        if (item.subjectExamDate <= curr) continue;

        const remainingCapacity = dailyCapacityMinutes - allocatedMinutesToday;
        const blockMins = Math.min(item.estimatedMinutes, sessionBlockMinutes, remainingCapacity);
        if (blockMins < 20) continue;

        if (!item.scheduledInitial) {
          const sessionType: SessionType =
            item.topic.difficulty === 'Hard' || item.topic.confidence === 'Weak'
              ? 'concept'
              : 'problem_solving';

          addSession(
            item.subjectId,
            item.subjectName,
            item.topic.id,
            item.topic.name,
            item.topic.unitOrChapter || 'Core Module',
            blockMins,
            sessionType,
            item.priority,
            item.topic.confidence === 'Weak'
              ? 'Focus on first principles: solve 2 sample questions with pen and paper right after reading.'
              : 'Summarize key takeaways and note down any friction points for quick revision.'
          );

          item.scheduledInitial = true;
        } else if (!item.scheduledReview && (item.priority === 'high' || item.topic.confidence === 'Weak')) {
          const daysFromStart = Math.round((curr.getTime() - startDateObj.getTime()) / 86400000);
          if (daysFromStart >= 3 && remainingCapacity >= 25) {
            const revDur = Math.min(30, remainingCapacity);
            addSession(
              item.subjectId,
              item.subjectName,
              `${item.topic.id}-rev`,
              `${item.topic.name} (Active Recall & Formula Verification)`,
              item.topic.unitOrChapter || 'Spaced Recall',
              revDur,
              'spaced_recall',
              'high',
              'Active Recall Drill: Write down all key formulas from memory without checking reference notes!'
            );
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

    curr.setDate(curr.getDate() + 1);
  }

  // Workload analysis: check if required exceeds capacity
  let workloadDeficit: WorkloadDeficitInfo | undefined;
  const unscheduledTopics = topicPool.filter(t => !t.scheduledInitial && !t.topic.isCompleted);
  if (totalRequiredMinutes > totalAvailableMinutes || unscheduledTopics.length > 0) {
    const deficitMins = Math.max(0, totalRequiredMinutes - totalAvailableMinutes);
    workloadDeficit = {
      hasDeficit: true,
      totalRequiredMinutes,
      totalAvailableMinutes,
      deficitMinutes: deficitMins,
      unscheduledTopicsCount: unscheduledTopics.length,
      priorityNotice: `Workload Alert: ${Math.round(totalRequiredMinutes / 60)}h required for remaining syllabus vs ${Math.round(totalAvailableMinutes / 60)}h available before exams. High-priority and weak-confidence modules have been prioritized first; ${unscheduledTopics.length} lower-priority topic(s) flagged for rapid review.`
    };
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
    workloadDeficit,
    totalTopics,
    completedTopics: alreadyCompletedCount,
    totalHoursPlanned,
    completedHours: 0,
    streakDays: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

/**
 * Rebalances schedule when a student marks items as needing review, partially completed, or reports missed days.
 */
export function rebalanceSchedule(
  currentPlan: ExamStudyPlan,
  availability: StudyAvailability,
  options?: { missedDate?: string; unplannedBreak?: boolean }
): ExamStudyPlan {
  // Collect all uncompleted topics
  const completedTopics: ScheduledStudySession[] = [];
  const uncompletedTopics: ScheduledStudySession[] = [];

  const todayStr = new Date().toISOString().slice(0, 10);
  const targetCutoff = options?.missedDate || todayStr;

  for (const day of currentPlan.days) {
    for (const sess of day.sessions) {
      if (sess.status === 'completed') {
        completedTopics.push(sess);
      } else {
        uncompletedTopics.push(sess);
      }
    }
  }

  // Update subjects' topic completion status based on completed sessions
  const updatedSubjects: ExamSubject[] = currentPlan.subjects.map(sub => {
    const subCompletedTopics = new Set(
      completedTopics.filter(c => c.subjectId === sub.id).map(c => c.topicId.replace('-rev', ''))
    );
    return {
      ...sub,
      topics: sub.topics.map(t => ({
        ...t,
        isCompleted: t.isCompleted || subCompletedTopics.has(t.id)
      }))
    };
  });

  // Re-run scheduler with remaining uncompleted topics from today forward
  const updated = generateIntelligentSchedule({
    studentId: currentPlan.studentId,
    examName: currentPlan.examName,
    startDate: targetCutoff,
    subjects: updatedSubjects,
    availability
  });

  // Preserve completed count & hours
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

export function getSafeGeminiModel(preferred: string = 'gemini-3.1-flash-lite'): string {
  const envModel = process.env.GEMINI_MODEL;
  if (
    envModel &&
    !envModel.includes('2.5') &&
    !envModel.includes('2.0') &&
    !envModel.includes('1.5')
  ) {
    return envModel;
  }
  return preferred;
}

/**
 * Calls Gemini AI to generate customized study schedule advice and strategic commentary.
 */
export async function getGeminiScheduleAdvice(plan: ExamStudyPlan): Promise<string[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim().length === 0) {
    return plan.aiStrategyTips || generateDefaultStrategyTips(plan.subjects, plan.availability, plan.totalHoursPlanned);
  }

  let timer: NodeJS.Timeout | null = null;
  try {
    const ai = new GoogleGenAI({
      apiKey: apiKey.trim(),
      httpOptions: {
        timeout: 15000
      }
    });
    const modelName = getSafeGeminiModel('gemini-3.1-flash-lite');
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

    const timeoutPromise = new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error('Gemini API timeout')), 15000);
    });

    const generatePromise = ai.models.generateContent({
      model: modelName,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: 'application/json',
        temperature: 0.5
      }
    });

    const response = await Promise.race([generatePromise, timeoutPromise]);
    if (timer) clearTimeout(timer);

    const text = response.text?.trim() || '';
    const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map(String);
    }
  } catch (err: any) {
    if (timer) clearTimeout(timer);
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

  if (apiKey && apiKey.trim().length > 0) {
    let timer: NodeJS.Timeout | null = null;
    try {
      const ai = new GoogleGenAI({
        apiKey: apiKey.trim(),
        httpOptions: {
          timeout: 15000
        }
      });
      const modelName = getSafeGeminiModel('gemini-3.1-flash-lite');
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

      const timeoutPromise = new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error('Gemini API timeout')), 15000);
      });

      const generatePromise = ai.models.generateContent({
        model: modelName,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          responseMimeType: 'application/json',
          temperature: 0.5
        }
      });

      const response = await Promise.race([generatePromise, timeoutPromise]);
      if (timer) clearTimeout(timer);

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
      if (timer) clearTimeout(timer);
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

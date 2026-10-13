import {
  PredictionInput,
  PredictionResult,
  StudentRecord,
  SavedPrediction,
  ModelMetrics,
  DashboardSummary,
  VerifiedCourse,
  AcademicRecord,
  StudyPlannerTask,
  GoalItem,
  RoadmapTopic,
  ExamReadinessAssessment,
  NotificationItem,
  AuthUser,
  ExamStudyPlan,
  ExamSubject,
  StudyAvailability
} from '../types';

const API_BASE = '/api';

export function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('edupredict_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// -------------------------------------------------------------
// AUTHENTICATION SERVICES
// -------------------------------------------------------------
export async function fetchAuthConfig(): Promise<{ googleClientId: string; isConfigured: boolean }> {
  try {
    const res = await fetch(`${API_BASE}/auth/config`);
    if (!res.ok) return { googleClientId: '', isConfigured: false };
    return res.json();
  } catch {
    return { googleClientId: '', isConfigured: false };
  }
}

export async function loginWithGoogleCredential(credential: string): Promise<{ user: AuthUser; token: string; isNewUser: boolean }> {
  const res = await fetch(`${API_BASE}/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ credential })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Google authentication failed');
  }

  const data = await res.json();
  if (data.token) {
    localStorage.setItem('edupredict_token', data.token);
  }
  return data;
}

export async function loginWithEmailPassword(email: string, password: string): Promise<{ user: AuthUser; token: string; isNewUser: boolean }> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Invalid credentials');
  }

  const data = await res.json();
  if (data.token) {
    localStorage.setItem('edupredict_token', data.token);
  }
  return data;
}

export async function registerWithEmailPassword(name: string, email: string, password: string): Promise<{ user: AuthUser; token: string; isNewUser: boolean }> {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Registration failed');
  }

  const data = await res.json();
  if (data.token) {
    localStorage.setItem('edupredict_token', data.token);
  }
  return data;
}

export async function fetchCurrentUser(): Promise<AuthUser | null> {
  const token = localStorage.getItem('edupredict_token');
  if (!token) return null;

  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) {
      localStorage.removeItem('edupredict_token');
      return null;
    }
    const data = await res.json();
    return data.user;
  } catch {
    return null;
  }
}

export async function updateUserAcademicProfile(updates: {
  name?: string;
  education_level?: string;
  institution?: string;
  stream_or_branch?: string;
}): Promise<AuthUser> {
  const res = await fetch(`${API_BASE}/auth/profile`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(updates)
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to update user profile');
  }

  const data = await res.json();
  return data.user;
}

export async function logoutUser(): Promise<void> {
  try {
    await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
  } catch {
    // Ignore network error on logout
  } finally {
    localStorage.removeItem('edupredict_token');
  }
}

// -------------------------------------------------------------
// CORE ACADEMIC & PREDICTION SERVICES
// -------------------------------------------------------------
export async function checkApiHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/health`);
    return res.ok;
  } catch {
    return false;
  }
}

export async function fetchCourses(level?: string): Promise<VerifiedCourse[]> {
  const url = level ? `${API_BASE}/courses?level=${encodeURIComponent(level)}` : `${API_BASE}/courses`;
  const res = await fetch(url, { headers: getAuthHeaders() });
  if (!res.ok) {
    throw new Error('Failed to load courses catalogue');
  }
  return res.json();
}

export async function predictPerformance(input: PredictionInput): Promise<PredictionResult> {
  const res = await fetch(`${API_BASE}/predict`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(input)
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Prediction failed with status ${res.status}`);
  }

  return res.json();
}

export async function runWhatIfAnalysis(baseline: any, hypothetical: any): Promise<{
  baseline: PredictionResult;
  hypothetical: PredictionResult;
  deltaScore: number;
  categoryChanged: boolean;
  disclaimer: string;
}> {
  const res = await fetch(`${API_BASE}/what-if`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ baseline, hypothetical })
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to calculate What-If scenario');
  }

  return res.json();
}

export async function fetchStudents(): Promise<StudentRecord[]> {
  const res = await fetch(`${API_BASE}/students`, { headers: getAuthHeaders() });
  if (!res.ok) {
    throw new Error('Failed to fetch students');
  }
  return res.json();
}

export async function createStudent(student: {
  id: string;
  name: string;
  education_level: string;
  stream_or_branch?: string;
  course: string;
  attendance: number;
  study_hours: number;
  previous_marks: number;
  assignment_score: number;
  practical_score?: number;
}): Promise<void> {
  const res = await fetch(`${API_BASE}/students`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      student_id: student.id,
      student_name: student.name,
      education_level: student.education_level,
      stream_or_branch: student.stream_or_branch,
      course: student.course,
      attendance: student.attendance,
      study_hours: student.study_hours,
      previous_marks: student.previous_marks,
      assignment_score: student.assignment_score,
      practical_score: student.practical_score
    })
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to add student');
  }
}

export async function fetchPredictions(): Promise<SavedPrediction[]> {
  const res = await fetch(`${API_BASE}/predictions`, { headers: getAuthHeaders() });
  if (!res.ok) {
    throw new Error('Failed to fetch predictions history');
  }
  return res.json();
}

export async function savePrediction(pred: {
  student_id: string;
  student_name: string;
  education_level: string;
  stream_or_branch?: string;
  course: string;
  model_used: string;
  attendance: number;
  study_hours: number;
  previous_marks: number;
  assignment_score: number;
  practical_score?: number;
  predicted_category: string;
  confidence: number;
  projected_score: number;
  recommendations: string[];
  study_plan?: any;
  recommended_courses?: any[];
  advisor?: string;
}): Promise<{ id: number }> {
  const res = await fetch(`${API_BASE}/predictions`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(pred)
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to save prediction');
  }

  return res.json();
}

export async function deletePrediction(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/predictions/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  if (!res.ok) {
    throw new Error('Failed to delete prediction record');
  }
}

export async function fetchAcademicRecords(studentId?: string): Promise<AcademicRecord[]> {
  const url = studentId ? `${API_BASE}/academic-records?student_id=${encodeURIComponent(studentId)}` : `${API_BASE}/academic-records`;
  const res = await fetch(url, { headers: getAuthHeaders() });
  if (!res.ok) {
    throw new Error('Failed to fetch academic records');
  }
  return res.json();
}

export async function addAcademicRecord(record: {
  student_id: string;
  subject: string;
  marks: number;
  attendance: number;
  assignment_score: number;
  assessment_type?: string;
  recorded_date?: string;
  notes?: string;
}): Promise<{ id: number }> {
  const res = await fetch(`${API_BASE}/academic-records`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(record)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to add academic record');
  }
  return res.json();
}

export async function fetchPlannerTasks(studentId?: string): Promise<StudyPlannerTask[]> {
  const url = studentId ? `${API_BASE}/planner-tasks?student_id=${encodeURIComponent(studentId)}` : `${API_BASE}/planner-tasks`;
  const res = await fetch(url, { headers: getAuthHeaders() });
  if (!res.ok) {
    throw new Error('Failed to load study planner tasks');
  }
  return res.json();
}

export async function addPlannerTask(task: {
  student_id: string;
  title: string;
  subject: string;
  day_of_week?: string;
  time_slot?: string;
  duration_minutes?: number;
  priority?: 'high' | 'medium' | 'low';
  status?: 'pending' | 'completed' | 'rescheduled';
}): Promise<{ id: number }> {
  const res = await fetch(`${API_BASE}/planner-tasks`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(task)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to save planner task');
  }
  return res.json();
}

export async function updatePlannerTaskStatus(id: number, status: 'pending' | 'completed' | 'rescheduled'): Promise<void> {
  const res = await fetch(`${API_BASE}/planner-tasks/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status })
  });
  if (!res.ok) {
    throw new Error('Failed to update planner task');
  }
}

export async function deletePlannerTask(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/planner-tasks/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  if (!res.ok) {
    throw new Error('Failed to delete planner task');
  }
}

// -------------------------------------------------------------
// AI Exam Scheduler & Personalized Study Planner API
// -------------------------------------------------------------
export async function fetchExamStudyPlan(studentId?: string): Promise<ExamStudyPlan | null> {
  const url = studentId ? `${API_BASE}/planner/exam-plan?student_id=${encodeURIComponent(studentId)}` : `${API_BASE}/planner/exam-plan`;
  const res = await fetch(url, { headers: getAuthHeaders() });
  if (!res.ok) {
    throw new Error('Failed to fetch exam study plan');
  }
  const data = await res.json();
  return data.plan || null;
}

export async function generateExamStudyPlan(payload: {
  student_id?: string;
  exam_name: string;
  start_date?: string;
  subjects: ExamSubject[];
  availability: StudyAvailability;
}): Promise<ExamStudyPlan> {
  const res = await fetch(`${API_BASE}/planner/generate`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to generate exam study plan');
  }
  const data = await res.json();
  return data.plan;
}

export async function updateExamSessionStatus(
  planId: number,
  sessionId: string,
  status: 'pending' | 'completed' | 'needs_review'
): Promise<any> {
  const res = await fetch(`${API_BASE}/planner/exam-session/${encodeURIComponent(sessionId)}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ plan_id: planId, status })
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to update session status');
  }
  return res.json();
}

export async function rebalanceExamSchedule(
  planId: number,
  plan: ExamStudyPlan,
  availability: StudyAvailability
): Promise<ExamStudyPlan> {
  const res = await fetch(`${API_BASE}/planner/rebalance`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ plan_id: planId, plan, availability })
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to rebalance schedule');
  }
  const data = await res.json();
  return data.plan;
}

export async function fetchAIScheduleAdvice(plan: ExamStudyPlan): Promise<string[]> {
  const res = await fetch(`${API_BASE}/planner/ai-advice`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ plan })
  });
  if (!res.ok) {
    throw new Error('Failed to fetch AI schedule advice');
  }
  const data = await res.json();
  return data.tips || [];
}

export async function fetchTopicAIAssistance(payload: {
  subjectName: string;
  topicName: string;
  difficulty?: string;
  confidence?: string;
}): Promise<{
  summary: string;
  activeRecallQuestions: string[];
  examPitfall: string;
  source: string;
}> {
  const res = await fetch(`${API_BASE}/planner/ask-topic`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    throw new Error('Failed to retrieve AI topic advice');
  }
  return res.json();
}

export async function deleteExamStudyPlan(planId: number): Promise<void> {
  const res = await fetch(`${API_BASE}/planner/exam-plan/${planId}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  if (!res.ok) {
    throw new Error('Failed to delete exam study plan');
  }
}

export async function fetchGoals(studentId?: string): Promise<GoalItem[]> {
  const url = studentId ? `${API_BASE}/goals?student_id=${encodeURIComponent(studentId)}` : `${API_BASE}/goals`;
  const res = await fetch(url, { headers: getAuthHeaders() });
  if (!res.ok) {
    throw new Error('Failed to load goals');
  }
  return res.json();
}

export async function addGoal(goal: {
  student_id: string;
  title: string;
  category?: 'score' | 'course' | 'roadmap' | 'study_habit' | 'exam';
  target_date?: string;
  progress_percent?: number;
  is_completed?: boolean;
}): Promise<{ id: number }> {
  const res = await fetch(`${API_BASE}/goals`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(goal)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to create goal');
  }
  return res.json();
}

export async function updateGoalProgress(id: number, progress_percent: number, is_completed: boolean): Promise<void> {
  const res = await fetch(`${API_BASE}/goals/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ progress_percent, is_completed })
  });
  if (!res.ok) {
    throw new Error('Failed to update goal');
  }
}

export async function fetchRoadmapTopics(studentId?: string): Promise<RoadmapTopic[]> {
  const url = studentId ? `${API_BASE}/roadmap-topics?student_id=${encodeURIComponent(studentId)}` : `${API_BASE}/roadmap-topics`;
  const res = await fetch(url, { headers: getAuthHeaders() });
  if (!res.ok) {
    throw new Error('Failed to load roadmap topics');
  }
  return res.json();
}

export async function updateRoadmapTopicStatus(id: number, status: 'not_started' | 'in_progress' | 'completed'): Promise<void> {
  const res = await fetch(`${API_BASE}/roadmap-topics/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status })
  });
  if (!res.ok) {
    throw new Error('Failed to update roadmap topic');
  }
}

export async function fetchSavedCourses(studentId?: string): Promise<{ course_id: string; status: string }[]> {
  const url = studentId ? `${API_BASE}/saved-courses?student_id=${encodeURIComponent(studentId)}` : `${API_BASE}/saved-courses`;
  const res = await fetch(url, { headers: getAuthHeaders() });
  if (!res.ok) {
    throw new Error('Failed to fetch saved courses');
  }
  return res.json();
}

export async function toggleSaveCourse(student_id: string, course_id: string, status: string = 'saved'): Promise<{ status: string; isSaved: boolean }> {
  const res = await fetch(`${API_BASE}/saved-courses/toggle`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ student_id, course_id, status })
  });
  if (!res.ok) {
    throw new Error('Failed to toggle saved course');
  }
  return res.json();
}

export async function fetchExamReadiness(studentId?: string): Promise<ExamReadinessAssessment[]> {
  const url = studentId ? `${API_BASE}/exam-readiness?student_id=${encodeURIComponent(studentId)}` : `${API_BASE}/exam-readiness`;
  const res = await fetch(url, { headers: getAuthHeaders() });
  if (!res.ok) {
    throw new Error('Failed to load exam readiness assessment');
  }
  return res.json();
}

export async function addExamReadiness(assessment: {
  student_id: string;
  exam_name: string;
  exam_date?: string;
  syllabus_completion: number;
  practice_score: number;
  revision_progress: number;
}): Promise<{ id: number; readiness_score: number; readiness_tier: string }> {
  const res = await fetch(`${API_BASE}/exam-readiness`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(assessment)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to submit exam readiness assessment');
  }
  return res.json();
}

export async function fetchNotifications(studentId?: string): Promise<NotificationItem[]> {
  const url = studentId ? `${API_BASE}/notifications?student_id=${encodeURIComponent(studentId)}` : `${API_BASE}/notifications`;
  const res = await fetch(url, { headers: getAuthHeaders() });
  if (!res.ok) {
    throw new Error('Failed to load notifications');
  }
  return res.json();
}

export async function markNotificationAsRead(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
    method: 'PATCH',
    headers: getAuthHeaders()
  });
  if (!res.ok) {
    throw new Error('Failed to update notification');
  }
}

export async function counselorChat(message: string, studentContext?: any): Promise<{ reply: string; source: string }> {
  const res = await fetch(`${API_BASE}/counselor/chat`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ message, student_context: studentContext })
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Counselor service is unavailable');
  }
  return res.json();
}

export async function fetchModelMetrics(): Promise<ModelMetrics> {
  const res = await fetch(`${API_BASE}/model-metrics`, { headers: getAuthHeaders() });
  if (!res.ok) {
    throw new Error('Failed to fetch model metrics');
  }
  return res.json();
}

export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  const res = await fetch(`${API_BASE}/dashboard-summary`, { headers: getAuthHeaders() });
  if (!res.ok) {
    throw new Error('Failed to fetch dashboard summary');
  }
  return res.json();
}

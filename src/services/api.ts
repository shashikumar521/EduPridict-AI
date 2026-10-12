import {
  PredictionInput,
  PredictionResult,
  StudentRecord,
  SavedPrediction,
  ModelMetrics,
  DashboardSummary,
  VerifiedCourse
} from '../types';

const API_BASE = '/api';

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
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to load courses catalogue');
  }
  return res.json();
}

export async function predictPerformance(input: PredictionInput): Promise<PredictionResult> {
  const res = await fetch(`${API_BASE}/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Prediction failed with status ${res.status}`);
  }

  return res.json();
}

export async function fetchStudents(): Promise<StudentRecord[]> {
  const res = await fetch(`${API_BASE}/students`);
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
    headers: { 'Content-Type': 'application/json' },
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
  const res = await fetch(`${API_BASE}/predictions`);
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
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(pred)
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to save prediction');
  }

  return res.json();
}

export async function fetchModelMetrics(): Promise<ModelMetrics> {
  const res = await fetch(`${API_BASE}/model-metrics`);
  if (!res.ok) {
    throw new Error('Failed to fetch model metrics');
  }
  return res.json();
}

export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  const res = await fetch(`${API_BASE}/dashboard-summary`);
  if (!res.ok) {
    throw new Error('Failed to fetch dashboard summary');
  }
  return res.json();
}

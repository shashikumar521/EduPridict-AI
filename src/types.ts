export type SectionId =
  | 'home'
  | 'login'
  | 'dashboard'
  | 'predict'
  | 'whatif'
  | 'students'
  | 'progress'
  | 'subjects'
  | 'planner'
  | 'roadmap'
  | 'courses'
  | 'readiness'
  | 'counselor'
  | 'goals'
  | 'history'
  | 'analytics'
  | 'reports'
  | 'notifications'
  | 'settings'
  | 'about';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  picture?: string;
  education_level?: string;
  institution?: string;
  stream_or_branch?: string;
  created_at?: string;
}

export type EducationLevelId =
  | 'primary_school'
  | 'middle_school'
  | 'secondary_school'
  | 'higher_secondary'
  | 'diploma'
  | 'btech'
  | 'undergraduate_other'
  | 'mtech'
  | 'postgraduate_other'
  | 'other';

export interface EducationLevelConfig {
  id: EducationLevelId;
  label: string;
  category: 'School Education' | 'Intermediate & Diploma' | 'Undergraduate' | 'Postgraduate' | 'Other';
  description: string;
  subLevelLabel: string;
  subLevelOptions: string[];
  streamOrBranchLabel?: string;
  streamOrBranchOptions?: string[];
  courseTerm: string;
  suggestedCourses: string[];
  previousMarksLabel: string;
  previousMarksExplanation: string;
  assignmentLabel: string;
  assignmentExplanation: string;
  practicalLabel?: string;
  practicalExplanation?: string;
  extraFieldLabel?: string;
  extraFieldExplanation?: string;
}

export interface VerifiedCourse {
  id: string;
  name: string;
  provider: string;
  educationLevels: EducationLevelId[];
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  outcome: string;
  url: string;
  pricing: '100% Free' | 'Free to Audit' | 'Free Official Courseware';
  savedStatus?: 'not_saved' | 'saved' | 'in_progress' | 'completed';
}

export interface PersonalizedStudyPlan {
  primaryGoal: string;
  weeklyTargetHours: number;
  dailyStudyRoutine: string;
  focusTopics: string[];
  revisionStrategy: string;
  assignmentAction: string;
  nextAssessmentTarget: string;
  recommendedCourses: VerifiedCourse[];
}

export interface StudentRecord {
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
  predicted_risk: 'critical' | 'borderline' | 'good';
  is_demo: boolean;
  created_at: string;
}

export interface PredictionInput {
  student_id: string;
  student_name?: string;
  education_level: EducationLevelId;
  sub_level?: string;
  stream_or_branch?: string;
  course?: string;
  attendance: number;       // 0 - 100
  study_hours: number;      // 0 - 40 hrs/week
  previous_marks: number;   // 0 - 100
  assignment_score: number; // 0 - 100
  practical_score?: number; // 0 - 100
  extra_academic_score?: number; // 0 - 100
  model_type?: 'rf' | 'dt' | 'lr';
}

export interface FeatureAttribution {
  feature: string;
  value: string;
  impact: number;
  severity: 'high' | 'moderate' | 'positive';
}

export interface PredictionResult {
  student_id: string;
  student_name: string;
  education_level: EducationLevelId;
  education_level_label: string;
  sub_level?: string;
  stream_or_branch?: string;
  course: string;
  model_used: string;
  predicted_category: 'High Performance' | 'Moderate Performance' | 'At-Risk';
  confidence: number;
  projected_score: number;
  score_range: string;
  urgency: 'Immediate Triage' | 'Monitoring' | 'On Track';
  strengths: string[];
  improvements: string[];
  attributions: FeatureAttribution[];
  recommendations: string[];
  study_plan: PersonalizedStudyPlan;
  recommended_courses: VerifiedCourse[];
  limitations_note: string;
  timestamp: string;
}

export interface SavedPrediction {
  id: number;
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
  study_plan?: PersonalizedStudyPlan;
  recommended_courses?: VerifiedCourse[];
  advisor: string;
  created_at: string;
  is_demo: boolean;
}

export interface AcademicRecord {
  id: number;
  student_id: string;
  subject: string;
  marks: number;
  attendance: number;
  assignment_score: number;
  assessment_type: string;
  recorded_date: string;
  notes?: string;
}

export interface StudyPlannerTask {
  id: number;
  student_id: string;
  title: string;
  subject: string;
  day_of_week: string;
  time_slot: string;
  duration_minutes: number;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'completed' | 'rescheduled';
  created_at: string;
}

export type TopicDifficulty = 'Easy' | 'Medium' | 'Hard';
export type TopicConfidence = 'Good' | 'Average' | 'Weak';
export type TopicWeightage = 'High' | 'Medium' | 'Low';
export type SessionType = 'concept' | 'problem_solving' | 'revision' | 'mock_test' | 'spaced_recall';

export interface ExamTopic {
  id: string;
  name: string;
  unitOrChapter?: string;
  difficulty: TopicDifficulty;
  confidence: TopicConfidence;
  weightage: TopicWeightage;
  estimatedMinutes: number;
}

export interface ExamSubject {
  id: string;
  name: string;
  examDate: string; // YYYY-MM-DD
  topics: ExamTopic[];
}

export interface StudyAvailability {
  dailyHoursWeekday: number;
  dailyHoursWeekend: number;
  preferredTimeSlot: 'morning' | 'afternoon' | 'evening' | 'night' | 'flexible';
  restDays: string[];
  revisionBufferDays: number;
}

export interface ScheduledStudySession {
  id: string;
  subjectId: string;
  subjectName: string;
  topicId: string;
  topicName: string;
  unitOrChapter?: string;
  date: string; // YYYY-MM-DD
  dayOfWeek: string;
  durationMinutes: number;
  sessionType: SessionType;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'completed' | 'needs_review';
  completedAt?: string;
  aiTip?: string;
}

export interface DaySchedule {
  date: string; // YYYY-MM-DD
  dayOfWeek: string;
  isRestDay: boolean;
  totalPlannedMinutes: number;
  sessions: ScheduledStudySession[];
  examOnThisDay?: {
    subjectName: string;
  };
}

export interface ExamStudyPlan {
  id?: number;
  studentId: string;
  examName: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  subjects: ExamSubject[];
  availability: StudyAvailability;
  days: DaySchedule[];
  aiStrategyTips: string[];
  totalTopics: number;
  completedTopics: number;
  totalHoursPlanned: number;
  completedHours: number;
  streakDays: number;
  createdAt: string;
  updatedAt: string;
}

export interface GoalItem {
  id: number;
  student_id: string;
  title: string;
  category: 'score' | 'course' | 'roadmap' | 'study_habit' | 'exam';
  target_date: string;
  progress_percent: number;
  is_completed: boolean;
  created_at: string;
}

export interface RoadmapTopic {
  id: number;
  student_id: string;
  title: string;
  phase: 'foundations' | 'improvements' | 'practice' | 'intermediate' | 'advanced';
  subject: string;
  status: 'not_started' | 'in_progress' | 'completed';
  estimated_hours: number;
}

export interface ExamReadinessAssessment {
  id: number;
  student_id: string;
  exam_name: string;
  exam_date: string;
  syllabus_completion: number;
  practice_score: number;
  revision_progress: number;
  readiness_score: number;
  readiness_tier: 'High Readiness' | 'Moderate Readiness' | 'Needs Urgent Preparation';
  created_at: string;
}

export interface NotificationItem {
  id: number;
  student_id: string;
  title: string;
  message: string;
  type: 'exam' | 'assignment' | 'study_session' | 'course';
  scheduled_for: string;
  is_read: boolean;
  created_at: string;
}

export interface CounselorChatMessage {
  id: string;
  sender: 'user' | 'counselor';
  text: string;
  timestamp: string;
  suggestedAction?: {
    label: string;
    section: SectionId;
  };
}

export interface ModelMetrics {
  model_name: string;
  dataset_name: string;
  total_samples: number;
  train_samples: number;
  test_samples: number;
  cohort_coverage: string;
  dataset_sources: Array<{
    name: string;
    description: string;
    citation: string;
    sample_count: number;
    education_levels_covered: string[];
  }>;
  features: Array<{
    name: string;
    importance: number;
    description: string;
  }>;
  evaluation_metrics: {
    overall_accuracy: number;
    macro_precision: number;
    at_risk_recall: number;
    weighted_f1: number;
    multiclass_auc: number;
    cross_validation_folds: number;
    cv_accuracy_mean: number;
    cv_accuracy_std: number;
  };
  confusion_matrix: {
    classes: string[];
    matrix: number[][];
    sample_breakdown: {
      high_performance_true_positives: number;
      moderate_true_positives: number;
      at_risk_true_positives: number;
      at_risk_recall_percentage: number;
    };
  };
  model_comparison: Array<{
    model: string;
    accuracy: number;
    at_risk_recall: number;
    precision: number;
    f1: number;
    status: string;
    notes: string;
  }>;
  plain_english_explanations: {
    accuracy: string;
    at_risk_recall: string;
    macro_precision: string;
    weighted_f1: string;
    confusion_matrix: string;
  };
}

export interface DashboardSummary {
  totalStudents: number;
  predictionsCount: number;
  highPerformanceCount: number;
  highPerformancePercentage: number;
  studentsNeedingSupport: number;
  recentPredictions: SavedPrediction[];
  activeGoalsCount?: number;
  upcomingExamsCount?: number;
  averageAttendance?: number;
  studyPlanCompletion?: number;
  hasStudyPlan?: boolean;
  academicRecordsCount?: number;
}

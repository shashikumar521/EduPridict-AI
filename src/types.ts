export type SectionId =
  | 'home'
  | 'login'
  | 'analysis'
  | 'scheduler'
  | 'learn'
  | 'export'
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
  phone_number?: string;
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
  duration?: string;
  skills?: string[];
  verifiedProvider?: boolean;
  providerType?: 'university' | 'industry' | 'open_learning';
  matchReason?: string;
}

export interface CoursePreferences {
  targetSkills: string[];
  preferredDuration: 'all' | 'short' | 'medium' | 'comprehensive';
  preferredProviderType: 'all' | 'university' | 'tech_industry';
  learningGoal: string;
  focusSubjects: string[];
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
  isCompleted?: boolean;
}

export interface ExamSubject {
  id: string;
  name: string;
  examType?: string;
  examDate: string; // YYYY-MM-DD
  examTime?: string;
  topics: ExamTopic[];
}

export interface StudyAvailability {
  dailyHoursWeekday: number;
  dailyHoursWeekend: number;
  dailyHours?: number;
  dailyMinutes?: number;
  preferredTimeSlot: 'morning' | 'afternoon' | 'evening' | 'night' | 'flexible';
  startTime?: string; // e.g. "09:00 AM" or "09:00"
  endTime?: string;   // e.g. "09:30 PM" or "21:30"
  sessionDurationMinutes?: number; // e.g. 25, 40, 50, 60
  breakDurationMinutes?: number;   // e.g. 5, 10, 15
  restDays: string[];
  revisionBufferDays: number;
  commitmentsNote?: string;
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
  startTime?: string;
  endTime?: string;
  timeSlot?: string;
  sessionType: SessionType;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'completed' | 'partially_completed' | 'skipped' | 'needs_review';
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

export interface WorkloadDeficitInfo {
  hasDeficit: boolean;
  totalRequiredMinutes: number;
  totalAvailableMinutes: number;
  deficitMinutes: number;
  unscheduledTopicsCount: number;
  priorityNotice: string;
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
  workloadDeficit?: WorkloadDeficitInfo;
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

// -------------------------------------------------------------
// CORE ACADEMIC PROFILE & ONBOARDING TYPES
// -------------------------------------------------------------
export interface SubjectScoreItem {
  id: string;
  name: string;
  marks_obtained: number;
  max_marks: number;
  percentage: number;
  previous_marks?: number;
  internal_marks?: number;
  assignment_marks?: number;
  practical_marks?: number;
  attendance_percent?: number;
  difficult_topics?: string[];
  topics_to_improve?: string[];
}

export interface UpcomingExamItem {
  id: string;
  subject_name: string;
  exam_date: string; // YYYY-MM-DD
  exam_time?: string;
  priority: 'high' | 'medium' | 'low';
  syllabus_completion_percent: number;
  notes?: string;
  status: 'upcoming' | 'completed';
}

export interface StudentAcademicProfile {
  user_id: string;
  full_name: string;
  institution: string;
  course_degree: string;
  department_branch: string;
  academic_year: string;
  semester: string;
  grading_system: 'percentage' | 'gpa_10' | 'gpa_4' | 'letter';
  preferred_language: string;
  subjects: SubjectScoreItem[];
  overall_attendance: number;
  daily_study_hours_weekday: number;
  daily_study_hours_weekend: number;
  upcoming_exams: UpcomingExamItem[];
  weak_topics: string[];
  target_goals: string[];
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

// -------------------------------------------------------------
// CORE ACADEMIC ANALYSIS TYPES
// -------------------------------------------------------------
export interface AcademicRecommendationItem {
  subject_name: string;
  weak_topic: string;
  current_percentage: number;
  what_needs_improvement: string;
  why_it_matters: string;
  what_to_study: string;
  learning_resource: {
    title: string;
    provider: string;
    url: string;
  };
  practical_activity: {
    type: string;
    topic: string;
    label: string;
  };
  suggested_time_allocation: string;
  measurement_metric: string;
}

export interface AcademicAnalysisResponse {
  status: 'success' | 'needs_onboarding';
  message?: string;
  profile?: {
    full_name: string;
    institution: string;
    course_degree: string;
    academic_year: string;
    semester: string;
    grading_system: string;
  };
  overview?: {
    academic_score: number;
    standing: string;
    standing_tier: 'distinction' | 'good' | 'moderate' | 'critical';
    subject_average: number;
    overall_attendance: number;
    total_subjects: number;
    strong_subjects_count: number;
    subjects_needing_attention_count: number;
  };
  scoring_methodology?: {
    scale: string;
    formula: string;
    weights: {
      subject_marks: string;
      attendance: string;
      assignments_and_practicals: string;
    };
    explanation: string;
  };
  subjects?: Array<{
    id: string;
    name: string;
    marks_obtained: number;
    max_marks: number;
    percentage: number;
    attendance: number;
    status: 'Strong' | 'Good' | 'Needs Attention' | 'Critical';
    difficult_topics: string[];
    topics_to_improve: string[];
  }>;
  strongest_subjects?: Array<any>;
  subjects_needing_attention?: Array<any>;
  personalized_recommendations?: AcademicRecommendationItem[];
  improvement_plan?: Array<{
    id: string;
    day: string;
    topic: string;
    subject: string;
    duration_minutes: number;
    resource_url: string;
    action: string;
    status: 'pending' | 'completed';
  }>;
  recent_quiz_progress?: Array<any>;
}

// -------------------------------------------------------------
// CORE LEARN & PRACTICE TYPES
// -------------------------------------------------------------
export interface QuizQuestion {
  id: number;
  question: string;
  options: [string, string, string, string];
  correctAnswer?: number;
  explanation?: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: 'Fundamentals' | 'Definition' | 'Conceptual' | 'Application' | 'Problem-Solving' | 'Advanced';
}

export interface TopicTheory {
  title: string;
  introduction: string;
  fundamental_concepts: Array<{ title: string; explanation: string }>;
  definitions: Array<{ term: string; definition: string }>;
  detailed_explanations: Array<{ heading: string; body: string; codeOrFormula?: string }>;
  step_by_step_examples: Array<{ problem: string; steps: string[]; solution: string }>;
  applications: string[];
  common_mistakes: Array<{ mistake: string; correction: string }>;
  revision_key_points: string[];
  resources: Array<{ title: string; type: string; url: string; note: string }>;
}

export interface QuizSubmissionResult {
  status: 'success';
  attempt_id: number;
  topic: string;
  score: number;
  total_questions: number;
  percentage: number;
  correct_count: number;
  incorrect_count: number;
  unanswered_count: number;
  mastery_verdict: string;
  difficulty_breakdown: {
    easy: { total: number; correct: number };
    medium: { total: number; correct: number };
    hard: { total: number; correct: number };
  };
  weak_categories: string[];
  detailed_review: Array<{
    id: number;
    question: string;
    options: [string, string, string, string];
    studentAnswer: number | null;
    correctAnswer: number;
    isCorrect: boolean;
    explanation: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    category: string;
  }>;
  recommended_action: {
    review_mistakes: string;
    next_step: string;
  };
}

export interface QuizAttemptRecord {
  id: number;
  user_id: string;
  topic: string;
  score: number;
  total_questions: number;
  percentage: number;
  time_spent_seconds: number;
  completed_at: string;
}


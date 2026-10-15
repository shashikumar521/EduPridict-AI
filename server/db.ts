/**
 * EduPredict AI - Persistent SQLite Database Manager
 * Uses SQL.js (WASM SQLite engine) persisted to data/edupredict.sqlite
 */

import type { Database, SqlJsStatic } from 'sql.js';
// @ts-ignore
import initSqlJsInline from 'sql.js/dist/sql-wasm-inline.js';
import initSqlJsDefault from 'sql.js';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface User {
  id: string;
  google_id?: string;
  email: string;
  phone_number?: string;
  name: string;
  picture?: string;
  password_hash?: string;
  education_level?: string;
  institution?: string;
  stream_or_branch?: string;
  created_at: string;
  last_login_at: string;
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

export interface PredictionRecord {
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
  study_plan?: any;
  recommended_courses?: any[];
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

function isServerlessRuntime(): boolean {
  return Boolean(
    process.env.VERCEL ||
    process.env.VERCEL_ENV ||
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    process.env.LAMBDA_TASK_ROOT
  );
}

function getDataDirectory(): string {
  if (isServerlessRuntime()) {
    return path.join('/tmp', 'edupredict');
  }
  const localDir = path.resolve(process.cwd(), 'data');
  try {
    if (!fs.existsSync(localDir)) {
      fs.mkdirSync(localDir, { recursive: true });
    }
    const testFile = path.join(localDir, '.write_test');
    fs.writeFileSync(testFile, '1');
    fs.unlinkSync(testFile);
    return localDir;
  } catch {
    return path.join('/tmp', 'edupredict');
  }
}

function getDatabaseFilePath(): string {
  return path.join(getDataDirectory(), 'edupredict.sqlite');
}

let dbInstance: Database | null = null;
let sqlEnginePromise: Promise<SqlJsStatic> | null = null;

async function loadSqlJsEngine(): Promise<SqlJsStatic> {
  if (sqlEnginePromise) return sqlEnginePromise;

  sqlEnginePromise = (async () => {
    // 1. Try inline WASM (built-in base64 WASM binary; works 100% on Vercel Serverless / Lambda without external .wasm file)
    try {
      const initFn =
        typeof initSqlJsInline === 'function'
          ? initSqlJsInline
          : (initSqlJsInline as any)?.default;
      if (typeof initFn === 'function') {
        const engine = await initFn();
        if (engine && typeof engine.Database === 'function') {
          return engine;
        }
      }
    } catch (inlineErr) {
      console.warn('[EduPredict DB] Inline WASM loader notice:', inlineErr);
    }

    // 2. Try default loader with locateFile pointing to local filesystem locations
    try {
      const engine = await initSqlJsDefault({
        locateFile: (file: string) => {
          const possiblePaths = [
            path.resolve(process.cwd(), 'public', file),
            path.resolve(process.cwd(), 'node_modules/sql.js/dist', file),
            path.resolve('/tmp', file)
          ];
          for (const p of possiblePaths) {
            if (fs.existsSync(p)) return p;
          }
          return file;
        }
      });
      if (engine && typeof engine.Database === 'function') {
        return engine;
      }
    } catch (defaultErr) {
      console.warn('[EduPredict DB] Default sql.js loader notice:', defaultErr);
    }

    // 3. Fallback to direct init
    return await initSqlJsDefault();
  })();

  return sqlEnginePromise;
}

function ensureDataDir(): boolean {
  try {
    const dir = getDataDirectory();
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    return true;
  } catch (err) {
    console.warn('[EduPredict DB] Notice: Using in-memory storage (filesystem read-only or /tmp unavailable):', err);
    return false;
  }
}

function saveDbToFile(db: Database) {
  try {
    if (ensureDataDir()) {
      const dbPath = getDatabaseFilePath();
      const data = db.export();
      const buffer = Buffer.from(data);
      fs.writeFileSync(dbPath, buffer);
    }
  } catch (err) {
    console.warn('[EduPredict DB] Notice: In-memory snapshot active:', err);
  }
}

export async function getDb(): Promise<Database> {
  if (dbInstance) return dbInstance;

  const SQL = await loadSqlJsEngine();
  ensureDataDir();
  const dbFile = getDatabaseFilePath();

  let db: Database;
  try {
    if (fs.existsSync(dbFile)) {
      const fileBuffer = fs.readFileSync(dbFile);
      db = new SQL.Database(fileBuffer);
    } else {
      db = new SQL.Database();
    }
  } catch {
    db = new SQL.Database();
  }

  // Ensure tables exist
  db.run(`
    CREATE TABLE IF NOT EXISTS students (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      education_level TEXT NOT NULL DEFAULT 'btech',
      stream_or_branch TEXT DEFAULT '',
      course TEXT NOT NULL,
      attendance REAL NOT NULL,
      study_hours REAL NOT NULL,
      previous_marks REAL NOT NULL,
      assignment_score REAL NOT NULL,
      practical_score REAL DEFAULT 0,
      predicted_risk TEXT NOT NULL,
      is_demo INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS predictions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id TEXT NOT NULL,
      student_name TEXT NOT NULL,
      education_level TEXT NOT NULL DEFAULT 'btech',
      stream_or_branch TEXT DEFAULT '',
      course TEXT NOT NULL,
      model_used TEXT NOT NULL,
      attendance REAL NOT NULL,
      study_hours REAL NOT NULL,
      previous_marks REAL NOT NULL,
      assignment_score REAL NOT NULL,
      practical_score REAL DEFAULT 0,
      predicted_category TEXT NOT NULL,
      confidence REAL NOT NULL,
      projected_score REAL NOT NULL,
      recommendations TEXT NOT NULL,
      study_plan TEXT DEFAULT '{}',
      recommended_courses TEXT DEFAULT '[]',
      advisor TEXT NOT NULL,
      is_demo INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS academic_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id TEXT NOT NULL,
      subject TEXT NOT NULL,
      marks REAL NOT NULL,
      attendance REAL NOT NULL,
      assignment_score REAL NOT NULL,
      assessment_type TEXT NOT NULL,
      recorded_date TEXT NOT NULL,
      notes TEXT DEFAULT ''
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS study_planner_tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id TEXT NOT NULL,
      title TEXT NOT NULL,
      subject TEXT NOT NULL,
      day_of_week TEXT NOT NULL,
      time_slot TEXT NOT NULL,
      duration_minutes INTEGER NOT NULL,
      priority TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT NOT NULL
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id TEXT NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      target_date TEXT NOT NULL,
      progress_percent INTEGER NOT NULL DEFAULT 0,
      is_completed INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS roadmap_topics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id TEXT NOT NULL,
      title TEXT NOT NULL,
      phase TEXT NOT NULL,
      subject TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'not_started',
      estimated_hours REAL NOT NULL DEFAULT 2.0
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS saved_courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id TEXT NOT NULL,
      course_id TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'saved',
      saved_at TEXT NOT NULL
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS exam_readiness_assessments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id TEXT NOT NULL,
      exam_name TEXT NOT NULL,
      exam_date TEXT NOT NULL,
      syllabus_completion REAL NOT NULL,
      practice_score REAL NOT NULL,
      revision_progress REAL NOT NULL,
      readiness_score REAL NOT NULL,
      readiness_tier TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT NOT NULL,
      scheduled_for TEXT NOT NULL,
      is_read INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      google_id TEXT UNIQUE,
      email TEXT NOT NULL UNIQUE,
      phone_number TEXT UNIQUE,
      name TEXT NOT NULL,
      picture TEXT DEFAULT '',
      password_hash TEXT DEFAULT '',
      education_level TEXT DEFAULT '',
      institution TEXT DEFAULT '',
      stream_or_branch TEXT DEFAULT '',
      created_at TEXT NOT NULL,
      last_login_at TEXT NOT NULL
    );
  `);

  // Migration for existing databases: ensure phone_number column exists
  try {
    db.run("ALTER TABLE users ADD COLUMN phone_number TEXT;");
  } catch {
    // Column already exists or table freshly created
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS exam_study_plans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id TEXT NOT NULL,
      exam_name TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      subjects_json TEXT NOT NULL,
      availability_json TEXT NOT NULL,
      days_json TEXT NOT NULL,
      ai_strategy_tips TEXT DEFAULT '[]',
      total_topics INTEGER DEFAULT 0,
      completed_topics INTEGER DEFAULT 0,
      total_hours_planned REAL DEFAULT 0,
      completed_hours REAL DEFAULT 0,
      streak_days INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS student_academic_profiles (
      user_id TEXT PRIMARY KEY,
      full_name TEXT NOT NULL,
      institution TEXT DEFAULT '',
      course_degree TEXT DEFAULT '',
      department_branch TEXT DEFAULT '',
      academic_year TEXT DEFAULT '',
      semester TEXT DEFAULT '',
      grading_system TEXT DEFAULT 'percentage',
      preferred_language TEXT DEFAULT 'English',
      subjects_json TEXT NOT NULL DEFAULT '[]',
      overall_attendance REAL DEFAULT 0,
      daily_study_hours_weekday REAL DEFAULT 3,
      daily_study_hours_weekend REAL DEFAULT 5,
      upcoming_exams_json TEXT NOT NULL DEFAULT '[]',
      weak_topics_json TEXT NOT NULL DEFAULT '[]',
      target_goals_json TEXT NOT NULL DEFAULT '[]',
      onboarding_completed INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS quiz_attempts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      topic TEXT NOT NULL,
      score INTEGER NOT NULL,
      total_questions INTEGER NOT NULL DEFAULT 30,
      percentage REAL NOT NULL,
      answers_json TEXT NOT NULL,
      questions_json TEXT NOT NULL,
      time_spent_seconds INTEGER DEFAULT 0,
      completed_at TEXT NOT NULL
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS topic_modules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      topic_normalized TEXT UNIQUE,
      topic_title TEXT NOT NULL,
      theory_json TEXT NOT NULL,
      questions_json TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);

  // Seed default students if empty
  const countResult = db.exec("SELECT COUNT(*) as count FROM students");
  const count = countResult[0]?.values[0]?.[0] as number || 0;
  
  if (count === 0) {
    const initialStudents: StudentRecord[] = [
      {
        id: 'STD-88429',
        name: 'Marcus Vance',
        education_level: 'btech',
        stream_or_branch: 'Computer Science & Engineering',
        course: 'CS-204 Data Structures & Algorithms',
        attendance: 58.4,
        study_hours: 6.2,
        previous_marks: 48.0,
        assignment_score: 52.0,
        practical_score: 50.0,
        predicted_risk: 'critical',
        is_demo: true,
        created_at: '2024-10-10T09:00:00Z'
      },
      {
        id: 'STD-94021',
        name: 'Aaliyah Chen',
        education_level: 'higher_secondary',
        stream_or_branch: 'Science (PCM)',
        course: 'MATH-102 Calculus & Coordinate Geometry',
        attendance: 64.0,
        study_hours: 8.5,
        previous_marks: 52.0,
        assignment_score: 61.0,
        practical_score: 65.0,
        predicted_risk: 'critical',
        is_demo: true,
        created_at: '2024-10-10T09:15:00Z'
      },
      {
        id: 'STD-77312',
        name: 'Jordan Miller',
        education_level: 'undergraduate_other',
        stream_or_branch: 'BBA (Business Administration)',
        course: 'BUS-301 Organizational Behavior',
        attendance: 76.2,
        study_hours: 11.0,
        previous_marks: 61.0,
        assignment_score: 68.0,
        practical_score: 70.0,
        predicted_risk: 'borderline',
        is_demo: true,
        created_at: '2024-10-10T09:30:00Z'
      }
    ];

    for (const s of initialStudents) {
      db.run(
        `INSERT INTO students (id, name, education_level, stream_or_branch, course, attendance, study_hours, previous_marks, assignment_score, practical_score, predicted_risk, is_demo, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [s.id, s.name, s.education_level, s.stream_or_branch || '', s.course, s.attendance, s.study_hours, s.previous_marks, s.assignment_score, s.practical_score || 0, s.predicted_risk, 1, s.created_at]
      );
    }

    // Seed default academic records for progress tracking
    const initialRecords = [
      { student_id: 'STD-88429', subject: 'Data Structures', marks: 48, attendance: 55, assignment_score: 50, assessment_type: 'Unit Quiz 1', recorded_date: '2024-09-10' },
      { student_id: 'STD-88429', subject: 'Data Structures', marks: 52, attendance: 58, assignment_score: 54, assessment_type: 'Midterm 1', recorded_date: '2024-09-28' },
      { student_id: 'STD-88429', subject: 'Data Structures', marks: 58, attendance: 64, assignment_score: 62, assessment_type: 'Lab Practical Assessment', recorded_date: '2024-10-12' },
      { student_id: 'STD-88429', subject: 'Operating Systems', marks: 60, attendance: 65, assignment_score: 58, assessment_type: 'Midterm 1', recorded_date: '2024-09-25' },
      { student_id: 'STD-88429', subject: 'Discrete Math', marks: 44, attendance: 50, assignment_score: 48, assessment_type: 'Quiz 2', recorded_date: '2024-10-05' }
    ];

    for (const r of initialRecords) {
      db.run(
        `INSERT INTO academic_records (student_id, subject, marks, attendance, assignment_score, assessment_type, recorded_date, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [r.student_id, r.subject, r.marks, r.attendance, r.assignment_score, r.assessment_type, r.recorded_date, 'Baseline intake record']
      );
    }

    // Seed default study planner tasks
    const initialTasks = [
      { student_id: 'STD-88429', title: 'Binary Search Trees & Traversal Practice', subject: 'Data Structures', day_of_week: 'Monday', time_slot: '17:00 - 18:30', duration_minutes: 90, priority: 'high', status: 'pending' },
      { student_id: 'STD-88429', title: 'Graph Dijkstra & BFS Coding Lab', subject: 'Data Structures', day_of_week: 'Tuesday', time_slot: '18:00 - 19:30', duration_minutes: 90, priority: 'high', status: 'pending' },
      { student_id: 'STD-88429', title: 'Process Scheduling Algorithm Review', subject: 'Operating Systems', day_of_week: 'Wednesday', time_slot: '16:30 - 18:00', duration_minutes: 90, priority: 'medium', status: 'completed' },
      { student_id: 'STD-88429', title: 'Recurrence Relations & Proofs', subject: 'Discrete Math', day_of_week: 'Thursday', time_slot: '17:00 - 18:30', duration_minutes: 90, priority: 'medium', status: 'pending' },
      { student_id: 'STD-88429', title: 'Weekly Formula Revision & Self-Test', subject: 'All Core Subjects', day_of_week: 'Saturday', time_slot: '10:00 - 12:00', duration_minutes: 120, priority: 'high', status: 'pending' }
    ];

    for (const t of initialTasks) {
      db.run(
        `INSERT INTO study_planner_tasks (student_id, title, subject, day_of_week, time_slot, duration_minutes, priority, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [t.student_id, t.title, t.subject, t.day_of_week, t.time_slot, t.duration_minutes, t.priority, t.status, new Date().toISOString()]
      );
    }

    // Seed default goals
    const initialGoals = [
      { student_id: 'STD-88429', title: 'Achieve at least 70% on Data Structures Midterm #2', category: 'score', target_date: '2024-11-15', progress_percent: 60, is_completed: 0 },
      { student_id: 'STD-88429', title: 'Maintain minimum 85% attendance for 3 continuous weeks', category: 'study_habit', target_date: '2024-11-10', progress_percent: 75, is_completed: 0 },
      { student_id: 'STD-88429', title: 'Complete NPTEL Data Structures in Python modules', category: 'course', target_date: '2024-12-01', progress_percent: 40, is_completed: 0 },
      { student_id: 'STD-88429', title: 'Finish 10 practice coding problems on linked lists & trees', category: 'roadmap', target_date: '2024-10-30', progress_percent: 100, is_completed: 1 }
    ];

    for (const g of initialGoals) {
      db.run(
        `INSERT INTO goals (student_id, title, category, target_date, progress_percent, is_completed, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [g.student_id, g.title, g.category, g.target_date, g.progress_percent, g.is_completed, new Date().toISOString()]
      );
    }

    // Seed default roadmap topics
    const initialRoadmap = [
      { student_id: 'STD-88429', title: 'Pointers, Memory Allocation & Arrays', phase: 'foundations', subject: 'Data Structures', status: 'completed', estimated_hours: 4.0 },
      { student_id: 'STD-88429', title: 'Singly and Doubly Linked Lists Implementation', phase: 'foundations', subject: 'Data Structures', status: 'completed', estimated_hours: 5.0 },
      { student_id: 'STD-88429', title: 'Stack & Queue Applications (Expression Parsing)', phase: 'improvements', subject: 'Data Structures', status: 'in_progress', estimated_hours: 6.0 },
      { student_id: 'STD-88429', title: 'Binary Search Trees & AVL Balancing Logic', phase: 'improvements', subject: 'Data Structures', status: 'not_started', estimated_hours: 8.0 },
      { student_id: 'STD-88429', title: 'Heap Sort & Priority Queues Practice Problems', phase: 'practice', subject: 'Data Structures', status: 'not_started', estimated_hours: 5.0 },
      { student_id: 'STD-88429', title: 'Graph Representations (Adjacency Matrix & Lists)', phase: 'intermediate', subject: 'Data Structures', status: 'not_started', estimated_hours: 7.0 },
      { student_id: 'STD-88429', title: 'Dynamic Programming & Memoization Patterns', phase: 'advanced', subject: 'Data Structures', status: 'not_started', estimated_hours: 10.0 }
    ];

    for (const r of initialRoadmap) {
      db.run(
        `INSERT INTO roadmap_topics (student_id, title, phase, subject, status, estimated_hours)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [r.student_id, r.title, r.phase, r.subject, r.status, r.estimated_hours]
      );
    }

    // Seed default notifications
    const initialNotifications = [
      { student_id: 'STD-88429', title: 'Midterm Assessment #2 Approaching', message: 'Data Structures Midterm 2 is scheduled in 12 days. Check your examination readiness roadmap.', type: 'exam', scheduled_for: '2024-11-05', is_read: 0 },
      { student_id: 'STD-88429', title: 'Attendance Alert', message: 'Your attendance is currently 58.4%. Attend all upcoming lab recitations to remain eligible.', type: 'study_session', scheduled_for: '2024-10-25', is_read: 0 },
      { student_id: 'STD-88429', title: 'Assignment 4 Deadline', message: 'Binary Trees coding assignment is due Friday at 23:59.', type: 'assignment', scheduled_for: '2024-10-28', is_read: 1 }
    ];

    for (const n of initialNotifications) {
      db.run(
        `INSERT INTO notifications (student_id, title, message, type, scheduled_for, is_read, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [n.student_id, n.title, n.message, n.type, n.scheduled_for, n.is_read, new Date().toISOString()]
      );
    }

    saveDbToFile(db);
  }

  dbInstance = db;
  return db;
}

// -------------------------------------------------------------
// STUDENTS
// -------------------------------------------------------------
export async function getAllStudents(): Promise<StudentRecord[]> {
  const db = await getDb();
  const res = db.exec("SELECT * FROM students ORDER BY created_at DESC");
  if (!res.length) return [];
  const columns = res[0].columns;
  return res[0].values.map(row => {
    const obj: any = {};
    columns.forEach((col, idx) => {
      obj[col] = row[idx];
    });
    obj.is_demo = Boolean(obj.is_demo);
    return obj as StudentRecord;
  });
}

export async function upsertStudent(student: Omit<StudentRecord, 'created_at'>): Promise<void> {
  const db = await getDb();
  const now = new Date().toISOString();
  db.run(
    `INSERT OR REPLACE INTO students (id, name, education_level, stream_or_branch, course, attendance, study_hours, previous_marks, assignment_score, practical_score, predicted_risk, is_demo, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      student.id,
      student.name,
      student.education_level || 'btech',
      student.stream_or_branch || '',
      student.course,
      student.attendance,
      student.study_hours,
      student.previous_marks,
      student.assignment_score,
      student.practical_score || 0,
      student.predicted_risk,
      student.is_demo ? 1 : 0,
      now
    ]
  );
  saveDbToFile(db);
}

// -------------------------------------------------------------
// PREDICTIONS
// -------------------------------------------------------------
export async function getAllPredictions(studentId?: string): Promise<PredictionRecord[]> {
  const db = await getDb();
  const query = studentId
    ? "SELECT * FROM predictions WHERE student_id = ? ORDER BY id DESC"
    : "SELECT * FROM predictions ORDER BY id DESC";
  const params = studentId ? [studentId] : [];
  const res = db.exec(query, params);
  if (!res.length) return [];
  const columns = res[0].columns;
  return res[0].values.map(row => {
    const obj: any = {};
    columns.forEach((col, idx) => {
      obj[col] = row[idx];
    });
    try {
      obj.recommendations = JSON.parse(obj.recommendations || '[]');
    } catch {
      obj.recommendations = [];
    }
    try {
      obj.study_plan = JSON.parse(obj.study_plan || '{}');
    } catch {
      obj.study_plan = undefined;
    }
    try {
      obj.recommended_courses = JSON.parse(obj.recommended_courses || '[]');
    } catch {
      obj.recommended_courses = [];
    }
    obj.is_demo = Boolean(obj.is_demo);
    return obj as PredictionRecord;
  });
}

export async function insertPrediction(pred: Omit<PredictionRecord, 'id' | 'created_at'>): Promise<number> {
  const db = await getDb();
  const now = new Date().toISOString();
  const recsStr = JSON.stringify(pred.recommendations || []);
  const planStr = JSON.stringify(pred.study_plan || {});
  const coursesStr = JSON.stringify(pred.recommended_courses || []);

  db.run(
    `INSERT INTO predictions (student_id, student_name, education_level, stream_or_branch, course, model_used, attendance, study_hours, previous_marks, assignment_score, practical_score, predicted_category, confidence, projected_score, recommendations, study_plan, recommended_courses, advisor, is_demo, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      pred.student_id,
      pred.student_name,
      pred.education_level || 'btech',
      pred.stream_or_branch || '',
      pred.course,
      pred.model_used,
      pred.attendance,
      pred.study_hours,
      pred.previous_marks,
      pred.assignment_score,
      pred.practical_score || 0,
      pred.predicted_category,
      pred.confidence,
      pred.projected_score,
      recsStr,
      planStr,
      coursesStr,
      pred.advisor || 'Dr. Elena Rostova',
      pred.is_demo ? 1 : 0,
      now
    ]
  );
  
  saveDbToFile(db);
  const idRes = db.exec("SELECT last_insert_rowid() as id");
  return (idRes[0]?.values[0]?.[0] as number) || 1;
}

export async function deletePrediction(id: number): Promise<void> {
  const db = await getDb();
  db.run("DELETE FROM predictions WHERE id = ?", [id]);
  saveDbToFile(db);
}

// -------------------------------------------------------------
// ACADEMIC RECORDS
// -------------------------------------------------------------
export async function getAcademicRecords(studentId?: string): Promise<AcademicRecord[]> {
  const db = await getDb();
  const query = studentId
    ? "SELECT * FROM academic_records WHERE student_id = ? ORDER BY recorded_date ASC"
    : "SELECT * FROM academic_records ORDER BY recorded_date ASC";
  const params = studentId ? [studentId] : [];
  const res = db.exec(query, params);
  if (!res.length) return [];
  const columns = res[0].columns;
  return res[0].values.map(row => {
    const obj: any = {};
    columns.forEach((col, idx) => {
      obj[col] = row[idx];
    });
    return obj as AcademicRecord;
  });
}

export async function addAcademicRecord(rec: Omit<AcademicRecord, 'id'>): Promise<number> {
  const db = await getDb();
  db.run(
    `INSERT INTO academic_records (student_id, subject, marks, attendance, assignment_score, assessment_type, recorded_date, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [rec.student_id, rec.subject, rec.marks, rec.attendance, rec.assignment_score, rec.assessment_type, rec.recorded_date, rec.notes || '']
  );
  saveDbToFile(db);
  const idRes = db.exec("SELECT last_insert_rowid() as id");
  return (idRes[0]?.values[0]?.[0] as number) || 1;
}

// -------------------------------------------------------------
// STUDY PLANNER TASKS
// -------------------------------------------------------------
export async function getPlannerTasks(studentId?: string): Promise<StudyPlannerTask[]> {
  const db = await getDb();
  const query = studentId
    ? "SELECT * FROM study_planner_tasks WHERE student_id = ? ORDER BY id ASC"
    : "SELECT * FROM study_planner_tasks ORDER BY id ASC";
  const params = studentId ? [studentId] : [];
  const res = db.exec(query, params);
  if (!res.length) return [];
  const columns = res[0].columns;
  return res[0].values.map(row => {
    const obj: any = {};
    columns.forEach((col, idx) => {
      obj[col] = row[idx];
    });
    return obj as StudyPlannerTask;
  });
}

export async function addPlannerTask(task: Omit<StudyPlannerTask, 'id' | 'created_at'>): Promise<number> {
  const db = await getDb();
  const now = new Date().toISOString();
  db.run(
    `INSERT INTO study_planner_tasks (student_id, title, subject, day_of_week, time_slot, duration_minutes, priority, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [task.student_id, task.title, task.subject, task.day_of_week, task.time_slot, task.duration_minutes, task.priority, task.status || 'pending', now]
  );
  saveDbToFile(db);
  const idRes = db.exec("SELECT last_insert_rowid() as id");
  return (idRes[0]?.values[0]?.[0] as number) || 1;
}

export async function updatePlannerTaskStatus(id: number, status: 'pending' | 'completed' | 'rescheduled'): Promise<void> {
  const db = await getDb();
  db.run("UPDATE study_planner_tasks SET status = ? WHERE id = ?", [status, id]);
  saveDbToFile(db);
}

export async function deletePlannerTask(id: number): Promise<void> {
  const db = await getDb();
  db.run("DELETE FROM study_planner_tasks WHERE id = ?", [id]);
  saveDbToFile(db);
}

// -------------------------------------------------------------
// GOALS
// -------------------------------------------------------------
export async function getGoals(studentId?: string): Promise<GoalItem[]> {
  const db = await getDb();
  const query = studentId
    ? "SELECT * FROM goals WHERE student_id = ? ORDER BY id DESC"
    : "SELECT * FROM goals ORDER BY id DESC";
  const params = studentId ? [studentId] : [];
  const res = db.exec(query, params);
  if (!res.length) return [];
  const columns = res[0].columns;
  return res[0].values.map(row => {
    const obj: any = {};
    columns.forEach((col, idx) => {
      obj[col] = row[idx];
    });
    obj.is_completed = Boolean(obj.is_completed);
    return obj as GoalItem;
  });
}

export async function addGoal(goal: Omit<GoalItem, 'id' | 'created_at'>): Promise<number> {
  const db = await getDb();
  const now = new Date().toISOString();
  db.run(
    `INSERT INTO goals (student_id, title, category, target_date, progress_percent, is_completed, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [goal.student_id, goal.title, goal.category, goal.target_date, goal.progress_percent || 0, goal.is_completed ? 1 : 0, now]
  );
  saveDbToFile(db);
  const idRes = db.exec("SELECT last_insert_rowid() as id");
  return (idRes[0]?.values[0]?.[0] as number) || 1;
}

export async function updateGoalProgress(id: number, progress_percent: number, is_completed: boolean): Promise<void> {
  const db = await getDb();
  db.run("UPDATE goals SET progress_percent = ?, is_completed = ? WHERE id = ?", [progress_percent, is_completed ? 1 : 0, id]);
  saveDbToFile(db);
}

// -------------------------------------------------------------
// ROADMAP TOPICS
// -------------------------------------------------------------
export async function getRoadmapTopics(studentId?: string): Promise<RoadmapTopic[]> {
  const db = await getDb();
  const query = studentId
    ? "SELECT * FROM roadmap_topics WHERE student_id = ? ORDER BY id ASC"
    : "SELECT * FROM roadmap_topics ORDER BY id ASC";
  const params = studentId ? [studentId] : [];
  const res = db.exec(query, params);
  if (!res.length) return [];
  const columns = res[0].columns;
  return res[0].values.map(row => {
    const obj: any = {};
    columns.forEach((col, idx) => {
      obj[col] = row[idx];
    });
    return obj as RoadmapTopic;
  });
}

export async function updateRoadmapTopicStatus(id: number, status: 'not_started' | 'in_progress' | 'completed'): Promise<void> {
  const db = await getDb();
  db.run("UPDATE roadmap_topics SET status = ? WHERE id = ?", [status, id]);
  saveDbToFile(db);
}

// -------------------------------------------------------------
// SAVED COURSES
// -------------------------------------------------------------
export async function getSavedCourses(studentId?: string): Promise<{ course_id: string; status: string }[]> {
  const db = await getDb();
  const query = studentId
    ? "SELECT course_id, status FROM saved_courses WHERE student_id = ?"
    : "SELECT course_id, status FROM saved_courses";
  const params = studentId ? [studentId] : [];
  const res = db.exec(query, params);
  if (!res.length) return [];
  return res[0].values.map(row => ({
    course_id: row[0] as string,
    status: row[1] as string
  }));
}

export async function toggleSaveCourse(student_id: string, course_id: string, status: string = 'saved'): Promise<boolean> {
  const db = await getDb();
  const check = db.exec("SELECT id FROM saved_courses WHERE student_id = ? AND course_id = ?", [student_id, course_id]);
  if (check.length && check[0].values.length) {
    db.run("DELETE FROM saved_courses WHERE student_id = ? AND course_id = ?", [student_id, course_id]);
    saveDbToFile(db);
    return false; // Removed
  } else {
    db.run("INSERT INTO saved_courses (student_id, course_id, status, saved_at) VALUES (?, ?, ?, ?)", [student_id, course_id, status, new Date().toISOString()]);
    saveDbToFile(db);
    return true; // Added
  }
}

// -------------------------------------------------------------
// EXAM READINESS
// -------------------------------------------------------------
export async function getExamReadinessAssessments(studentId?: string): Promise<ExamReadinessAssessment[]> {
  const db = await getDb();
  const query = studentId
    ? "SELECT * FROM exam_readiness_assessments WHERE student_id = ? ORDER BY id DESC"
    : "SELECT * FROM exam_readiness_assessments ORDER BY id DESC";
  const params = studentId ? [studentId] : [];
  const res = db.exec(query, params);
  if (!res.length) return [];
  const columns = res[0].columns;
  return res[0].values.map(row => {
    const obj: any = {};
    columns.forEach((col, idx) => {
      obj[col] = row[idx];
    });
    return obj as ExamReadinessAssessment;
  });
}

export async function addExamReadinessAssessment(assessment: Omit<ExamReadinessAssessment, 'id' | 'created_at'>): Promise<number> {
  const db = await getDb();
  const now = new Date().toISOString();
  db.run(
    `INSERT INTO exam_readiness_assessments (student_id, exam_name, exam_date, syllabus_completion, practice_score, revision_progress, readiness_score, readiness_tier, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      assessment.student_id,
      assessment.exam_name,
      assessment.exam_date,
      assessment.syllabus_completion,
      assessment.practice_score,
      assessment.revision_progress,
      assessment.readiness_score,
      assessment.readiness_tier,
      now
    ]
  );
  saveDbToFile(db);
  const idRes = db.exec("SELECT last_insert_rowid() as id");
  return (idRes[0]?.values[0]?.[0] as number) || 1;
}

// -------------------------------------------------------------
// NOTIFICATIONS
// -------------------------------------------------------------
export async function getNotifications(studentId?: string): Promise<NotificationItem[]> {
  const db = await getDb();
  const query = studentId
    ? "SELECT * FROM notifications WHERE student_id = ? ORDER BY scheduled_for ASC"
    : "SELECT * FROM notifications ORDER BY scheduled_for ASC";
  const params = studentId ? [studentId] : [];
  const res = db.exec(query, params);
  if (!res.length) return [];
  const columns = res[0].columns;
  return res[0].values.map(row => {
    const obj: any = {};
    columns.forEach((col, idx) => {
      obj[col] = row[idx];
    });
    obj.is_read = Boolean(obj.is_read);
    return obj as NotificationItem;
  });
}

export async function markNotificationAsRead(id: number): Promise<void> {
  const db = await getDb();
  db.run("UPDATE notifications SET is_read = 1 WHERE id = ?", [id]);
  saveDbToFile(db);
}

// -------------------------------------------------------------
// DASHBOARD STATS
// -------------------------------------------------------------
export async function getDashboardStats(studentId?: string) {
  const students = await getAllStudents();
  const predictions = await getAllPredictions(studentId);
  const goals = await getGoals(studentId);
  const notifications = await getNotifications(studentId);
  const academicRecords = await getAcademicRecords(studentId);
  const examPlan = studentId ? await getLatestExamStudyPlan(studentId) : null;

  const totalStudents = students.length;
  const predictionsCount = predictions.length;
  const highPerformanceCount = predictions.filter(
    (p) => p.predicted_category === 'High Performance'
  ).length;
  const highPerformancePercentage =
    predictionsCount > 0
      ? Number(((highPerformanceCount / predictionsCount) * 100).toFixed(1))
      : 0;
  const studentsNeedingSupport = predictions.filter(
    (p) => p.predicted_category === 'At-Risk'
  ).length;

  // Real average attendance from records or predictions
  let averageAttendance = 0;
  if (predictions.length > 0) {
    const sumAtt = predictions.reduce((acc, p) => acc + (p.attendance || 0), 0);
    averageAttendance = Number((sumAtt / predictions.length).toFixed(1));
  } else if (students.length > 0) {
    const sumAtt = students.reduce((acc, s) => acc + (s.attendance || 0), 0);
    averageAttendance = Number((sumAtt / students.length).toFixed(1));
  }

  const activeGoalsCount = goals.filter((g) => !g.is_completed).length;
  const upcomingExamsCount = notifications.filter(
    (n) => n.type === 'exam' && !n.is_read
  ).length;

  let studyPlanCompletion = 0;
  if (examPlan && examPlan.totalTopics > 0) {
    studyPlanCompletion = Number(
      ((examPlan.completedTopics / examPlan.totalTopics) * 100).toFixed(0)
    );
  }

  return {
    totalStudents,
    predictionsCount,
    highPerformanceCount,
    highPerformancePercentage,
    studentsNeedingSupport,
    recentPredictions: predictions.slice(0, 5),
    activeGoalsCount,
    upcomingExamsCount,
    averageAttendance,
    studyPlanCompletion,
    hasStudyPlan: Boolean(examPlan),
    academicRecordsCount: academicRecords.length
  };
}

// -------------------------------------------------------------
// USER & AUTHENTICATION MANAGEMENT
// -------------------------------------------------------------
export async function getUserById(id: string): Promise<User | null> {
  const db = await getDb();
  const res = db.exec("SELECT * FROM users WHERE id = ?", [id]);
  if (!res.length || !res[0].values.length) return null;
  const columns = res[0].columns;
  const obj: any = {};
  columns.forEach((col, idx) => {
    obj[col] = res[0].values[0][idx];
  });
  return obj as User;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const db = await getDb();
  const res = db.exec("SELECT * FROM users WHERE LOWER(email) = LOWER(?)", [email.trim()]);
  if (!res.length || !res[0].values.length) return null;
  const columns = res[0].columns;
  const obj: any = {};
  columns.forEach((col, idx) => {
    obj[col] = res[0].values[0][idx];
  });
  return obj as User;
}

export async function getUserByGoogleId(googleId: string): Promise<User | null> {
  const db = await getDb();
  const res = db.exec("SELECT * FROM users WHERE google_id = ?", [googleId]);
  if (!res.length || !res[0].values.length) return null;
  const columns = res[0].columns;
  const obj: any = {};
  columns.forEach((col, idx) => {
    obj[col] = res[0].values[0][idx];
  });
  return obj as User;
}

export async function getUserByPhone(phone: string): Promise<User | null> {
  const db = await getDb();
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  const res = db.exec("SELECT * FROM users WHERE phone_number = ?", [cleanPhone]);
  if (!res.length || !res[0].values.length) return null;
  const columns = res[0].columns;
  const obj: any = {};
  columns.forEach((col, idx) => {
    obj[col] = res[0].values[0][idx];
  });
  return obj as User;
}

export async function createPhoneUser(phone: string, name: string, email?: string): Promise<User> {
  const db = await getDb();
  const now = new Date().toISOString();
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  const id = 'STD-M' + crypto.randomBytes(3).toString('hex').toUpperCase();
  const fallbackEmail = email && email.trim()
    ? email.toLowerCase().trim()
    : `student_${cleanPhone.replace(/\+/g, '')}@student.edupredict.ai`;

  db.run(
    `INSERT INTO users (id, phone_number, email, name, picture, education_level, institution, stream_or_branch, created_at, last_login_at)
     VALUES (?, ?, ?, ?, '', '', '', '', ?, ?)`,
    [id, cleanPhone, fallbackEmail, name, now, now]
  );
  db.run(
    `INSERT OR IGNORE INTO students (id, name, education_level, stream_or_branch, course, attendance, study_hours, previous_marks, assignment_score, practical_score, predicted_risk, is_demo, created_at)
     VALUES (?, ?, 'btech', '', 'Core Academic Module', 75, 12, 60, 65, 60, 'good', 0, ?)`,
    [id, name, now]
  );
  saveDbToFile(db);
  return (await getUserById(id))!;
}

export async function linkPhoneToUser(userId: string, phone: string): Promise<User> {
  const db = await getDb();
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  const existing = await getUserByPhone(cleanPhone);
  if (existing && existing.id !== userId) {
    throw new Error('This mobile number is already linked to another student account.');
  }
  db.run(`UPDATE users SET phone_number = ? WHERE id = ?`, [cleanPhone, userId]);
  saveDbToFile(db);
  return (await getUserById(userId))!;
}

export async function upsertGoogleUser(googleUser: {
  google_id: string;
  email: string;
  name: string;
  picture: string;
}): Promise<User> {
  const db = await getDb();
  const now = new Date().toISOString();
  let existing = await getUserByGoogleId(googleUser.google_id);
  if (!existing) {
    existing = await getUserByEmail(googleUser.email);
  }

  if (existing) {
    db.run(
      `UPDATE users SET google_id = ?, name = ?, picture = ?, last_login_at = ? WHERE id = ?`,
      [googleUser.google_id, googleUser.name || existing.name, googleUser.picture || existing.picture || '', now, existing.id]
    );
    saveDbToFile(db);
    return (await getUserById(existing.id))!;
  } else {
    // Generate clean student id format: STD-G<random>
    const id = 'STD-G' + crypto.randomBytes(3).toString('hex').toUpperCase();
    db.run(
      `INSERT INTO users (id, google_id, email, name, picture, education_level, institution, stream_or_branch, created_at, last_login_at)
       VALUES (?, ?, ?, ?, ?, '', '', '', ?, ?)`,
      [id, googleUser.google_id, googleUser.email.toLowerCase(), googleUser.name, googleUser.picture, now, now]
    );

    // Also register in students table so initial profile exists
    db.run(
      `INSERT OR IGNORE INTO students (id, name, education_level, stream_or_branch, course, attendance, study_hours, previous_marks, assignment_score, practical_score, predicted_risk, is_demo, created_at)
       VALUES (?, ?, 'btech', '', 'Core Academic Module', 75, 12, 60, 65, 60, 'good', 0, ?)`,
      [id, googleUser.name, now]
    );

    saveDbToFile(db);
    return (await getUserById(id))!;
  }
}

export async function createEmailUser(email: string, name: string, passwordHash: string): Promise<User> {
  const db = await getDb();
  const now = new Date().toISOString();
  const id = 'STD-E' + crypto.randomBytes(3).toString('hex').toUpperCase();
  db.run(
    `INSERT INTO users (id, email, name, password_hash, picture, education_level, institution, stream_or_branch, created_at, last_login_at)
     VALUES (?, ?, ?, ?, '', '', '', '', ?, ?)`,
    [id, email.toLowerCase(), name, passwordHash, now, now]
  );
  db.run(
    `INSERT OR IGNORE INTO students (id, name, education_level, stream_or_branch, course, attendance, study_hours, previous_marks, assignment_score, practical_score, predicted_risk, is_demo, created_at)
     VALUES (?, ?, 'btech', '', 'Core Academic Module', 75, 12, 60, 65, 60, 'good', 0, ?)`,
    [id, name, now]
  );
  saveDbToFile(db);
  return (await getUserById(id))!;
}

export async function updateUserProfile(
  userId: string,
  updates: {
    name?: string;
    education_level?: string;
    institution?: string;
    stream_or_branch?: string;
  }
): Promise<User> {
  const db = await getDb();
  const user = await getUserById(userId);
  if (!user) throw new Error('User not found');

  const newName = updates.name !== undefined ? updates.name : (user.name || '');
  const newLevel = updates.education_level !== undefined ? updates.education_level : (user.education_level || '');
  const newInst = updates.institution !== undefined ? updates.institution : (user.institution || '');
  const newStream = updates.stream_or_branch !== undefined ? updates.stream_or_branch : (user.stream_or_branch || '');

  db.run(
    `UPDATE users SET name = ?, education_level = ?, institution = ?, stream_or_branch = ? WHERE id = ?`,
    [newName, newLevel, newInst, newStream, userId]
  );

  // Synchronize with students table
  db.run(
    `UPDATE students SET name = ?, education_level = ?, stream_or_branch = ? WHERE id = ?`,
    [newName, newLevel, newStream, userId]
  );

  saveDbToFile(db);
  return (await getUserById(userId))!;
}

const SESSION_SECRET = process.env.SESSION_SECRET || 'edupredict_jwt_hmac_session_secret_key_2026';

export async function createSession(userId: string): Promise<string> {
  const db = await getDb();
  const user = await getUserById(userId);
  const now = Date.now();
  const expiresMs = now + 30 * 24 * 60 * 60 * 1000; // 30 days
  const randomSalt = crypto.randomBytes(16).toString('hex');
  const payloadStr = JSON.stringify({
    userId,
    email: user?.email || '',
    name: user?.name || '',
    picture: user?.picture || '',
    google_id: user?.google_id || '',
    education_level: user?.education_level || '',
    institution: user?.institution || '',
    stream_or_branch: user?.stream_or_branch || '',
    exp: expiresMs,
    salt: randomSalt
  });
  const payloadBase64 = Buffer.from(payloadStr).toString('base64url');
  const signature = crypto.createHmac('sha256', SESSION_SECRET).update(payloadBase64).digest('base64url');
  const token = `eps_${payloadBase64}.${signature}`;

  try {
    db.run(
      `INSERT INTO sessions (token, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)`,
      [token, userId, new Date(expiresMs).toISOString(), new Date(now).toISOString()]
    );
    saveDbToFile(db);
  } catch (err) {
    console.warn('Session DB insert notice (non-fatal):', err);
  }

  return token;
}

export async function getSessionUser(token: string): Promise<User | null> {
  if (!token || typeof token !== 'string') return null;
  const now = new Date().toISOString();
  const nowMs = Date.now();

  // 1. Verify signed token format (supports serverless multi-instance verification)
  if (token.startsWith('eps_')) {
    const raw = token.slice(4);
    const dotIndex = raw.lastIndexOf('.');
    if (dotIndex !== -1) {
      const payloadBase64 = raw.slice(0, dotIndex);
      const signature = raw.slice(dotIndex + 1);
      const expectedSig = crypto.createHmac('sha256', SESSION_SECRET).update(payloadBase64).digest('base64url');

      const sigBuf = Buffer.from(signature);
      const expectedBuf = Buffer.from(expectedSig);
      if (sigBuf.length === expectedBuf.length && crypto.timingSafeEqual(sigBuf, expectedBuf)) {
        try {
          const payload = JSON.parse(Buffer.from(payloadBase64, 'base64url').toString('utf8'));
          if (payload.exp && payload.exp > nowMs && payload.userId) {
            let user = await getUserById(payload.userId);
            if (!user && payload.email) {
              // Ensure user exists in local SQLite instance if cold-started
              const db = await getDb();
              db.run(
                `INSERT INTO users (id, google_id, email, name, picture, education_level, institution, stream_or_branch, created_at, last_login_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                 ON CONFLICT(id) DO NOTHING`,
                [
                  payload.userId,
                  payload.google_id || '',
                  payload.email.toLowerCase(),
                  payload.name || payload.email.split('@')[0],
                  payload.picture || '',
                  payload.education_level || '',
                  payload.institution || '',
                  payload.stream_or_branch || '',
                  now,
                  now
                ]
              );
              saveDbToFile(db);
              user = await getUserById(payload.userId);
            }

            if (user) {
              try {
                const db = await getDb();
                db.run("UPDATE users SET last_login_at = ? WHERE id = ?", [now, user.id]);
                saveDbToFile(db);
              } catch {}
              return user;
            }
          }
        } catch (e) {
          console.warn('Failed to parse signed session token payload:', e);
        }
      }
    }
  }

  // 2. Fallback: check SQLite sessions table (supports legacy tokens or database sessions)
  try {
    const db = await getDb();
    const res = db.exec("SELECT user_id, expires_at FROM sessions WHERE token = ?", [token]);
    if (res.length && res[0].values.length) {
      const userId = res[0].values[0][0] as string;
      const expiresAt = res[0].values[0][1] as string;

      if (expiresAt >= now) {
        const user = await getUserById(userId);
        if (user) {
          db.run("UPDATE users SET last_login_at = ? WHERE id = ?", [now, user.id]);
          saveDbToFile(db);
          return user;
        }
      } else {
        db.run("DELETE FROM sessions WHERE token = ?", [token]);
        saveDbToFile(db);
      }
    }
  } catch (err) {
    console.warn('Session DB lookup notice:', err);
  }

  return null;
}

export async function deleteSession(token: string): Promise<void> {
  if (!token) return;
  try {
    const db = await getDb();
    db.run("DELETE FROM sessions WHERE token = ?", [token]);
    saveDbToFile(db);
  } catch {}
}

// ---------------------------------------------------------------------
// AI Exam Study Plans Persistence
// ---------------------------------------------------------------------
export async function getLatestExamStudyPlan(studentId: string): Promise<any | null> {
  const db = await getDb();
  const res = db.exec(
    `SELECT id, student_id, exam_name, start_date, end_date, subjects_json, availability_json, days_json, ai_strategy_tips, total_topics, completed_topics, total_hours_planned, completed_hours, streak_days, created_at, updated_at
     FROM exam_study_plans
     WHERE student_id = ?
     ORDER BY id DESC LIMIT 1`,
    [studentId]
  );

  if (!res.length || !res[0].values.length) return null;

  const row = res[0].values[0];
  try {
    return {
      id: row[0],
      studentId: row[1],
      examName: row[2],
      startDate: row[3],
      endDate: row[4],
      subjects: JSON.parse(row[5] as string),
      availability: JSON.parse(row[6] as string),
      days: JSON.parse(row[7] as string),
      aiStrategyTips: JSON.parse((row[8] as string) || '[]'),
      totalTopics: Number(row[9]) || 0,
      completedTopics: Number(row[10]) || 0,
      totalHoursPlanned: Number(row[11]) || 0,
      completedHours: Number(row[12]) || 0,
      streakDays: Number(row[13]) || 0,
      createdAt: row[14],
      updatedAt: row[15]
    };
  } catch (err) {
    console.error('Error parsing exam study plan JSON:', err);
    return null;
  }
}

export async function saveExamStudyPlan(plan: {
  studentId: string;
  examName: string;
  startDate: string;
  endDate: string;
  subjects: any[];
  availability: any;
  days: any[];
  aiStrategyTips?: string[];
  totalTopics?: number;
  completedTopics?: number;
  totalHoursPlanned?: number;
  completedHours?: number;
  streakDays?: number;
}): Promise<number> {
  const db = await getDb();
  const now = new Date().toISOString();

  const subjectsJson = JSON.stringify(plan.subjects || []);
  const availabilityJson = JSON.stringify(plan.availability || {});
  const daysJson = JSON.stringify(plan.days || []);
  const aiTipsJson = JSON.stringify(plan.aiStrategyTips || []);

  const totalTopics = plan.totalTopics ?? (plan.subjects || []).reduce((acc: number, s: any) => acc + (s.topics?.length || 0), 0);
  const completedTopics = plan.completedTopics ?? 0;
  const totalHoursPlanned = plan.totalHoursPlanned ?? 0;
  const completedHours = plan.completedHours ?? 0;
  const streakDays = plan.streakDays ?? 1;

  db.run(
    `INSERT INTO exam_study_plans (
      student_id, exam_name, start_date, end_date, subjects_json, availability_json, days_json, ai_strategy_tips,
      total_topics, completed_topics, total_hours_planned, completed_hours, streak_days, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      plan.studentId,
      plan.examName,
      plan.startDate,
      plan.endDate,
      subjectsJson,
      availabilityJson,
      daysJson,
      aiTipsJson,
      totalTopics,
      completedTopics,
      totalHoursPlanned,
      completedHours,
      streakDays,
      now,
      now
    ]
  );

  const idRes = db.exec("SELECT last_insert_rowid()");
  const id = idRes[0]?.values[0]?.[0] as number || 1;
  saveDbToFile(db);
  return id;
}

export async function updateExamSessionStatus(
  planId: number,
  sessionId: string,
  newStatus: 'pending' | 'completed' | 'needs_review'
): Promise<any | null> {
  const db = await getDb();
  const res = db.exec("SELECT days_json, student_id FROM exam_study_plans WHERE id = ?", [planId]);
  if (!res.length || !res[0].values.length) return null;

  const rawDays = res[0].values[0][0] as string;
  let days: any[] = [];
  try {
    days = JSON.parse(rawDays);
  } catch {
    return null;
  }

  let found = false;
  let completedCount = 0;
  let totalCount = 0;
  let completedMinutes = 0;
  let totalMinutes = 0;

  for (const day of days) {
    if (Array.isArray(day.sessions)) {
      for (const sess of day.sessions) {
        totalCount++;
        totalMinutes += sess.durationMinutes || 0;
        if (sess.id === sessionId) {
          sess.status = newStatus;
          if (newStatus === 'completed') {
            sess.completedAt = new Date().toISOString();
          } else {
            delete sess.completedAt;
          }
          found = true;
        }
        if (sess.status === 'completed') {
          completedCount++;
          completedMinutes += sess.durationMinutes || 0;
        }
      }
    }
  }

  if (!found) return null;

  const now = new Date().toISOString();
  const completedHours = Number((completedMinutes / 60).toFixed(1));
  const totalHoursPlanned = Number((totalMinutes / 60).toFixed(1));

  db.run(
    `UPDATE exam_study_plans
     SET days_json = ?, completed_topics = ?, completed_hours = ?, updated_at = ?
     WHERE id = ?`,
    [JSON.stringify(days), completedCount, completedHours, now, planId]
  );

  saveDbToFile(db);
  return { planId, sessionId, newStatus, completedCount, completedHours };
}

export async function updateExamPlanFullDays(
  planId: number,
  days: any[],
  aiStrategyTips?: string[]
): Promise<void> {
  const db = await getDb();
  const now = new Date().toISOString();

  let completedCount = 0;
  let totalCount = 0;
  let completedMinutes = 0;
  let totalMinutes = 0;

  for (const day of days) {
    if (Array.isArray(day.sessions)) {
      for (const sess of day.sessions) {
        totalCount++;
        totalMinutes += sess.durationMinutes || 0;
        if (sess.status === 'completed') {
          completedCount++;
          completedMinutes += sess.durationMinutes || 0;
        }
      }
    }
  }

  const completedHours = Number((completedMinutes / 60).toFixed(1));
  const totalHoursPlanned = Number((totalMinutes / 60).toFixed(1));

  if (aiStrategyTips && aiStrategyTips.length > 0) {
    db.run(
      `UPDATE exam_study_plans
       SET days_json = ?, total_topics = ?, completed_topics = ?, total_hours_planned = ?, completed_hours = ?, ai_strategy_tips = ?, updated_at = ?
       WHERE id = ?`,
      [JSON.stringify(days), totalCount, completedCount, totalHoursPlanned, completedHours, JSON.stringify(aiStrategyTips), now, planId]
    );
  } else {
    db.run(
      `UPDATE exam_study_plans
       SET days_json = ?, total_topics = ?, completed_topics = ?, total_hours_planned = ?, completed_hours = ?, updated_at = ?
       WHERE id = ?`,
      [JSON.stringify(days), totalCount, completedCount, totalHoursPlanned, completedHours, now, planId]
    );
  }

  saveDbToFile(db);
}

export async function deleteExamStudyPlan(planId: number): Promise<void> {
  const db = await getDb();
  db.run("DELETE FROM exam_study_plans WHERE id = ?", [planId]);
  saveDbToFile(db);
}

// -------------------------------------------------------------
// STUDENT COMPLETE ACADEMIC PROFILES
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

export async function getStudentAcademicProfile(userId: string): Promise<StudentAcademicProfile | null> {
  const db = await getDb();
  const res = db.exec("SELECT * FROM student_academic_profiles WHERE user_id = ?", [userId]);
  if (!res || res.length === 0 || !res[0].values || res[0].values.length === 0) {
    return null;
  }
  const row = res[0].values[0];
  const cols = res[0].columns;
  const get = (col: string) => row[cols.indexOf(col)];

  return {
    user_id: String(get('user_id')),
    full_name: String(get('full_name') || ''),
    institution: String(get('institution') || ''),
    course_degree: String(get('course_degree') || ''),
    department_branch: String(get('department_branch') || ''),
    academic_year: String(get('academic_year') || ''),
    semester: String(get('semester') || ''),
    grading_system: (get('grading_system') as any) || 'percentage',
    preferred_language: String(get('preferred_language') || 'English'),
    subjects: JSON.parse(String(get('subjects_json') || '[]')),
    overall_attendance: Number(get('overall_attendance') || 0),
    daily_study_hours_weekday: Number(get('daily_study_hours_weekday') || 3),
    daily_study_hours_weekend: Number(get('daily_study_hours_weekend') || 5),
    upcoming_exams: JSON.parse(String(get('upcoming_exams_json') || '[]')),
    weak_topics: JSON.parse(String(get('weak_topics_json') || '[]')),
    target_goals: JSON.parse(String(get('target_goals_json') || '[]')),
    onboarding_completed: Boolean(Number(get('onboarding_completed') || 0)),
    created_at: String(get('created_at')),
    updated_at: String(get('updated_at'))
  };
}

export async function upsertStudentAcademicProfile(
  data: Partial<StudentAcademicProfile> & { user_id: string; full_name: string }
): Promise<StudentAcademicProfile> {
  const db = await getDb();
  const now = new Date().toISOString();
  const existing = await getStudentAcademicProfile(data.user_id);

  const subjects = data.subjects || (existing ? existing.subjects : []);
  // Calculate normalized overall attendance if subjects have attendance
  let overallAttendance = data.overall_attendance ?? (existing ? existing.overall_attendance : 75);
  if (subjects.length > 0) {
    const withAtt = subjects.filter(s => typeof s.attendance_percent === 'number');
    if (withAtt.length > 0) {
      const avg = withAtt.reduce((sum, s) => sum + (s.attendance_percent || 0), 0) / withAtt.length;
      overallAttendance = Number(avg.toFixed(1));
    }
  }

  const profile: StudentAcademicProfile = {
    user_id: data.user_id,
    full_name: data.full_name || (existing ? existing.full_name : 'Student'),
    institution: data.institution ?? (existing ? existing.institution : ''),
    course_degree: data.course_degree ?? (existing ? existing.course_degree : 'B.Tech'),
    department_branch: data.department_branch ?? (existing ? existing.department_branch : 'Computer Science'),
    academic_year: data.academic_year ?? (existing ? existing.academic_year : 'Year 2'),
    semester: data.semester ?? (existing ? existing.semester : 'Semester 4'),
    grading_system: data.grading_system ?? (existing ? existing.grading_system : 'percentage'),
    preferred_language: data.preferred_language ?? (existing ? existing.preferred_language : 'English'),
    subjects,
    overall_attendance: overallAttendance,
    daily_study_hours_weekday: data.daily_study_hours_weekday ?? (existing ? existing.daily_study_hours_weekday : 3),
    daily_study_hours_weekend: data.daily_study_hours_weekend ?? (existing ? existing.daily_study_hours_weekend : 5),
    upcoming_exams: data.upcoming_exams ?? (existing ? existing.upcoming_exams : []),
    weak_topics: data.weak_topics ?? (existing ? existing.weak_topics : []),
    target_goals: data.target_goals ?? (existing ? existing.target_goals : []),
    onboarding_completed: data.onboarding_completed ?? (existing ? existing.onboarding_completed : true),
    created_at: existing ? existing.created_at : now,
    updated_at: now
  };

  db.run(
    `INSERT INTO student_academic_profiles (
      user_id, full_name, institution, course_degree, department_branch, academic_year, semester,
      grading_system, preferred_language, subjects_json, overall_attendance,
      daily_study_hours_weekday, daily_study_hours_weekend, upcoming_exams_json,
      weak_topics_json, target_goals_json, onboarding_completed, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(user_id) DO UPDATE SET
      full_name = excluded.full_name,
      institution = excluded.institution,
      course_degree = excluded.course_degree,
      department_branch = excluded.department_branch,
      academic_year = excluded.academic_year,
      semester = excluded.semester,
      grading_system = excluded.grading_system,
      preferred_language = excluded.preferred_language,
      subjects_json = excluded.subjects_json,
      overall_attendance = excluded.overall_attendance,
      daily_study_hours_weekday = excluded.daily_study_hours_weekday,
      daily_study_hours_weekend = excluded.daily_study_hours_weekend,
      upcoming_exams_json = excluded.upcoming_exams_json,
      weak_topics_json = excluded.weak_topics_json,
      target_goals_json = excluded.target_goals_json,
      onboarding_completed = excluded.onboarding_completed,
      updated_at = excluded.updated_at`,
    [
      profile.user_id,
      profile.full_name,
      profile.institution,
      profile.course_degree,
      profile.department_branch,
      profile.academic_year,
      profile.semester,
      profile.grading_system,
      profile.preferred_language,
      JSON.stringify(profile.subjects),
      profile.overall_attendance,
      profile.daily_study_hours_weekday,
      profile.daily_study_hours_weekend,
      JSON.stringify(profile.upcoming_exams),
      JSON.stringify(profile.weak_topics),
      JSON.stringify(profile.target_goals),
      profile.onboarding_completed ? 1 : 0,
      profile.created_at,
      profile.updated_at
    ]
  );

  // Synchronize student record into the students table
  try {
    const avgMarks = subjects.length > 0
      ? subjects.reduce((acc, s) => acc + (s.percentage || ((s.marks_obtained / (s.max_marks || 100)) * 100)), 0) / subjects.length
      : 70;
    const avgAtt = overallAttendance;
    const avgAssign = subjects.length > 0 && subjects.some(s => typeof s.assignment_marks === 'number')
      ? subjects.reduce((acc, s) => acc + (s.assignment_marks || 20), 0) / subjects.length * 3.33
      : 70;
    const studyHrs = (profile.daily_study_hours_weekday * 5 + profile.daily_study_hours_weekend * 2) / 7;
    const composite = (avgAtt * 0.35) + (avgAssign * 0.3) + (avgMarks * 0.35);
    const risk = composite < 60 ? 'critical' : (composite < 75 ? 'borderline' : 'good');

    db.run(
      `INSERT INTO students (id, name, education_level, stream_or_branch, course, attendance, study_hours, previous_marks, assignment_score, practical_score, predicted_risk, is_demo, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
       ON CONFLICT(id) DO UPDATE SET
         name = excluded.name,
         education_level = excluded.education_level,
         stream_or_branch = excluded.stream_or_branch,
         course = excluded.course,
         attendance = excluded.attendance,
         study_hours = excluded.study_hours,
         previous_marks = excluded.previous_marks,
         assignment_score = excluded.assignment_score,
         predicted_risk = excluded.predicted_risk`,
      [
        profile.user_id,
        profile.full_name,
        profile.course_degree,
        profile.department_branch,
        profile.course_degree,
        avgAtt,
        Math.round(studyHrs),
        Math.round(avgMarks),
        Math.round(avgAssign),
        75,
        risk,
        now
      ]
    );
  } catch (syncErr) {
    console.warn('Students table sync notice (non-fatal):', syncErr);
  }

  saveDbToFile(db);
  return profile;
}

// -------------------------------------------------------------
// LEARN & PRACTICE: QUIZ ATTEMPTS & MODULE CACHE
// -------------------------------------------------------------
export interface QuizAttemptRecord {
  id?: number;
  user_id: string;
  topic: string;
  score: number;
  total_questions: number;
  percentage: number;
  answers: number[];
  questions: any[];
  time_spent_seconds: number;
  completed_at: string;
}

export async function saveQuizAttempt(attempt: QuizAttemptRecord): Promise<number> {
  const db = await getDb();
  const now = attempt.completed_at || new Date().toISOString();

  db.run(
    `INSERT INTO quiz_attempts (
      user_id, topic, score, total_questions, percentage, answers_json, questions_json, time_spent_seconds, completed_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      attempt.user_id,
      attempt.topic,
      attempt.score,
      attempt.total_questions || 30,
      attempt.percentage,
      JSON.stringify(attempt.answers),
      JSON.stringify(attempt.questions),
      attempt.time_spent_seconds || 0,
      now
    ]
  );

  const res = db.exec("SELECT last_insert_rowid() as id");
  const insertId = res[0]?.values[0]?.[0] as number || 1;
  saveDbToFile(db);
  return insertId;
}

export async function getQuizAttempts(userId: string, limit = 20): Promise<QuizAttemptRecord[]> {
  const db = await getDb();
  const res = db.exec(
    "SELECT * FROM quiz_attempts WHERE user_id = ? ORDER BY completed_at DESC LIMIT ?",
    [userId, limit]
  );

  if (!res || res.length === 0 || !res[0].values) return [];
  const cols = res[0].columns;

  return res[0].values.map(row => {
    const get = (c: string) => row[cols.indexOf(c)];
    return {
      id: Number(get('id')),
      user_id: String(get('user_id')),
      topic: String(get('topic')),
      score: Number(get('score')),
      total_questions: Number(get('total_questions') || 30),
      percentage: Number(get('percentage')),
      answers: JSON.parse(String(get('answers_json') || '[]')),
      questions: JSON.parse(String(get('questions_json') || '[]')),
      time_spent_seconds: Number(get('time_spent_seconds') || 0),
      completed_at: String(get('completed_at'))
    };
  });
}

export async function getCachedTopicModule(topicNormalized: string): Promise<{ theory: any; questions: any[] } | null> {
  const db = await getDb();
  const res = db.exec("SELECT * FROM topic_modules WHERE topic_normalized = ?", [topicNormalized]);
  if (!res || res.length === 0 || !res[0].values || res[0].values.length === 0) return null;
  const row = res[0].values[0];
  const cols = res[0].columns;
  const get = (c: string) => row[cols.indexOf(c)];

  return {
    theory: JSON.parse(String(get('theory_json'))),
    questions: JSON.parse(String(get('questions_json')))
  };
}

export async function cacheTopicModule(
  topicNormalized: string,
  topicTitle: string,
  theory: any,
  questions: any[]
): Promise<void> {
  const db = await getDb();
  const now = new Date().toISOString();
  db.run(
    `INSERT INTO topic_modules (topic_normalized, topic_title, theory_json, questions_json, created_at)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(topic_normalized) DO UPDATE SET
       topic_title = excluded.topic_title,
       theory_json = excluded.theory_json,
       questions_json = excluded.questions_json`,
    [topicNormalized, topicTitle, JSON.stringify(theory), JSON.stringify(questions), now]
  );
  saveDbToFile(db);
}


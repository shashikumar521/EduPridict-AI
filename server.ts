import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { runInference } from './server/ml';
import {
  getAllStudents,
  upsertStudent,
  getAllPredictions,
  insertPrediction,
  deletePrediction,
  getAcademicRecords,
  addAcademicRecord,
  getPlannerTasks,
  addPlannerTask,
  updatePlannerTaskStatus,
  deletePlannerTask,
  getGoals,
  addGoal,
  updateGoalProgress,
  getRoadmapTopics,
  updateRoadmapTopicStatus,
  getSavedCourses,
  toggleSaveCourse,
  getExamReadinessAssessments,
  addExamReadinessAssessment,
  getNotifications,
  markNotificationAsRead,
  getDashboardStats
} from './server/db';
import { VERIFIED_COURSES, getCoursesForEducationLevel } from './server/courses';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  const isProd = process.env.NODE_ENV === 'production';

  app.use(express.json());

  // 1. Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'healthy',
      service: 'EduPredict AI Full-Stack Platform',
      version: '2.4.0',
      timestamp: new Date().toISOString()
    });
  });

  // 2. Course catalogue
  app.get('/api/courses', (req, res) => {
    const level = req.query.level as string;
    if (level) {
      return res.json(getCoursesForEducationLevel(level));
    }
    return res.json(VERIFIED_COURSES);
  });

  // 3. Supervised ML Prediction
  app.post('/api/predict', (req, res) => {
    try {
      const {
        student_id,
        student_name,
        education_level,
        sub_level,
        stream_or_branch,
        course,
        attendance,
        study_hours,
        previous_marks,
        assignment_score,
        practical_score,
        extra_academic_score,
        model_type
      } = req.body;

      if (attendance === undefined || attendance === null || isNaN(Number(attendance))) {
        return res.status(400).json({ error: 'Attendance percentage is required (0–100).' });
      }
      if (previous_marks === undefined || previous_marks === null || isNaN(Number(previous_marks))) {
        return res.status(400).json({ error: 'Previous examination marks is required (0–100).' });
      }
      if (assignment_score === undefined || assignment_score === null || isNaN(Number(assignment_score))) {
        return res.status(400).json({ error: 'Assignment score is required (0–100).' });
      }
      if (study_hours === undefined || study_hours === null || isNaN(Number(study_hours))) {
        return res.status(400).json({ error: 'Study hours is required (0–40 hours per week).' });
      }

      const prediction = runInference({
        student_id: student_id ? String(student_id).trim() : 'STD-00000',
        student_name: student_name ? String(student_name).trim() : 'Student',
        education_level: education_level || 'btech',
        sub_level: sub_level || '',
        stream_or_branch: stream_or_branch || '',
        course: course || 'Core Academic Subject',
        attendance: Number(attendance),
        study_hours: Number(study_hours),
        previous_marks: Number(previous_marks),
        assignment_score: Number(assignment_score),
        practical_score: practical_score !== undefined ? Number(practical_score) : undefined,
        extra_academic_score: extra_academic_score !== undefined ? Number(extra_academic_score) : undefined,
        model_type: model_type || 'rf'
      });

      return res.json(prediction);
    } catch (err: any) {
      console.error('Error in /api/predict:', err);
      return res.status(500).json({ error: 'Inference engine failed: ' + (err?.message || 'Internal error') });
    }
  });

  // 4. What-If Scenario Analysis (Does not save to database)
  app.post('/api/what-if', (req, res) => {
    try {
      const { baseline, hypothetical } = req.body;
      if (!baseline || !hypothetical) {
        return res.status(400).json({ error: 'Both baseline and hypothetical parameters are required.' });
      }

      const baseResult = runInference(baseline);
      const hypResult = runInference(hypothetical);

      const deltaScore = Number((hypResult.projected_score - baseResult.projected_score).toFixed(1));
      const categoryChanged = hypResult.predicted_category !== baseResult.predicted_category;

      return res.json({
        baseline: baseResult,
        hypothetical: hypResult,
        deltaScore,
        categoryChanged,
        disclaimer: 'This what-if simulation demonstrates statistical sensitivity from the trained machine learning model. It is an educational planning estimate, not a guaranteed grade outcome.'
      });
    } catch (err: any) {
      console.error('Error in /api/what-if:', err);
      return res.status(500).json({ error: 'What-If analysis failed: ' + (err?.message || 'Internal error') });
    }
  });

  // 5. Students Directory
  app.get('/api/students', async (req, res) => {
    try {
      const students = await getAllStudents();
      res.json(students);
    } catch (err: any) {
      console.error('Error fetching students:', err);
      res.status(500).json({ error: 'Failed to retrieve students from database' });
    }
  });

  app.post('/api/students', async (req, res) => {
    try {
      const {
        student_id,
        student_name,
        education_level,
        stream_or_branch,
        course,
        attendance,
        study_hours,
        previous_marks,
        assignment_score,
        practical_score
      } = req.body;

      if (!student_id || !student_name) {
        return res.status(400).json({ error: 'Student ID and Student Name are required.' });
      }

      const att = Number(attendance) || 75;
      const hrs = Number(study_hours) || 10;
      const prev = Number(previous_marks) || 65;
      const assign = Number(assignment_score) || 65;
      const pract = practical_score !== undefined ? Number(practical_score) : 0;
      const hrsNorm = Math.min(100, hrs * 4.0);
      const composite = (att * 0.342) + (assign * 0.286) + (hrsNorm * 0.214) + (prev * 0.158);
      const risk = composite < 60 ? 'critical' : (composite < 75 ? 'borderline' : 'good');

      await upsertStudent({
        id: String(student_id).trim(),
        name: String(student_name).trim(),
        education_level: education_level || 'btech',
        stream_or_branch: stream_or_branch || '',
        course: course || 'Core Academic Subject',
        attendance: att,
        study_hours: hrs,
        previous_marks: prev,
        assignment_score: assign,
        practical_score: pract,
        predicted_risk: risk,
        is_demo: false
      });

      res.status(201).json({ status: 'success', message: 'Student saved successfully' });
    } catch (err: any) {
      console.error('Error adding student:', err);
      res.status(500).json({ error: 'Failed to save student record' });
    }
  });

  // 6. Prediction History
  app.get('/api/predictions', async (req, res) => {
    try {
      const predictions = await getAllPredictions();
      res.json(predictions);
    } catch (err: any) {
      console.error('Error fetching predictions:', err);
      res.status(500).json({ error: 'Failed to retrieve prediction history' });
    }
  });

  app.post('/api/predictions', async (req, res) => {
    try {
      const {
        student_id,
        student_name,
        education_level,
        stream_or_branch,
        course,
        model_used,
        attendance,
        study_hours,
        previous_marks,
        assignment_score,
        practical_score,
        predicted_category,
        confidence,
        projected_score,
        recommendations,
        study_plan,
        recommended_courses,
        advisor
      } = req.body;

      if (!student_id || !predicted_category) {
        return res.status(400).json({ error: 'student_id and predicted_category are required.' });
      }

      const insertId = await insertPrediction({
        student_id: String(student_id),
        student_name: student_name || 'Anonymous Student',
        education_level: education_level || 'btech',
        stream_or_branch: stream_or_branch || '',
        course: course || 'Core Academic Subject',
        model_used: model_used || 'Random Forest v2.4 (Ensemble)',
        attendance: Number(attendance) || 0,
        study_hours: Number(study_hours) || 0,
        previous_marks: Number(previous_marks) || 0,
        assignment_score: Number(assignment_score) || 0,
        practical_score: practical_score !== undefined ? Number(practical_score) : 0,
        predicted_category: String(predicted_category),
        confidence: Number(confidence) || 85.0,
        projected_score: Number(projected_score) || 60.0,
        recommendations: Array.isArray(recommendations) ? recommendations : [],
        study_plan: study_plan || {},
        recommended_courses: Array.isArray(recommended_courses) ? recommended_courses : [],
        advisor: advisor || 'Dr. Elena Rostova',
        is_demo: false
      });

      res.status(201).json({
        status: 'success',
        id: insertId,
        message: 'Prediction persisted to audit history'
      });
    } catch (err: any) {
      console.error('Error saving prediction:', err);
      res.status(500).json({ error: 'Failed to save prediction record' });
    }
  });

  app.delete('/api/predictions/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      await deletePrediction(id);
      res.json({ status: 'success', message: 'Record deleted from audit log' });
    } catch (err: any) {
      console.error('Error deleting prediction:', err);
      res.status(500).json({ error: 'Failed to delete record' });
    }
  });

  // 7. Academic Records (Progress Tracking)
  app.get('/api/academic-records', async (req, res) => {
    try {
      const studentId = req.query.student_id as string;
      const records = await getAcademicRecords(studentId);
      res.json(records);
    } catch (err: any) {
      console.error('Error fetching academic records:', err);
      res.status(500).json({ error: 'Failed to fetch academic records' });
    }
  });

  app.post('/api/academic-records', async (req, res) => {
    try {
      const { student_id, subject, marks, attendance, assignment_score, assessment_type, recorded_date, notes } = req.body;
      if (!student_id || !subject) {
        return res.status(400).json({ error: 'student_id and subject are required.' });
      }

      const id = await addAcademicRecord({
        student_id,
        subject,
        marks: Number(marks) || 0,
        attendance: Number(attendance) || 0,
        assignment_score: Number(assignment_score) || 0,
        assessment_type: assessment_type || 'Internal Test',
        recorded_date: recorded_date || new Date().toISOString().slice(0, 10),
        notes: notes || ''
      });

      res.status(201).json({ status: 'success', id });
    } catch (err: any) {
      console.error('Error adding academic record:', err);
      res.status(500).json({ error: 'Failed to record performance metric' });
    }
  });

  // 8. Study Planner Tasks
  app.get('/api/planner-tasks', async (req, res) => {
    try {
      const studentId = req.query.student_id as string;
      const tasks = await getPlannerTasks(studentId);
      res.json(tasks);
    } catch (err: any) {
      console.error('Error fetching planner tasks:', err);
      res.status(500).json({ error: 'Failed to load study planner' });
    }
  });

  app.post('/api/planner-tasks', async (req, res) => {
    try {
      const { student_id, title, subject, day_of_week, time_slot, duration_minutes, priority, status } = req.body;
      if (!title || !subject) {
        return res.status(400).json({ error: 'Title and subject are required.' });
      }

      const id = await addPlannerTask({
        student_id: student_id || 'STD-88429',
        title,
        subject,
        day_of_week: day_of_week || 'Monday',
        time_slot: time_slot || '17:00 - 18:00',
        duration_minutes: Number(duration_minutes) || 60,
        priority: priority || 'medium',
        status: status || 'pending'
      });

      res.status(201).json({ status: 'success', id });
    } catch (err: any) {
      console.error('Error adding planner task:', err);
      res.status(500).json({ error: 'Failed to save task' });
    }
  });

  app.patch('/api/planner-tasks/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const { status } = req.body;
      await updatePlannerTaskStatus(id, status);
      res.json({ status: 'success' });
    } catch (err: any) {
      console.error('Error updating task:', err);
      res.status(500).json({ error: 'Failed to update task' });
    }
  });

  app.delete('/api/planner-tasks/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      await deletePlannerTask(id);
      res.json({ status: 'success' });
    } catch (err: any) {
      console.error('Error deleting task:', err);
      res.status(500).json({ error: 'Failed to delete task' });
    }
  });

  // 9. Goals
  app.get('/api/goals', async (req, res) => {
    try {
      const studentId = req.query.student_id as string;
      const goals = await getGoals(studentId);
      res.json(goals);
    } catch (err: any) {
      console.error('Error fetching goals:', err);
      res.status(500).json({ error: 'Failed to load goals' });
    }
  });

  app.post('/api/goals', async (req, res) => {
    try {
      const { student_id, title, category, target_date, progress_percent, is_completed } = req.body;
      if (!title) {
        return res.status(400).json({ error: 'Goal title is required.' });
      }

      const id = await addGoal({
        student_id: student_id || 'STD-88429',
        title,
        category: category || 'score',
        target_date: target_date || new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
        progress_percent: Number(progress_percent) || 0,
        is_completed: Boolean(is_completed)
      });

      res.status(201).json({ status: 'success', id });
    } catch (err: any) {
      console.error('Error creating goal:', err);
      res.status(500).json({ error: 'Failed to create goal' });
    }
  });

  app.patch('/api/goals/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const { progress_percent, is_completed } = req.body;
      await updateGoalProgress(id, Number(progress_percent) || 0, Boolean(is_completed));
      res.json({ status: 'success' });
    } catch (err: any) {
      console.error('Error updating goal:', err);
      res.status(500).json({ error: 'Failed to update goal' });
    }
  });

  // 10. Learning Roadmap Topics
  app.get('/api/roadmap-topics', async (req, res) => {
    try {
      const studentId = req.query.student_id as string;
      const topics = await getRoadmapTopics(studentId);
      res.json(topics);
    } catch (err: any) {
      console.error('Error fetching roadmap:', err);
      res.status(500).json({ error: 'Failed to load roadmap' });
    }
  });

  app.patch('/api/roadmap-topics/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const { status } = req.body;
      await updateRoadmapTopicStatus(id, status);
      res.json({ status: 'success' });
    } catch (err: any) {
      console.error('Error updating roadmap topic:', err);
      res.status(500).json({ error: 'Failed to update roadmap topic' });
    }
  });

  // 11. Saved Courses
  app.get('/api/saved-courses', async (req, res) => {
    try {
      const studentId = req.query.student_id as string;
      const list = await getSavedCourses(studentId);
      res.json(list);
    } catch (err: any) {
      console.error('Error fetching saved courses:', err);
      res.status(500).json({ error: 'Failed to fetch saved courses' });
    }
  });

  app.post('/api/saved-courses/toggle', async (req, res) => {
    try {
      const { student_id, course_id, status } = req.body;
      const isSaved = await toggleSaveCourse(student_id || 'STD-88429', course_id, status || 'saved');
      res.json({ status: 'success', isSaved });
    } catch (err: any) {
      console.error('Error toggling course save:', err);
      res.status(500).json({ error: 'Failed to update course save state' });
    }
  });

  // 12. Examination Readiness
  app.get('/api/exam-readiness', async (req, res) => {
    try {
      const studentId = req.query.student_id as string;
      const assessments = await getExamReadinessAssessments(studentId);
      res.json(assessments);
    } catch (err: any) {
      console.error('Error fetching readiness:', err);
      res.status(500).json({ error: 'Failed to fetch readiness assessment' });
    }
  });

  app.post('/api/exam-readiness', async (req, res) => {
    try {
      const { student_id, exam_name, exam_date, syllabus_completion, practice_score, revision_progress } = req.body;

      const syllabus = Math.max(0, Math.min(100, Number(syllabus_completion) || 0));
      const practice = Math.max(0, Math.min(100, Number(practice_score) || 0));
      const revision = Math.max(0, Math.min(100, Number(revision_progress) || 0));

      // Rule-based readiness calculation (clearly documented as rule-based planning estimate)
      const readiness_score = Number(((syllabus * 0.45) + (practice * 0.35) + (revision * 0.20)).toFixed(1));
      const readiness_tier = readiness_score >= 75
        ? 'High Readiness'
        : (readiness_score >= 55 ? 'Moderate Readiness' : 'Needs Urgent Preparation');

      const id = await addExamReadinessAssessment({
        student_id: student_id || 'STD-88429',
        exam_name: exam_name || 'Upcoming Semester Examination',
        exam_date: exam_date || new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
        syllabus_completion: syllabus,
        practice_score: practice,
        revision_progress: revision,
        readiness_score,
        readiness_tier
      });

      res.status(201).json({ status: 'success', id, readiness_score, readiness_tier });
    } catch (err: any) {
      console.error('Error creating readiness assessment:', err);
      res.status(500).json({ error: 'Failed to calculate examination readiness' });
    }
  });

  // 13. Notifications
  app.get('/api/notifications', async (req, res) => {
    try {
      const studentId = req.query.student_id as string;
      const notifs = await getNotifications(studentId);
      res.json(notifs);
    } catch (err: any) {
      console.error('Error fetching notifications:', err);
      res.status(500).json({ error: 'Failed to fetch notifications' });
    }
  });

  app.patch('/api/notifications/:id/read', async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      await markNotificationAsRead(id);
      res.json({ status: 'success' });
    } catch (err: any) {
      console.error('Error marking notification read:', err);
      res.status(500).json({ error: 'Failed to update notification' });
    }
  });

  // 14. Conversational AI Academic Counselor
  app.post('/api/counselor/chat', async (req, res) => {
    try {
      const { message, student_context } = req.body;
      if (!message || !String(message).trim()) {
        return res.status(400).json({ error: 'Message text is required.' });
      }

      const userText = String(message).trim();
      const apiKey = process.env.GEMINI_API_KEY;

      if (apiKey) {
        try {
          const ai = new GoogleGenAI({});
          const systemInstruction = `You are the EduPredict AI Academic Counselor. You help students improve study habits, overcome weak subjects, prepare for exams, and choose verified courses.
Guidelines:
1. Use simple, supportive, practical English.
2. Adapt advice to the student's education level (${student_context?.education_level || 'General'}).
3. Current context: Course=${student_context?.course || 'General'}, Attendance=${student_context?.attendance || 'N/A'}%, Last marks=${student_context?.previous_marks || 'N/A'}%.
4. Recommend verified courses when suitable (SWAYAM, NPTEL, Khan Academy, Cisco, Coursera, edX).
5. Do not make false promises or predict exact scores. Keep suggestions realistic and actionable.`;

          const response = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: [
              { role: 'user', parts: [{ text: `${systemInstruction}\n\nStudent asks: ${userText}` }] }
            ]
          });

          const replyText = response.text || 'I am here to help you improve your study routine and examination readiness. Let me know which subject or topic you would like to focus on!';
          return res.json({ reply: replyText, source: 'gemini' });
        } catch (apiErr: any) {
          console.warn('Gemini API call failed, using rule-based educational guidance fallback:', apiErr?.message);
        }
      }

      // Intelligent Offline Fallback Academic Counselor Engine
      let fallbackReply = '';
      const lower = userText.toLowerCase();

      if (lower.includes('math') || lower.includes('calculus') || lower.includes('algebra')) {
        fallbackReply = `To strengthen mathematics:
1. Practice 3–5 solved problems daily instead of only reading formulas.
2. Create a "Formula Sheet" and review it for 10 minutes every morning.
3. If you get stuck on a problem, write down the exact step where you paused.
4. Recommended resource: Khan Academy Class 10/11-12 Mathematics or NPTEL Foundation Math (free).`;
      } else if (lower.includes('attendance') || lower.includes('class')) {
        fallbackReply = `Attendance is the #1 predictor of final examination scores in our model (34.2% importance).
• Aim to attend at least 85% of your scheduled sessions for the next 3 weeks.
• If you missed a class, immediately borrow notes or review the syllabus unit with a classmate within 24 hours.`;
      } else if (lower.includes('exam') || lower.includes('test') || lower.includes('midterm')) {
        fallbackReply = `For upcoming examinations:
1. Prioritize topics with highest question weightage first.
2. Solve previous year question papers under a timed timer.
3. Review our "Examination Readiness" section to track your syllabus completion percentage!`;
      } else if (lower.includes('study plan') || lower.includes('timetable') || lower.includes('schedule')) {
        fallbackReply = `A great study routine uses 45-minute focused blocks with 10-minute breaks.
• Check out our "Study Planner" section to create an interactive weekly timetable customized to your daily hours!`;
      } else if (lower.includes('course') || lower.includes('programming') || lower.includes('ai') || lower.includes('python')) {
        fallbackReply = `For practical skills development:
• We recommend starting with "Programming, Data Structures and Algorithms in Python" (NPTEL / IIT Madras) or "Python Essentials" (Cisco Networking Academy) — both free to audit!
• Visit our "Course Recommendations" section for direct official links.`;
      } else {
        fallbackReply = `Hello! I am your EduPredict Academic Counselor.
Based on your academic profile, the best way to elevate your scores is consistent daily revision, solving practice assignments ahead of deadlines, and maintaining steady classroom attendance.
How can I assist you today? You can ask about:
• Preparing for an upcoming exam
• Creating a realistic study timetable
• Improving weak subject marks
• Recommended online courses for your level`;
      }

      return res.json({ reply: fallbackReply, source: 'counselor_knowledge_base' });
    } catch (err: any) {
      console.error('Error in /api/counselor/chat:', err);
      return res.status(500).json({ error: 'Academic counselor service error: ' + (err?.message || 'Internal error') });
    }
  });

  // 15. Model Analytics
  app.get('/api/model-metrics', (req, res) => {
    try {
      const metricsPath = path.resolve(__dirname, 'backend', 'model_metrics.json');
      if (fs.existsSync(metricsPath)) {
        const raw = fs.readFileSync(metricsPath, 'utf-8');
        return res.json(JSON.parse(raw));
      }
      return res.status(404).json({ error: 'Metrics not generated yet.' });
    } catch (err: any) {
      console.error('Error loading metrics:', err);
      res.status(500).json({ error: 'Failed to load model evaluation metrics' });
    }
  });

  // 16. Dashboard Summary
  app.get('/api/dashboard-summary', async (req, res) => {
    try {
      const stats = await getDashboardStats();
      res.json(stats);
    } catch (err: any) {
      console.error('Error loading dashboard stats:', err);
      res.status(500).json({ error: 'Failed to load dashboard summary' });
    }
  });

  // Mount Vite or static dist
  if (isProd) {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EduPredict AI server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Fatal error starting server:', err);
  process.exit(1);
});

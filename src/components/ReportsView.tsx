import React, { useState } from 'react';
import {
  FileText,
  Printer,
  Download,
  CheckCircle2,
  AlertTriangle,
  GraduationCap,
  Calendar,
  Sparkles,
  User,
  ShieldCheck,
  ChevronDown,
  BookOpen,
  Target,
  ExternalLink,
  Info
} from 'lucide-react';
import { StudentRecord, SavedPrediction } from '../types';
import { getEducationLevelConfig } from '../data/educationLevels';

interface ReportsViewProps {
  students: StudentRecord[];
  predictions?: SavedPrediction[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  students,
  predictions = []
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    students[0]?.id || 'STD-88429'
  );

  const student =
    students.find((s) => s.id === selectedStudentId) ||
    students[0] || {
      id: 'STD-88429',
      name: 'Marcus Vance',
      education_level: 'btech',
      stream_or_branch: 'Computer Science & Engineering',
      course: 'CS-204 Data Structures & Algorithms',
      attendance: 58.4,
      study_hours: 6.2,
      previous_marks: 48.0,
      assignment_score: 52.0,
      practical_score: 55.0,
      predicted_risk: 'critical' as const,
      is_demo: true,
      created_at: new Date().toISOString()
    };

  // Find latest saved prediction for this student
  const studentPrediction = predictions.find(
    (p) => p.student_id === selectedStudentId
  ) || predictions[0] || null;

  const levelConfig = getEducationLevelConfig(student.education_level as any);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const csvContent = [
      'Report,EduPredict AI - Academic Diagnostic Dossier',
      `Date,${new Date().toLocaleDateString()}`,
      `Student ID,${student.id}`,
      `Name,${student.name}`,
      `Education Level,${levelConfig.label}`,
      `Stream or Branch,${student.stream_or_branch || 'General'}`,
      `Course,${student.course}`,
      `Attendance (%),${student.attendance}`,
      `Previous Marks (%),${student.previous_marks}`,
      `Weekly Study Hours,${student.study_hours}`,
      `Continuous Coursework (%),${student.assignment_score}`,
      `Predicted Category,${studentPrediction ? studentPrediction.predicted_category : student.predicted_risk.toUpperCase()}`,
      `Projected Score (%),${studentPrediction ? studentPrediction.projected_score : 'N/A'}`,
      `Model Architecture,${studentPrediction ? studentPrediction.model_used : 'Random Forest Classifier v2.4 (Ensemble)'}`,
      `Confidence (%),${studentPrediction ? studentPrediction.confidence : '92.6%'}`,
      `Report Generated At,${new Date().toISOString()}`
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `EduPredict_Report_${student.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isAtRisk = studentPrediction
    ? studentPrediction.predicted_category.includes('Risk')
    : student.predicted_risk === 'critical';

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Bar (Hidden during printing) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900">
              Institutional Dossier
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500">Formal Academic Report</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-1 tracking-tight">
            Academic Performance Reports
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Generate printable early-warning evaluation dossiers for department heads, faculty mentors, and academic counseling committees.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer appearance-none pr-8"
            >
              {students.map((std) => (
                <option key={std.id} value={std.id}>
                  {std.name} ({std.id})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3.5 pointer-events-none" />
          </div>

          <button
            onClick={handleExportCSV}
            className="btn-secondary text-xs px-3.5 py-2.5 gap-1.5"
          >
            <Download className="w-4 h-4 text-purple-700 dark:text-purple-400" />
            <span>CSV Export</span>
          </button>

          <button
            onClick={handlePrint}
            className="btn-primary text-xs px-4 py-2.5 gap-1.5"
          >
            <Printer className="w-4 h-4 text-white" />
            <span className="text-white">Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Report Document Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-8 max-w-4xl mx-auto print:border-none print:shadow-none print:p-0 print:text-black">
        {/* Document Header */}
        <div className="flex items-start justify-between pb-6 border-b-2 border-slate-900 dark:border-slate-700 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xl">
              <GraduationCap className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                EduPredict AI Analytics
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Official Student Academic Performance & Early Intervention Dossier
              </p>
            </div>
          </div>

          <div className="text-right text-xs text-slate-500 dark:text-slate-400 space-y-0.5">
            <p>Report ID: <span className="font-mono font-bold text-slate-800 dark:text-slate-200">EDURPT-{student.id.replace('STD-', '')}</span></p>
            <p>Date: <span className="font-semibold text-slate-800 dark:text-slate-200">{new Date().toLocaleDateString()}</span></p>
            <p>Model Engine: <span className="font-semibold text-indigo-700 dark:text-indigo-400">{studentPrediction?.model_used || 'Random Forest v2.4 (Ensemble)'}</span></p>
          </div>
        </div>

        {/* Student Biographical Strip */}
        <div className="my-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 dark:text-slate-500 font-medium block">Student Name</span>
            <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">{student.name}</span>
          </div>
          <div>
            <span className="text-slate-400 dark:text-slate-500 font-medium block">Student ID</span>
            <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-sm">{student.id}</span>
          </div>
          <div>
            <span className="text-slate-400 dark:text-slate-500 font-medium block">Education Level</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{levelConfig.label}</span>
          </div>
          <div>
            <span className="text-slate-400 dark:text-slate-500 font-medium block">Primary Course</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">{student.course}</span>
          </div>
        </div>

        {/* 1. Core Academic Indicators Table */}
        <div className="space-y-3 my-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            1. Submitted Academic Input Metrics
          </h3>
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-2.5 px-4">Metric Factor</th>
                  <th className="py-2.5 px-4">Recorded Value</th>
                  <th className="py-2.5 px-4">Benchmark Standard</th>
                  <th className="py-2.5 px-4">Diagnostic Interpretation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                <tr>
                  <td className="py-2.5 px-4 font-semibold text-slate-800 dark:text-slate-200">Class Attendance Rate</td>
                  <td className="py-2.5 px-4 font-bold">{student.attendance}%</td>
                  <td className="py-2.5 px-4 text-slate-500">≥ 75.0% Mandatory</td>
                  <td className="py-2.5 px-4">
                    {student.attendance >= 75 ? (
                      <span className="text-emerald-700 dark:text-emerald-400 font-semibold">Compliant</span>
                    ) : (
                      <span className="text-rose-600 dark:text-rose-400 font-semibold">Critical Deficit ({75 - student.attendance}% short)</span>
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-semibold text-slate-800 dark:text-slate-200">Previous Examination Marks</td>
                  <td className="py-2.5 px-4 font-bold">{student.previous_marks}%</td>
                  <td className="py-2.5 px-4 text-slate-500">≥ 50.0% Pass</td>
                  <td className="py-2.5 px-4">
                    {student.previous_marks >= 60 ? (
                      <span className="text-emerald-700 dark:text-emerald-400 font-semibold">Good Foundation</span>
                    ) : (
                      <span className="text-amber-700 dark:text-amber-400 font-semibold">Requires Conceptual Reinforcement</span>
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-semibold text-slate-800 dark:text-slate-200">Self-Study Investment</td>
                  <td className="py-2.5 px-4 font-bold">{student.study_hours} hrs/week</td>
                  <td className="py-2.5 px-4 text-slate-500">12–15 hrs/week</td>
                  <td className="py-2.5 px-4">
                    {student.study_hours >= 12 ? (
                      <span className="text-emerald-700 dark:text-emerald-400 font-semibold">Adequate Volume</span>
                    ) : (
                      <span className="text-rose-600 dark:text-rose-400 font-semibold">Insufficient Study Routine</span>
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-semibold text-slate-800 dark:text-slate-200">Continuous Assessment Score</td>
                  <td className="py-2.5 px-4 font-bold">{student.assignment_score}%</td>
                  <td className="py-2.5 px-4 text-slate-500">≥ 60.0% Standard</td>
                  <td className="py-2.5 px-4">
                    {student.assignment_score >= 60 ? (
                      <span className="text-emerald-700 dark:text-emerald-400 font-semibold">Regular Submissions</span>
                    ) : (
                      <span className="text-amber-700 dark:text-amber-400 font-semibold">Deficit in Assignment Work</span>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 2. Machine Learning Predictive Verdict */}
        <div className="space-y-3 my-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            2. Machine Learning Predictive Verdict
          </h3>

          <div
            className={`p-4 rounded-xl border flex items-start gap-4 ${
              isAtRisk
                ? 'bg-rose-50/60 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900'
                : 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900'
            }`}
          >
            <div
              className={`p-2.5 rounded-lg text-white shrink-0 ${
                isAtRisk ? 'bg-rose-600' : 'bg-emerald-600'
              }`}
            >
              <ShieldCheck className="w-5 h-5" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Predicted Classification: {studentPrediction ? studentPrediction.predicted_category.toUpperCase() : student.predicted_risk.toUpperCase() + ' RISK'}
                </h4>
                <span className="text-[10px] font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                  {studentPrediction ? `${studentPrediction.confidence}% Confidence` : '92.6% Recall Benchmark'}
                </span>
                {studentPrediction && (
                  <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-400">
                    Projected: {studentPrediction.projected_score}%
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                Based on historical multi-term cohort training data, this student’s current feature pattern indicates a{' '}
                <strong>
                  {isAtRisk
                    ? 'high risk of end-term academic failure or probationary status'
                    : 'solid trajectory toward high academic standing'}
                </strong>{' '}
                without timely pedagogical intervention.
              </p>
            </div>
          </div>
        </div>

        {/* 3. Personalized Study Plan */}
        {studentPrediction?.study_plan && (
          <div className="space-y-3 my-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              3. Prescribed Study Plan
            </h3>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
              <p>
                <strong>Primary Objective:</strong> {studentPrediction.study_plan.primaryGoal}
              </p>
              <p>
                <strong>Study Cadence:</strong> {studentPrediction.study_plan.weeklyTargetHours} hrs/week — {studentPrediction.study_plan.dailyStudyRoutine}
              </p>
              <p>
                <strong>Revision Framework:</strong> {studentPrediction.study_plan.revisionStrategy}
              </p>
              <p>
                <strong>Next Assessment Target:</strong> {studentPrediction.study_plan.nextAssessmentTarget}
              </p>
            </div>
          </div>
        )}

        {/* 4. Verified Course Recommendations */}
        {studentPrediction?.recommended_courses && studentPrediction.recommended_courses.length > 0 && (
          <div className="space-y-3 my-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              4. Verified Recommended Courses
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {studentPrediction.recommended_courses.slice(0, 2).map((crs) => (
                <div key={crs.id} className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                  <span className="font-bold text-slate-900 dark:text-slate-100 block">{crs.name}</span>
                  <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">
                    {crs.provider} • {crs.difficulty} • {crs.pricing}
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{crs.outcome}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. Methodological Limitations & Ethical Disclaimer */}
        <div className="space-y-3 my-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            5. Model Limitations & Ethical AI Notice
          </h3>
          <div className="p-3.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-[11px] text-amber-900 dark:text-amber-300 space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <Info className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Advisory Early-Warning Tool</span>
            </div>
            <p className="leading-relaxed">
              This dossier is produced by supervised machine learning models calibrated on collegiate engineering benchmarks and secondary education cohorts. It serves as an advisory decision-support instrument for faculty mentors and counselors. Statistical predictions do not constitute a guarantee of future examination grades and do not substitute human faculty mentorship.
            </p>
          </div>
        </div>

        {/* Formal Sign-off Strip */}
        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
          <div>
            <p className="font-semibold text-slate-700 dark:text-slate-300">Dr. Elena Rostova</p>
            <p className="text-[11px]">Senior Academic Advisor & Internship Lead</p>
          </div>
          <div className="text-right">
            <p className="font-mono text-[11px]">Authorized Institutional Signature</p>
            <p className="text-[10px] text-slate-400">EduPredict AI Applied Intelligence Framework</p>
          </div>
        </div>
      </div>
    </div>
  );
};

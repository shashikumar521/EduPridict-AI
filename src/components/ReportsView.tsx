import React, { useState } from 'react';
import {
  FileText,
  Printer,
  Download,
  Share2,
  CheckCircle2,
  AlertTriangle,
  GraduationCap,
  Calendar,
  Sparkles,
  User,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import { StudentRecord } from '../types';

interface ReportsViewProps {
  students: StudentRecord[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({ students }) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    students[0]?.id || 'STD-88429'
  );

  const student =
    students.find((s) => s.id === selectedStudentId) ||
    students[0] || {
      id: 'STD-88429',
      name: 'Marcus Vance',
      education_level: 'Undergraduate (B.Tech)',
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

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const csvContent = [
      'Report,EduPredict AI - Academic Diagnostic Dossier',
      `Date,${new Date().toLocaleDateString()}`,
      `Student ID,${student.id}`,
      `Name,${student.name}`,
      `Education Level,${student.education_level}`,
      `Course,${student.course}`,
      `Attendance (%),${student.attendance}`,
      `Previous Marks (%),${student.previous_marks}`,
      `Study Hours / Week,${student.study_hours}`,
      `Continuous Assessment (%),${student.assignment_score}`,
      `Predicted Risk Category,${student.predicted_risk.toUpperCase()}`,
      'Model Architecture,Supervised Random Forest Classifier v2.4 (92.6% Recall)'
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

  const isAtRisk = student.predicted_risk === 'critical';
  const isModerate = student.predicted_risk === 'borderline';

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Bar */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
              Institutional Dossier
            </span>
            <span className="text-xs text-slate-400">Formal Academic Report</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 mt-1 tracking-tight">
            Academic Performance Reports
          </h2>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Generate printable early-warning evaluation dossiers for department heads, faculty mentors, and academic counseling committees.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer appearance-none pr-8"
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
            className="px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>CSV Export</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Dossier</span>
          </button>
        </div>
      </div>

      {/* Printable Report Document Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 max-w-4xl mx-auto print:border-none print:shadow-none print:p-0">
        {/* Document Header */}
        <div className="flex items-start justify-between pb-6 border-b-2 border-slate-900 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xl">
              <GraduationCap className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                EduPredict AI Analytics
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Official Academic Performance & Early Intervention Dossier
              </p>
            </div>
          </div>

          <div className="text-right text-xs text-slate-500 space-y-0.5">
            <p>Report ID: <span className="font-mono font-bold text-slate-800">EDURPT-{student.id.replace('STD-', '')}</span></p>
            <p>Generated: <span className="font-semibold text-slate-800">{new Date().toLocaleDateString()}</span></p>
            <p>Model Engine: <span className="font-semibold text-indigo-700">Random Forest v2.4</span></p>
          </div>
        </div>

        {/* Student Biographical Strip */}
        <div className="my-6 p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 font-medium block">Student Name</span>
            <span className="font-bold text-slate-900 text-sm">{student.name}</span>
          </div>
          <div>
            <span className="text-slate-400 font-medium block">Student Identification</span>
            <span className="font-mono font-bold text-slate-900 text-sm">{student.id}</span>
          </div>
          <div>
            <span className="text-slate-400 font-medium block">Education Level</span>
            <span className="font-semibold text-slate-800">{student.education_level || 'Undergraduate'}</span>
          </div>
          <div>
            <span className="text-slate-400 font-medium block">Primary Enrolled Course</span>
            <span className="font-semibold text-slate-800 truncate block">{student.course}</span>
          </div>
        </div>

        {/* Diagnostic Quantitative Metrics Table */}
        <div className="space-y-3 my-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            1. Core Academic Performance Indicators
          </h3>
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">Metric Factor</th>
                  <th className="py-2.5 px-4">Recorded Value</th>
                  <th className="py-2.5 px-4">Benchmark Standard</th>
                  <th className="py-2.5 px-4">Diagnostic Interpretation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-2.5 px-4 font-semibold text-slate-800">Class Attendance Rate</td>
                  <td className="py-2.5 px-4 font-bold">{student.attendance}%</td>
                  <td className="py-2.5 px-4 text-slate-500">≥ 75.0% Mandatory</td>
                  <td className="py-2.5 px-4">
                    {student.attendance >= 75 ? (
                      <span className="text-emerald-700 font-semibold">Compliant</span>
                    ) : (
                      <span className="text-rose-600 font-semibold">Critical Deficit ({75 - student.attendance}% short)</span>
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-semibold text-slate-800">Previous Examination Marks</td>
                  <td className="py-2.5 px-4 font-bold">{student.previous_marks}%</td>
                  <td className="py-2.5 px-4 text-slate-500">≥ 50.0% Pass</td>
                  <td className="py-2.5 px-4">
                    {student.previous_marks >= 60 ? (
                      <span className="text-emerald-700 font-semibold">Good Foundation</span>
                    ) : (
                      <span className="text-amber-700 font-semibold">Requires Conceptual Reinforcement</span>
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-semibold text-slate-800">Self-Study Investment</td>
                  <td className="py-2.5 px-4 font-bold">{student.study_hours} hrs/week</td>
                  <td className="py-2.5 px-4 text-slate-500">12–15 hrs/week</td>
                  <td className="py-2.5 px-4">
                    {student.study_hours >= 12 ? (
                      <span className="text-emerald-700 font-semibold">Adequate Volume</span>
                    ) : (
                      <span className="text-rose-600 font-semibold">Insufficient Study Routine</span>
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-semibold text-slate-800">Continuous Assessment Score</td>
                  <td className="py-2.5 px-4 font-bold">{student.assignment_score}%</td>
                  <td className="py-2.5 px-4 text-slate-500">≥ 60.0% Standard</td>
                  <td className="py-2.5 px-4">
                    {student.assignment_score >= 60 ? (
                      <span className="text-emerald-700 font-semibold">Regular Submissions</span>
                    ) : (
                      <span className="text-amber-700 font-semibold">Late Submissions Flagged</span>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Machine Learning Model Prediction Verdict */}
        <div className="space-y-3 my-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            2. Machine Learning Predictive Verdict
          </h3>

          <div
            className={`p-4 rounded-xl border flex items-start gap-4 ${
              isAtRisk
                ? 'bg-rose-50/60 border-rose-200'
                : isModerate
                ? 'bg-amber-50/60 border-amber-200'
                : 'bg-emerald-50/60 border-emerald-200'
            }`}
          >
            <div
              className={`p-2.5 rounded-lg text-white shrink-0 ${
                isAtRisk ? 'bg-rose-600' : isModerate ? 'bg-amber-600' : 'bg-emerald-600'
              }`}
            >
              <ShieldCheck className="w-5 h-5" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-slate-900">
                  Predicted Classification: {student.predicted_risk.toUpperCase()} PERFORMANCE
                </h4>
                <span className="text-[10px] font-bold bg-white text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                  92.6% Recall Confidence
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Based on historical multi-term cohort training data, this student’s current feature pattern indicates a <strong>{isAtRisk ? 'high risk of end-term academic failure or probation' : isModerate ? 'moderate chance of passing on the borderline threshold' : 'strong trajectory toward high honors'}</strong> without early pedagogical intervention.
              </p>
            </div>
          </div>
        </div>

        {/* Actionable Intervention Prescription */}
        <div className="space-y-3 my-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            3. Recommended Intervention Roadmap
          </h3>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
            <div className="flex items-start gap-2 text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Academic Remediation:</strong> Schedule mandatory bi-weekly office hours with course faculty for foundational concepts in {student.course}.
              </span>
            </div>
            <div className="flex items-start gap-2 text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Study Habit Reformation:</strong> Increase structured self-study to a minimum of 14 hours/week using the Pomodoro 50/10 active recall framework.
              </span>
            </div>
            <div className="flex items-start gap-2 text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Attendance Compliance:</strong> Enforce unconditional attendance tracking to avoid end-semester examination debarment.
              </span>
            </div>
          </div>
        </div>

        {/* Formal Sign-off & Verification Strip */}
        <div className="mt-8 pt-6 border-t border-slate-200 flex items-center justify-between text-xs text-slate-400">
          <div>
            <p className="font-semibold text-slate-700">Dr. Elena Rostova</p>
            <p className="text-[11px]">Senior Academic Advisor & Head of Retention</p>
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

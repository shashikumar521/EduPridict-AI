import React from 'react';
import { Target, GitBranch, Layers, ShieldCheck, AlertCircle, BookOpen, GraduationCap, Award } from 'lucide-react';

export const AboutView: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          About EduPredict AI
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Mission, multi-level supervised machine learning methodology, datasets, verified course integrations, and responsible governance.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left 2 Cols: Details */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Problem Statement & Solution */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Target className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Problem Statement & Academic Objectives</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Students, teachers, and academic counselors often detect academic difficulties too late in the semester — typically only after failing a midterm exam or when attendance shortage notices are issued. EduPredict AI provides an early-warning decision support platform across all educational stages, from primary and secondary schools to polytechnic diplomas, undergraduate engineering, and postgraduate research degrees.
            </p>
          </div>

          {/* Multi-Level Education Support */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Multi-Level Education Coverage</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Different educational levels have unique learning rhythms. EduPredict AI dynamically adapts its questions, vocabulary, and metrics to match each student’s environment:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="font-bold text-slate-900 dark:text-slate-100 block mb-0.5">School (Classes 1–10)</span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Evaluates homework consistency, attendance, periodic tests, and foundational subjects.</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="font-bold text-slate-900 dark:text-slate-100 block mb-0.5">Higher Secondary (Classes 11–12)</span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Tracks academic streams (PCM, PCB, Commerce, Arts) and competitive entrance exam preparation.</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="font-bold text-slate-900 dark:text-slate-100 block mb-0.5">Diploma & B.Tech / B.E.</span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Analyzes semester CGPA, lab practical scores, internal evaluation, and engineering branch modules.</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="font-bold text-slate-900 dark:text-slate-100 block mb-0.5">Postgraduate (M.Tech, MBA, M.Sc.)</span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Evaluates advanced coursework, seminars, laboratory simulations, and thesis research progress.</p>
              </div>
            </div>
          </div>

          {/* Methodology Flow */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Machine Learning Methodology & Pipeline</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="font-bold text-indigo-600 dark:text-indigo-400 block mb-1">
                  1. Input Normalization & Scaling
                </span>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                  Scales self-study hours according to expected study capacities per level (10h for primary up to 25h for intermediate/postgraduate).
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="font-bold text-indigo-600 dark:text-indigo-400 block mb-1">
                  2. Supervised Ensemble Inference
                </span>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                  Executes Random Forest (Ensemble v2.4), Decision Tree (CART), and Logistic Regression on valid feature vectors.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="font-bold text-indigo-600 dark:text-indigo-400 block mb-1">
                  3. Calibrated At-Risk Recall
                </span>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                  Calibrated to maximize recall on the Critical At-Risk tier (92.6%) to eliminate false negatives where a struggling student drops out unassisted.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="font-bold text-indigo-600 dark:text-indigo-400 block mb-1">
                  4. Explainability & Course Matching
                </span>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                  Deploys local SHAP attributions and recommends verified, authentic courses from SWAYAM, NPTEL, Coursera, edX, and Khan Academy.
                </p>
              </div>
            </div>
          </div>

          {/* Responsible AI and Privacy Policy */}
          <div className="bg-amber-50/50 dark:bg-amber-950/20 rounded-xl p-5 border border-amber-200 dark:border-amber-900/60 shadow-xs space-y-3 text-xs">
            <h3 className="text-sm font-bold text-amber-900 dark:text-amber-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Responsible AI & Ethical Governance</span>
            </h3>
            <ul className="text-slate-600 dark:text-slate-300 space-y-2 list-disc list-inside leading-relaxed text-[11px]">
              <li>
                <strong>Estimates, Not Guarantees:</strong> Model predictions reflect historical statistical associations, not a student's permanent ability or guaranteed future score.
              </li>
              <li>
                <strong>Human-in-the-Loop Decision Support:</strong> Predictions must never be used as the sole or automated basis for punitive actions (such as academic suspension or scholarship termination).
              </li>
              <li>
                <strong>Zero Demographic Bias:</strong> Protected demographic features (gender, race, ethnicity, age, financial status) are strictly excluded from prediction tensors.
              </li>
              <li>
                <strong>Student Privacy (FERPA / GDPR):</strong> Student records are stored securely in local SQLite storage without external third-party tracking.
              </li>
            </ul>
          </div>
        </div>

        {/* Right Col: Technology Stack & Specs */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Technology Stack & Internship Context</span>
            </h3>

            <div className="p-3.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-xs space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-indigo-950 dark:text-indigo-200">IBM SkillsBuild Internship</span>
                <span className="text-[10px] font-bold bg-indigo-200 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-300 px-1.5 py-0.2 rounded">
                  Applied AI & ML
                </span>
              </div>
              <p className="text-indigo-900 dark:text-indigo-300 text-[11px] leading-relaxed">
                Developed as a comprehensive capstone for the <strong>IBM SkillsBuild Machine Learning and Applied AI</strong> internship program, showcasing supervised classification, explainability, multi-level academic scaffolding, and ethical early-warning intervention.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase font-semibold">
                  Frontend Application
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  React 19, TypeScript, Tailwind CSS, Lucide Icons
                </span>
              </div>

              <div>
                <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase font-semibold">
                  Full-Stack App Engine
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  Express + Vite Middleware, Node.js 22 Runtime
                </span>
              </div>

              <div>
                <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase font-semibold">
                  Python Backend Pipeline
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  FastAPI, Pydantic, Scikit-Learn, Pandas, NumPy
                </span>
              </div>

              <div>
                <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase font-semibold">
                  Persistent Storage
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  SQLite (Disk-Persisted Database in data/edupredict.sqlite)
                </span>
              </div>

              <div>
                <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase font-semibold">
                  Course Providers Integrated
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  SWAYAM, NPTEL, Coursera, edX, Khan Academy, Cisco, IBM, Microsoft
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-800 text-[11px]">
                <div className="font-bold flex items-center gap-1.5 mb-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Validated Multi-Cohort Engine
                </div>
                v2.4 calibrated on UCI Secondary Performance & Collegiate Engineering datasets with zero protected attribute leakage.
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

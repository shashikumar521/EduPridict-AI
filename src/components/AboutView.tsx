import React from 'react';
import { Target, GitBranch, Layers, ShieldCheck, AlertCircle, GraduationCap, Phone, Mail } from 'lucide-react';

export const AboutView: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-bold mb-2">
          Platform Architecture &amp; Ethics
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          About EduPredict AI
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-3xl leading-relaxed font-medium">
          Mission, multi-level supervised machine learning methodology, datasets, verified course integrations, and responsible academic governance.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left 2 Cols: Details */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Problem Statement & Solution */}
          <div className="bg-white dark:bg-[#111827] rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>Problem Statement &amp; Academic Objectives</span>
            </h3>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
              Students, teachers, and academic counselors often detect academic difficulties too late in the semester — typically only after failing a midterm exam or when attendance shortage notices are issued. EduPredict AI provides an early-warning decision support platform across all educational stages, from primary and secondary schools to polytechnic diplomas, undergraduate engineering, and postgraduate research degrees.
            </p>
          </div>

          {/* Multi-Level Education Support */}
          <div className="bg-white dark:bg-[#111827] rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>Multi-Level Education Coverage</span>
            </h3>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
              Different educational levels have unique learning rhythms. EduPredict AI dynamically adapts its questions, vocabulary, and metrics to match each student’s environment:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#161F33] border border-slate-200 dark:border-slate-800">
                <span className="font-bold text-slate-900 dark:text-white block mb-0.5">School (Classes 1–10)</span>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">Evaluates homework consistency, attendance, periodic tests, and foundational subjects.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#161F33] border border-slate-200 dark:border-slate-800">
                <span className="font-bold text-slate-900 dark:text-white block mb-0.5">Higher Secondary (Classes 11–12)</span>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">Tracks academic streams (PCM, PCB, Commerce, Arts) and competitive entrance exam preparation.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#161F33] border border-slate-200 dark:border-slate-800">
                <span className="font-bold text-slate-900 dark:text-white block mb-0.5">Diploma &amp; B.Tech / B.E.</span>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">Analyzes semester CGPA, lab practical scores, internal evaluation, and engineering branch modules.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#161F33] border border-slate-200 dark:border-slate-800">
                <span className="font-bold text-slate-900 dark:text-white block mb-0.5">Postgraduate (M.Tech, MBA, M.Sc.)</span>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">Evaluates advanced coursework, seminars, laboratory simulations, and thesis research progress.</p>
              </div>
            </div>
          </div>

          {/* Methodology Flow */}
          <div className="bg-white dark:bg-[#111827] rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>Machine Learning Methodology &amp; Pipeline</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#161F33] border border-slate-200 dark:border-slate-800">
                <span className="font-bold text-purple-700 dark:text-purple-300 block mb-1">
                  1. Input Normalization &amp; Scaling
                </span>
                <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                  Scales self-study hours according to expected study capacities per level (10h for primary up to 25h for intermediate/postgraduate).
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#161F33] border border-slate-200 dark:border-slate-800">
                <span className="font-bold text-purple-700 dark:text-purple-300 block mb-1">
                  2. Supervised Ensemble Inference
                </span>
                <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                  Executes Random Forest (Ensemble v2.4), Decision Tree (CART), and Logistic Regression on valid feature vectors.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#161F33] border border-slate-200 dark:border-slate-800">
                <span className="font-bold text-purple-700 dark:text-purple-300 block mb-1">
                  3. Calibrated At-Risk Recall
                </span>
                <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                  Calibrated to maximize recall on the Critical At-Risk tier (92.6%) to eliminate false negatives where a struggling student drops out unassisted.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#161F33] border border-slate-200 dark:border-slate-800">
                <span className="font-bold text-purple-700 dark:text-purple-300 block mb-1">
                  4. Explainability &amp; Course Matching
                </span>
                <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                  Deploys local feature attributions and recommends verified, authentic courses from SWAYAM, NPTEL, Coursera, edX, and Khan Academy.
                </p>
              </div>
            </div>
          </div>

          {/* Responsible AI and Privacy Policy */}
          <div className="bg-amber-500/10 dark:bg-amber-950/40 rounded-2xl p-5 sm:p-6 border border-amber-300 dark:border-amber-800/80 shadow-sm space-y-3 text-xs">
            <h3 className="text-sm font-bold text-amber-900 dark:text-amber-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Responsible AI &amp; Ethical Governance</span>
            </h3>
            <ul className="text-slate-800 dark:text-slate-200 space-y-2 list-disc list-inside leading-relaxed text-[11px] font-medium">
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
          <div className="bg-white dark:bg-[#111827] rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>Technology Stack &amp; Internship Context</span>
            </h3>

            {/* Creator / Lead Developer */}
            <div className="p-3.5 rounded-xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 text-xs space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-800 dark:text-purple-300">
                Created By
              </span>
              <div className="font-extrabold text-slate-900 dark:text-white text-sm">
                Sudarsi Shashi Kumar
              </div>
              <p className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed font-medium">
                Academic Intelligence &amp; Student Performance Prediction
              </p>
              <div className="pt-2 flex flex-col gap-1 text-[11px] text-slate-600 dark:text-slate-400 border-t border-purple-200 dark:border-purple-800/80">
                <a href="tel:6303268680" className="hover:text-purple-700 dark:hover:text-purple-300 transition-colors flex items-center gap-1.5 font-semibold">
                  <Phone className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                  <span>6303268680</span>
                </a>
                <a href="mailto:shashisudarsi@gmail.com" className="hover:text-purple-700 dark:hover:text-purple-300 transition-colors flex items-center gap-1.5 font-semibold">
                  <Mail className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                  <span>shashisudarsi@gmail.com</span>
                </a>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-purple-100/70 dark:bg-purple-900/30 border border-purple-300 dark:border-purple-700 text-xs space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-purple-900 dark:text-purple-200">IBM SkillsBuild Internship</span>
                <span className="text-[10px] font-bold bg-purple-200 dark:bg-purple-800/60 text-purple-900 dark:text-purple-200 px-1.5 py-0.5 rounded">
                  Applied AI &amp; ML
                </span>
              </div>
              <p className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed font-medium">
                Developed as a comprehensive capstone for the <strong>IBM SkillsBuild Machine Learning and Applied AI</strong> internship program, showcasing supervised classification, explainability, multi-level academic scaffolding, and ethical early-warning intervention.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-600 dark:text-slate-400 block text-[10px] uppercase font-bold">
                  Frontend Application
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  React 19, TypeScript, Tailwind CSS, Lucide Icons
                </span>
              </div>

              <div>
                <span className="text-slate-600 dark:text-slate-400 block text-[10px] uppercase font-bold">
                  Full-Stack App Engine
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  Express + Vite Middleware, Node.js 22 Runtime
                </span>
              </div>

              <div>
                <span className="text-slate-600 dark:text-slate-400 block text-[10px] uppercase font-bold">
                  Python Backend Pipeline
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  FastAPI, Pydantic, Scikit-Learn, Pandas, NumPy
                </span>
              </div>

              <div>
                <span className="text-slate-600 dark:text-slate-400 block text-[10px] uppercase font-bold">
                  Persistent Storage
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  SQLite (Disk-Persisted Database in data/edupredict.sqlite)
                </span>
              </div>

              <div>
                <span className="text-slate-600 dark:text-slate-400 block text-[10px] uppercase font-bold">
                  Course Providers Integrated
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  SWAYAM, NPTEL, Coursera, edX, Khan Academy, Cisco, IBM, Microsoft
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
              <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800 text-[11px] font-medium">
                <div className="font-bold flex items-center gap-1.5 mb-1 text-emerald-800 dark:text-emerald-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  Validated Multi-Cohort Engine
                </div>
                v2.4 calibrated on UCI Secondary Performance &amp; Collegiate Engineering datasets with zero protected attribute leakage.
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

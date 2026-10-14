import React, { useState } from 'react';
import { Download, Search, RefreshCw, BookmarkPlus, GraduationCap, CheckCircle, Trash2, AlertCircle } from 'lucide-react';
import { SavedPrediction } from '../types';
import { getEducationLevelConfig } from '../data/educationLevels';
import { deletePrediction } from '../services/api';

interface HistoryViewProps {
  predictions: SavedPrediction[];
  isLoading: boolean;
  onRefresh: () => void;
  onNavigateToPredict: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  predictions,
  isLoading,
  onRefresh,
  onNavigateToPredict
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState<'all' | 'risk' | 'moderate' | 'high'>('all');
  const [sourceFilter, setSourceFilter] = useState<'all' | 'verified' | 'demo'>('all');
  const [selectedPrediction, setSelectedPrediction] = useState<SavedPrediction | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredPredictions = predictions.filter((p) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      p.student_name.toLowerCase().includes(q) ||
      p.student_id.toLowerCase().includes(q) ||
      p.course.toLowerCase().includes(q) ||
      (p.stream_or_branch && p.stream_or_branch.toLowerCase().includes(q));

    let matchesTier = true;
    const cat = p.predicted_category.toLowerCase();
    if (tierFilter === 'risk') matchesTier = cat.includes('risk');
    if (tierFilter === 'moderate') matchesTier = cat.includes('moderate');
    if (tierFilter === 'high') matchesTier = cat.includes('high') || cat.includes('distinction');

    let matchesSource = true;
    if (sourceFilter === 'verified') matchesSource = !p.is_demo;
    if (sourceFilter === 'demo') matchesSource = p.is_demo;

    return matchesSearch && matchesTier && matchesSource;
  });

  const handleExportCsv = () => {
    if (predictions.length === 0) {
      setFeedbackMessage('No prediction records are currently available to export.');
      setTimeout(() => setFeedbackMessage(null), 3500);
      return;
    }

    const headers = [
      'Timestamp',
      'Record Origin',
      'Student ID',
      'Student Name',
      'Education Level',
      'Stream or Branch',
      'Course',
      'Model Used',
      'Attendance (%)',
      'Study Hours (wk)',
      'Previous Marks (%)',
      'Assignment Score (%)',
      'Predicted Category',
      'Confidence (%)',
      'Projected Score (%)',
      'Advisor'
    ];

    const rows = predictions.map((p) => [
      `"${p.created_at}"`,
      p.is_demo ? '"Demo Benchmark"' : '"Verified User Saved"',
      `"${p.student_id}"`,
      `"${p.student_name}"`,
      `"${getEducationLevelConfig(p.education_level as any).label}"`,
      `"${p.stream_or_branch || ''}"`,
      `"${p.course}"`,
      `"${p.model_used}"`,
      p.attendance,
      p.study_hours,
      p.previous_marks,
      p.assignment_score,
      `"${p.predicted_category}"`,
      p.confidence,
      p.projected_score,
      `"${p.advisor}"`
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `EduPredict_Inference_History_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Historical Model Predictions Log</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Audit trail of past predictions across school and higher education cohorts persisted in SQLite.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleExportCsv}
            className="btn-secondary text-xs px-3 py-1.5 gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Log (CSV)</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1 min-w-0">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search prediction history by name, ID, or course..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value as any)}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="all">All Performance Tiers</option>
            <option value="risk">At-Risk Only</option>
            <option value="moderate">Moderate Standing Only</option>
            <option value="high">High Performance Only</option>
          </select>

          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value as any)}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="all">All Records</option>
            <option value="verified">Verified User Saved</option>
            <option value="demo">Demo Benchmark Samples</option>
          </select>

          <button
            onClick={onRefresh}
            title="Refresh database predictions"
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition cursor-pointer"
            aria-label="Refresh predictions"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300 min-w-[700px]">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-[11px] uppercase font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5">Student & Level</th>
                <th className="p-3.5">Model Used</th>
                <th className="p-3.5">Inputs (Att / Study / Marks)</th>
                <th className="p-3.5">Predicted Result</th>
                <th className="p-3.5">Confidence</th>
                <th className="p-3.5">Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    Loading historical records from SQLite...
                  </td>
                </tr>
              ) : filteredPredictions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    <div className="max-w-xs mx-auto space-y-2">
                      <BookmarkPlus className="w-8 h-8 mx-auto opacity-40 text-slate-400" />
                      <p className="font-semibold text-slate-700">No prediction history found.</p>
                      <p className="text-[11px]">Run a prediction on the Predict tab and click "Save to Prediction Log".</p>
                      <button
                        onClick={onNavigateToPredict}
                        className="btn-primary text-xs px-3.5 py-1.5 mt-2"
                      >
                        Create New Prediction
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPredictions.map((pred) => {
                  const isRisk = pred.predicted_category.toLowerCase().includes('risk');
                  const isMod = pred.predicted_category.toLowerCase().includes('moderate');

                  const badgeClass = isRisk
                    ? 'bg-rose-100 text-rose-700 font-bold'
                    : isMod
                    ? 'bg-amber-100 text-amber-800 font-bold'
                    : 'bg-emerald-100 text-emerald-700 font-bold';

                  const levelCfg = getEducationLevelConfig(pred.education_level as any);

                  return (
                    <tr
                      key={pred.id}
                      onClick={() => setSelectedPrediction(pred)}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition cursor-pointer"
                    >
                      <td className="p-3.5 text-slate-500 dark:text-slate-400 font-mono text-[11px] whitespace-nowrap">
                        {formatDate(pred.created_at)}
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900 dark:text-slate-100">{pred.student_name}</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                          {pred.student_id} • {levelCfg.label.split('(')[0]}
                        </div>
                        <div className="text-[10px] text-purple-600 dark:text-purple-400 font-medium truncate max-w-[200px]">
                          {pred.course}
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded text-[10px] font-medium whitespace-nowrap">
                          {pred.model_used.split(' ')[0]}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-600 dark:text-slate-300 font-medium whitespace-nowrap">
                        {pred.attendance}% / {pred.study_hours}h / {pred.previous_marks}%
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[11px] ${badgeClass}`}>
                          {pred.predicted_category} ({pred.projected_score}%)
                        </span>
                      </td>
                      <td className="p-3.5 font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                        {pred.confidence}%
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        {pred.is_demo ? (
                          <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                            Demo
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                            Verified
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Historical Detail Modal / Drawer */}
      {selectedPrediction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 dark:border-slate-800 my-8 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {selectedPrediction.student_name} ({selectedPrediction.student_id})
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {getEducationLevelConfig(selectedPrediction.education_level as any).label}
                </p>
              </div>
              <button
                onClick={() => setSelectedPrediction(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 font-bold text-lg"
                aria-label="Close details"
              >
                ×
              </button>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 text-xs space-y-1.5 border border-slate-200 dark:border-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Predicted Category:</span>
                <strong className="text-slate-900 dark:text-slate-100">{selectedPrediction.predicted_category}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Confidence Score:</span>
                <strong className="text-slate-900 dark:text-slate-100">{selectedPrediction.confidence}%</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Projected Marks:</span>
                <strong className="text-slate-900 dark:text-slate-100">{selectedPrediction.projected_score}%</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Model:</span>
                <span className="text-slate-800 dark:text-slate-200 font-medium">{selectedPrediction.model_used}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Record Origin:</span>
                <span className="text-slate-800 dark:text-slate-200 font-medium">{selectedPrediction.is_demo ? 'Seeded Benchmark Sample' : 'Verified User Saved Profile'}</span>
              </div>
            </div>

            {selectedPrediction.study_plan && (
              <div className="p-3 rounded-lg bg-purple-50/70 dark:bg-purple-950/30 text-xs border border-purple-200 dark:border-purple-800 space-y-1">
                <h5 className="font-bold text-purple-900 dark:text-purple-300">Recorded Study Plan Target:</h5>
                <p className="text-[11px] text-slate-700 dark:text-slate-300">
                  {selectedPrediction.study_plan.primaryGoal || 'Follow syllabus pacing and weekly study targets.'}
                </p>
                <p className="text-[11px] text-purple-700 dark:text-purple-300 font-semibold">
                  Weekly Goal: {selectedPrediction.study_plan.weeklyTargetHours || selectedPrediction.study_hours} hrs/week
                </p>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                disabled={isDeleting}
                onClick={async () => {
                  if (!selectedPrediction) return;
                  setIsDeleting(true);
                  try {
                    await deletePrediction(selectedPrediction.id);
                    setSelectedPrediction(null);
                    setFeedbackMessage('Prediction record removed from audit log.');
                    onRefresh();
                    setTimeout(() => setFeedbackMessage(null), 3500);
                  } catch (err: any) {
                    setFeedbackMessage(err?.message || 'Failed to delete record.');
                  } finally {
                    setIsDeleting(false);
                  }
                }}
                className="btn-danger text-xs px-3 py-1.5 gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? 'Deleting...' : 'Delete Record'}</span>
              </button>

              <button
                onClick={() => setSelectedPrediction(null)}
                className="btn-secondary text-xs px-4 py-1.5"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

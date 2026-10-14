import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  BookOpen,
  Search,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  Filter,
  CheckCircle2,
  GraduationCap,
  Sparkles,
  Layers,
  Clock,
  Building2,
  Sliders,
  Check,
  ShieldCheck,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Tag,
  Award
} from 'lucide-react';
import { VERIFIED_COURSES, loadUserCoursePreferences } from '../data/courseCatalogue';
import { EDUCATION_LEVELS } from '../data/educationLevels';
import { EducationLevelId, VerifiedCourse, CoursePreferences, SectionId } from '../types';
import { CoursePreferencesModal } from './CoursePreferencesModal';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { fetchSavedCourses, toggleSaveCourse } from '../services/api';

interface CourseRecommendationsViewProps {
  onNavigate?: (section: SectionId) => void;
}

const SAVED_COURSES_STORAGE_KEY = 'edupredict_saved_courses';

export const CourseRecommendationsView: React.FC<CourseRecommendationsViewProps> = ({
  onNavigate
}) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedProvider, setSelectedProvider] = useState<string>('all');
  const [selectedPricing, setSelectedPricing] = useState<string>('all');
  const [selectedDuration, setSelectedDuration] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Preferences modal
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const [userPrefs, setUserPrefs] = useState<CoursePreferences>(loadUserCoursePreferences);

  // Saved / In-Progress courses state (sync with backend + localStorage fallback)
  const [savedCourses, setSavedCourses] = useState<Record<string, 'saved' | 'in_progress' | 'completed'>>(() => {
    try {
      const raw = localStorage.getItem(SAVED_COURSES_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return {
      'cs50x-intro-cs': 'saved',
      'nptel-dsa-python': 'in_progress'
    };
  });

  // Sync saved courses with backend on mount
  useEffect(() => {
    const loadBackendSavedCourses = async () => {
      try {
        const studentId = user?.id || 'demo-student';
        const remoteList = await fetchSavedCourses(studentId).catch(() => []);
        if (Array.isArray(remoteList) && remoteList.length > 0) {
          setSavedCourses((prev) => {
            const next = { ...prev };
            remoteList.forEach((item: any) => {
              if (item.course_id && item.status) {
                next[item.course_id] = item.status as any;
              }
            });
            localStorage.setItem(SAVED_COURSES_STORAGE_KEY, JSON.stringify(next));
            return next;
          });
        }
      } catch (err) {
        console.warn('Could not hydrate saved courses from server, using local store:', err);
      }
    };
    loadBackendSavedCourses();
  }, [user]);

  // Persist local changes
  const updateSavedStatus = useCallback(
    async (courseId: string, nextStatus: 'saved' | 'in_progress' | 'completed' | 'none') => {
      setSavedCourses((prev) => {
        const updated = { ...prev };
        if (nextStatus === 'none') {
          delete updated[courseId];
        } else {
          updated[courseId] = nextStatus;
        }
        localStorage.setItem(SAVED_COURSES_STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });

      try {
        const studentId = user?.id || 'demo-student';
        await toggleSaveCourse(studentId, courseId, nextStatus).catch(() => {});
      } catch (err) {
        console.warn('Failed to sync course status to API:', err);
      }
    },
    [user]
  );

  const cycleCourseStatus = (courseId: string) => {
    const current = savedCourses[courseId];
    if (!current) {
      updateSavedStatus(courseId, 'saved');
    } else if (current === 'saved') {
      updateSavedStatus(courseId, 'in_progress');
    } else if (current === 'in_progress') {
      updateSavedStatus(courseId, 'completed');
    } else {
      updateSavedStatus(courseId, 'none');
    }
  };

  // Distinct Filter Options
  const categories = useMemo(() => {
    const set = new Set<string>();
    VERIFIED_COURSES.forEach((c) => set.add(c.category));
    return Array.from(set).sort();
  }, []);

  const providers = useMemo(() => {
    const set = new Set<string>();
    VERIFIED_COURSES.forEach((c) => set.add(c.provider));
    return Array.from(set).sort();
  }, []);

  // Filter logic
  const filteredCourses = useMemo(() => {
    return VERIFIED_COURSES.filter((course) => {
      // Search
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        q === '' ||
        course.name.toLowerCase().includes(q) ||
        course.provider.toLowerCase().includes(q) ||
        course.category.toLowerCase().includes(q) ||
        course.outcome.toLowerCase().includes(q) ||
        (course.skills && course.skills.some((s) => s.toLowerCase().includes(q)));

      // Category
      const matchesCategory =
        selectedCategory === 'all' || course.category === selectedCategory;

      // Difficulty
      const matchesDifficulty =
        selectedDifficulty === 'all' || course.difficulty === selectedDifficulty;

      // Provider
      const matchesProvider =
        selectedProvider === 'all' || course.provider === selectedProvider;

      // Pricing
      const matchesPricing =
        selectedPricing === 'all' || course.pricing === selectedPricing;

      // Duration
      let matchesDuration = true;
      if (selectedDuration === 'short') {
        matchesDuration = !!(course.duration && (course.duration.includes('hrs') || course.duration.includes('hours') || course.duration.includes('7 weeks')));
      } else if (selectedDuration === 'medium') {
        matchesDuration = !!(course.duration && (course.duration.includes('8 weeks') || course.duration.includes('9 weeks')));
      } else if (selectedDuration === 'comprehensive') {
        matchesDuration = !!(course.duration && (course.duration.includes('12 weeks') || course.duration.includes('24 weeks') || course.duration.includes('3 months') || course.duration.includes('4 months') || course.duration.includes('6 months')));
      }

      // Status
      let matchesStatus = true;
      const status = savedCourses[course.id];
      if (selectedStatus === 'saved') {
        matchesStatus = status === 'saved';
      } else if (selectedStatus === 'in_progress') {
        matchesStatus = status === 'in_progress';
      } else if (selectedStatus === 'completed') {
        matchesStatus = status === 'completed';
      }

      return (
        matchesSearch &&
        matchesCategory &&
        matchesDifficulty &&
        matchesProvider &&
        matchesPricing &&
        matchesDuration &&
        matchesStatus
      );
    });
  }, [
    searchQuery,
    selectedCategory,
    selectedDifficulty,
    selectedProvider,
    selectedPricing,
    selectedDuration,
    selectedStatus,
    savedCourses
  ]);

  const activeFiltersCount = [
    selectedCategory !== 'all',
    selectedDifficulty !== 'all',
    selectedProvider !== 'all',
    selectedPricing !== 'all',
    selectedDuration !== 'all',
    selectedStatus !== 'all',
    searchQuery.trim() !== ''
  ].filter(Boolean).length;

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedDifficulty('all');
    setSelectedProvider('all');
    setSelectedPricing('all');
    setSelectedDuration('all');
    setSelectedStatus('all');
  };

  // Metrics
  const totalFreeCourses = VERIFIED_COURSES.filter((c) => c.pricing === '100% Free').length;
  const inProgressCount = Object.values(savedCourses).filter((s) => s === 'in_progress').length;
  const savedCount = Object.values(savedCourses).filter((s) => s === 'saved').length;
  const completedCount = Object.values(savedCourses).filter((s) => s === 'completed').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Header & Overview Banner */}
      <div
        className={`p-6 rounded-2xl border transition-all ${
          isLight
            ? 'bg-white border-[#E2E8F0] text-[#172033] shadow-xs'
            : 'bg-[#1E293B] border-[#334155] text-[#F8FAFC] shadow-xs'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              {onNavigate && (
                <button
                  onClick={() => onNavigate('dashboard')}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#6D28D9] dark:text-[#DDD6FE] hover:underline mr-2 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Dashboard</span>
                </button>
              )}
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#EDE9FE] text-[#6D28D9] dark:bg-[#6D28D9]/25 dark:text-[#DDD6FE] border border-[#DDD6FE] dark:border-[#8B5CF6]/40">
                Verified Curriculum Discovery
              </span>
              <span className="text-xs text-[#526078] dark:text-slate-400">
                Official University &amp; Industry Courseware
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Recommended Courses &amp; Learning Discovery
            </h1>

            <p className="text-xs sm:text-sm text-[#526078] dark:text-slate-300 max-w-3xl leading-relaxed">
              Explore officially verified open-access courses from world-class institutions including Harvard (CS50), MIT OpenCourseWare, NPTEL IITs, Khan Academy, Stanford Online, and Google Cloud. Every link is verified to open the official course homepage.
            </p>
          </div>

          {/* Quick Preferences Button */}
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <button
              onClick={() => setIsPreferencesOpen(true)}
              className="btn-primary text-xs sm:text-sm px-4 py-2.5 gap-2 cursor-pointer"
            >
              <Sliders className="w-4 h-4 text-white" />
              <span>Customize Preferences</span>
            </button>
          </div>
        </div>

        {/* Course Statistics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-[#E8ECF3] dark:border-[#334155]">
          <div className="bg-[#F8FAFC] dark:bg-[#172033] p-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155]">
            <div className="flex items-center gap-2 text-xs text-[#526078] dark:text-slate-400">
              <GraduationCap className="w-4 h-4 text-[#6D28D9] dark:text-[#DDD6FE]" />
              <span className="font-medium">Total Courses</span>
            </div>
            <div className="text-xl font-bold mt-1 text-[#172033] dark:text-white">
              {VERIFIED_COURSES.length}
            </div>
            <p className="text-[11px] text-[#64748B] mt-0.5">100% Official Partners</p>
          </div>

          <div className="bg-[#F8FAFC] dark:bg-[#172033] p-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155]">
            <div className="flex items-center gap-2 text-xs text-[#526078] dark:text-slate-400">
              <Award className="w-4 h-4 text-[#15803D] dark:text-[#86EFAC]" />
              <span className="font-medium">100% Free Access</span>
            </div>
            <div className="text-xl font-bold mt-1 text-[#15803D] dark:text-[#86EFAC]">
              {totalFreeCourses}
            </div>
            <p className="text-[11px] text-[#64748B] mt-0.5">No subscription required</p>
          </div>

          <div className="bg-[#F8FAFC] dark:bg-[#172033] p-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155]">
            <div className="flex items-center gap-2 text-xs text-[#526078] dark:text-slate-400">
              <Clock className="w-4 h-4 text-[#B45309] dark:text-[#FCD34D]" />
              <span className="font-medium">In Progress</span>
            </div>
            <div className="text-xl font-bold mt-1 text-[#B45309] dark:text-[#FCD34D]">
              {inProgressCount}
            </div>
            <p className="text-[11px] text-[#64748B] mt-0.5">Active student tracks</p>
          </div>

          <div className="bg-[#F8FAFC] dark:bg-[#172033] p-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155]">
            <div className="flex items-center gap-2 text-xs text-[#526078] dark:text-slate-400">
              <BookmarkCheck className="w-4 h-4 text-[#1D4ED8] dark:text-[#93C5FD]" />
              <span className="font-medium">Saved / Completed</span>
            </div>
            <div className="text-xl font-bold mt-1 text-[#1D4ED8] dark:text-[#93C5FD]">
              {savedCount + completedCount}
            </div>
            <p className="text-[11px] text-[#64748B] mt-0.5">Bookmarked for study</p>
          </div>
        </div>
      </div>

      {/* 2. Comprehensive Filter and Search Controls */}
      <div
        className={`p-5 rounded-2xl border transition-all ${
          isLight
            ? 'bg-white border-[#E2E8F0] text-[#172033] shadow-xs'
            : 'bg-[#1E293B] border-[#334155] text-[#F8FAFC] shadow-xs'
        }`}
      >
        <div className="space-y-4">
          {/* Search Row */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search courses by title, skill (Python, SQL, Algorithms), subject, or official institution..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-hidden focus:ring-2 focus:ring-[#6D28D9] border ${
                isLight
                  ? 'bg-[#F8FAFC] border-[#E2E8F0] text-[#172033] placeholder:text-[#64748B]'
                  : 'bg-[#172033] border-[#334155] text-white placeholder:text-slate-500'
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 text-xs font-semibold cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Filter Dropdowns Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {/* 1. Category */}
            <div>
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-[#475569] dark:text-slate-300 block mb-1">
                Discipline
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className={`w-full text-xs font-medium rounded-lg px-2.5 py-2 border cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-[#6D28D9] ${
                  isLight
                    ? 'bg-slate-50 border-slate-300 text-slate-800'
                    : 'bg-slate-800 border-slate-700 text-slate-200'
                }`}
              >
                <option value="all">All Disciplines</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Difficulty */}
            <div>
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-[#475569] dark:text-slate-300 block mb-1">
                Difficulty
              </label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className={`w-full text-xs font-medium rounded-lg px-2.5 py-2 border cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-[#6D28D9] ${
                  isLight
                    ? 'bg-slate-50 border-slate-300 text-slate-800'
                    : 'bg-slate-800 border-slate-700 text-slate-200'
                }`}
              >
                <option value="all">All Levels</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            {/* 3. Provider */}
            <div>
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-[#475569] dark:text-slate-300 block mb-1">
                Official Provider
              </label>
              <select
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
                className={`w-full text-xs font-medium rounded-lg px-2.5 py-2 border cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-[#6D28D9] ${
                  isLight
                    ? 'bg-slate-50 border-slate-300 text-slate-800'
                    : 'bg-slate-800 border-slate-700 text-slate-200'
                }`}
              >
                <option value="all">All Providers</option>
                {providers.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            {/* 4. Pricing */}
            <div>
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-[#475569] dark:text-slate-300 block mb-1">
                Verified Pricing
              </label>
              <select
                value={selectedPricing}
                onChange={(e) => setSelectedPricing(e.target.value)}
                className={`w-full text-xs font-medium rounded-lg px-2.5 py-2 border cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-[#6D28D9] ${
                  isLight
                    ? 'bg-slate-50 border-slate-300 text-slate-800'
                    : 'bg-slate-800 border-slate-700 text-slate-200'
                }`}
              >
                <option value="all">All Access Types</option>
                <option value="100% Free">100% Free</option>
                <option value="Free to Audit">Free to Audit</option>
              </select>
            </div>

            {/* 5. Duration */}
            <div>
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-[#475569] dark:text-slate-300 block mb-1">
                Course Duration
              </label>
              <select
                value={selectedDuration}
                onChange={(e) => setSelectedDuration(e.target.value)}
                className={`w-full text-xs font-medium rounded-lg px-2.5 py-2 border cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-[#6D28D9] ${
                  isLight
                    ? 'bg-slate-50 border-slate-300 text-slate-800'
                    : 'bg-slate-800 border-slate-700 text-slate-200'
                }`}
              >
                <option value="all">All Durations</option>
                <option value="short">Short (&lt; 4 wks / self-paced)</option>
                <option value="medium">Medium (4–8 wks)</option>
                <option value="comprehensive">Comprehensive (8–12+ wks)</option>
              </select>
            </div>

            {/* 6. Saved Status */}
            <div>
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-[#475569] dark:text-slate-300 block mb-1">
                Learning Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className={`w-full text-xs font-medium rounded-lg px-2.5 py-2 border cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-[#7000E8] ${
                  isLight
                    ? 'bg-slate-50 border-slate-300 text-slate-800'
                    : 'bg-slate-800 border-slate-700 text-slate-200'
                }`}
              >
                <option value="all">All Statuses</option>
                <option value="saved">Bookmarked / Saved</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Active Filter Summary & Clear */}
          <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-slate-800 text-[#526078] dark:text-slate-400">
            <span>
              Showing <strong className="text-slate-900 dark:text-slate-100">{filteredCourses.length}</strong> verified courses
              {activeFiltersCount > 0 && ` (${activeFiltersCount} active filter${activeFiltersCount > 1 ? 's' : ''})`}
            </span>

            {activeFiltersCount > 0 && (
              <button
                onClick={handleResetFilters}
                className="text-xs font-semibold text-[#7000E8] dark:text-[#C4B5FD] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset All Filters</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. Course Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCourses.length === 0 ? (
          <div className="col-span-full p-12 text-center rounded-2xl border bg-white dark:bg-[#131926] border-slate-200 dark:border-slate-800">
            <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              No matching verified courses found
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
              We couldn’t find courses matching your current filter criteria. Try clearing search keywords or selecting broader categories.
            </p>
            <button
              onClick={handleResetFilters}
              className="btn-secondary text-xs mt-4 px-4 py-2 cursor-pointer font-semibold inline-flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          </div>
        ) : (
          filteredCourses.map((course) => {
            const status = savedCourses[course.id];
            return (
              <div
                key={course.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between group ${
                  isLight
                    ? 'bg-white border-[#E2E8F0] hover:border-[#6D28D9]/50 shadow-xs hover:shadow-md'
                    : 'bg-[#1E293B] border-[#334155] hover:border-[#8B5CF6]/50 shadow-xs hover:shadow-md'
                }`}
              >
                <div className="space-y-3">
                  {/* Top Bar: Provider and Pricing */}
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#F8FAFC] text-[#526078] dark:bg-[#172033] dark:text-[#CBD5E1] border border-[#E2E8F0] dark:border-[#334155] flex items-center gap-1 line-clamp-1">
                      <ShieldCheck className="w-3 h-3 text-[#6D28D9] dark:text-[#DDD6FE] shrink-0" />
                      <span className="truncate">{course.provider}</span>
                    </span>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 border ${
                        course.pricing === '100% Free'
                          ? 'bg-[#DCFCE7] text-[#15803D] border-[#86EFAC] dark:bg-[#15803D]/25 dark:text-[#86EFAC] dark:border-[#15803D]/40'
                          : 'bg-[#DBEAFE] text-[#1D4ED8] border-[#BFDBFE] dark:bg-[#1D4ED8]/25 dark:text-[#93C5FD] dark:border-[#1D4ED8]/40'
                      }`}
                    >
                      {course.pricing}
                    </span>
                  </div>

                  {/* Course Title */}
                  <h3 className="text-sm font-bold tracking-tight text-[#172033] dark:text-white line-clamp-2 leading-snug group-hover:text-[#6D28D9] dark:group-hover:text-[#DDD6FE] transition-colors">
                    {course.name}
                  </h3>

                  {/* Course Description */}
                  <p className="text-xs text-[#526078] dark:text-slate-300 line-clamp-3 leading-relaxed">
                    {course.outcome}
                  </p>

                  {/* Metadata Chips: Subject, Difficulty, Duration */}
                  <div className="flex items-center gap-2 flex-wrap text-[11px] pt-1 text-[#526078] dark:text-slate-400">
                    <span className="bg-slate-100 dark:bg-[#172033] px-2 py-0.5 rounded font-medium text-[#172033] dark:text-slate-300 border border-[#E2E8F0] dark:border-[#334155]">
                      {course.category}
                    </span>
                    <span>•</span>
                    <span
                      className={`font-semibold ${
                        course.difficulty === 'Beginner'
                          ? 'text-[#15803D] dark:text-[#86EFAC]'
                          : course.difficulty === 'Intermediate'
                          ? 'text-[#B45309] dark:text-[#FCD34D]'
                          : 'text-[#6D28D9] dark:text-[#DDD6FE]'
                      }`}
                    >
                      {course.difficulty}
                    </span>
                    {course.duration && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#64748B]" />
                          <span>{course.duration}</span>
                        </span>
                      </>
                    )}
                  </div>

                  {/* Skills Pills */}
                  {course.skills && course.skills.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      {course.skills.slice(0, 3).map((skill) => (
                        <span
                          key={skill}
                          className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-[#F8FAFC] dark:bg-[#172033] text-[#526078] dark:text-slate-300 border border-[#E2E8F0] dark:border-[#334155]"
                        >
                          {skill}
                        </span>
                      ))}
                      {course.skills.length > 3 && (
                        <span className="text-[10px] text-[#64748B] font-medium">
                          +{course.skills.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Bottom Actions */}
                <div className="mt-4 pt-3.5 border-t border-[#E8ECF3] dark:border-[#334155] flex items-center justify-between gap-2">
                  {/* Status Toggle Button */}
                  <button
                    onClick={() => cycleCourseStatus(course.id)}
                    className={`text-xs px-2.5 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 transition cursor-pointer border ${
                      status === 'completed'
                        ? 'bg-[#DCFCE7] text-[#15803D] border-[#86EFAC] dark:bg-[#15803D]/25 dark:text-[#86EFAC] dark:border-[#15803D]/40'
                        : status === 'in_progress'
                        ? 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A] dark:bg-[#B45309]/25 dark:text-[#FCD34D] dark:border-[#B45309]/40'
                        : status === 'saved'
                        ? 'bg-[#EDE9FE] text-[#6D28D9] border-[#DDD6FE] dark:bg-[#6D28D9]/25 dark:text-[#DDD6FE] dark:border-[#8B5CF6]/40'
                        : isLight
                        ? 'bg-white text-[#526078] border-[#E2E8F0] hover:bg-[#F8FAFC]'
                        : 'bg-[#172033] text-slate-300 border-[#334155] hover:bg-[#243248]'
                    }`}
                    title="Click to cycle status: Unsaved -> Saved -> In Progress -> Completed"
                  >
                    {status === 'completed' ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#15803D] dark:text-[#86EFAC]" />
                        <span>Completed</span>
                      </>
                    ) : status === 'in_progress' ? (
                      <>
                        <Clock className="w-3.5 h-3.5 text-[#B45309] dark:text-[#FCD34D]" />
                        <span>In Progress</span>
                      </>
                    ) : status === 'saved' ? (
                      <>
                        <BookmarkCheck className="w-3.5 h-3.5 text-[#6D28D9] dark:text-[#DDD6FE]" />
                        <span>Saved</span>
                      </>
                    ) : (
                      <>
                        <Bookmark className="w-3.5 h-3.5 text-[#64748B]" />
                        <span>Bookmark</span>
                      </>
                    )}
                  </button>

                  {/* Visit Official Course Link Button */}
                  <a
                    href={course.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white shadow-xs transition-colors cursor-pointer"
                  >
                    <span>Visit Official Course</span>
                    <ExternalLink className="w-3.5 h-3.5 text-white" />
                  </a>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Preferences Modal */}
      {isPreferencesOpen && (
        <CoursePreferencesModal
          isOpen={isPreferencesOpen}
          onClose={() => setIsPreferencesOpen(false)}
          onSaved={(newPrefs) => {
            setUserPrefs(newPrefs);
          }}
        />
      )}
    </div>
  );
};

import React, { useState, useMemo } from 'react';
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
  Clock
} from 'lucide-react';
import { VERIFIED_COURSES } from '../data/courseCatalogue';
import { EDUCATION_LEVELS } from '../data/educationLevels';
import { EducationLevelId, VerifiedCourse } from '../types';

export const CourseRecommendationsView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPricing, setSelectedPricing] = useState<string>('all');

  // Bookmarked / in-progress course state
  const [savedCourses, setSavedCourses] = useState<Record<string, 'saved' | 'in_progress' | 'completed'>>({
    'khan-math-foundations': 'saved',
    'cs50x-intro-cs': 'in_progress'
  });

  const categories = useMemo(() => {
    const set = new Set<string>();
    VERIFIED_COURSES.forEach((c) => set.add(c.category));
    return Array.from(set).sort();
  }, []);

  const filteredCourses = useMemo(() => {
    return VERIFIED_COURSES.filter((course) => {
      const matchesSearch =
        searchQuery === '' ||
        course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.outcome.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesLevel =
        selectedLevel === 'all' ||
        course.educationLevels.includes(selectedLevel as EducationLevelId);

      const matchesCategory =
        selectedCategory === 'all' || course.category === selectedCategory;

      const matchesPricing =
        selectedPricing === 'all' || course.pricing === selectedPricing;

      return matchesSearch && matchesLevel && matchesCategory && matchesPricing;
    });
  }, [searchQuery, selectedLevel, selectedCategory, selectedPricing]);

  const toggleSave = (id: string) => {
    setSavedCourses((prev) => {
      const current = prev[id];
      if (!current) {
        return { ...prev, [id]: 'saved' };
      } else if (current === 'saved') {
        return { ...prev, [id]: 'in_progress' };
      } else if (current === 'in_progress') {
        return { ...prev, [id]: 'completed' };
      } else {
        const next = { ...prev };
        delete next[id];
        return next;
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900">
              Verified Learning Resources
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500">Targeted Courseware</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-1 tracking-tight">
            Curated Course Recommendations
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            High-quality, free and open-access courses from world-class institutions (NPTEL, Khan Academy, MIT OCW, CS50) matched to your educational stage.
          </p>
        </div>

        {/* Total Courses Metric */}
        <div className="shrink-0 flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
          <GraduationCap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <div className="text-xs">
            <span className="font-bold text-slate-800 dark:text-slate-200 block">
              {VERIFIED_COURSES.length} Curated Courses
            </span>
            <span className="text-slate-500 dark:text-slate-400">100% Open & Official</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search courses by subject, skill, or platform..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg pl-9.5 pr-4 py-2 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Education Level Filter */}
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="all">All Education Levels</option>
            {EDUCATION_LEVELS.map((level) => (
              <option key={level.id} value={level.id}>
                {level.label}
              </option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="all">All Disciplines</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Pricing Filter */}
          <select
            value={selectedPricing}
            onChange={(e) => setSelectedPricing(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="all">All Access Types</option>
            <option value="100% Free">100% Free</option>
            <option value="Free to Audit">Free to Audit</option>
            <option value="Free Official Courseware">Free Official Courseware</option>
          </select>
        </div>

        {/* Active Filters count */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
          <span>
            Showing <strong className="text-slate-800 dark:text-slate-200">{filteredCourses.length}</strong> matching courses
          </span>
          {(searchQuery || selectedLevel !== 'all' || selectedCategory !== 'all' || selectedPricing !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedLevel('all');
                setSelectedCategory('all');
                setSelectedPricing('all');
              }}
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 font-semibold cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCourses.length === 0 ? (
          <div className="col-span-full bg-white dark:bg-slate-900 rounded-xl p-12 text-center border border-slate-200 dark:border-slate-800">
            <BookOpen className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">No matching courses found</h4>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              Try adjusting your search terms or clearing specific category filters.
            </p>
          </div>
        ) : (
          filteredCourses.map((course) => {
            const status = savedCourses[course.id];
            return (
              <div
                key={course.id}
                className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:border-indigo-200 dark:hover:border-indigo-800 hover:shadow-sm transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded">
                      {course.provider}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        course.pricing === '100% Free'
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
                      }`}
                    >
                      {course.pricing}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-2 leading-snug">
                    {course.name}
                  </h4>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                    {course.outcome}
                  </p>

                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded font-medium">
                      {course.category}
                    </span>
                    <span className="text-slate-400">·</span>
                    <span>{course.difficulty}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => toggleSave(course.id)}
                    className={`text-xs px-2.5 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                      status === 'completed'
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                        : status === 'in_progress'
                        ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                        : status === 'saved'
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {status === 'completed' ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>Completed</span>
                      </>
                    ) : status === 'in_progress' ? (
                      <>
                        <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        <span>In Progress</span>
                      </>
                    ) : status === 'saved' ? (
                      <>
                        <BookmarkCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        <span>Saved</span>
                      </>
                    ) : (
                      <>
                        <Bookmark className="w-3.5 h-3.5 text-slate-400" />
                        <span>Bookmark</span>
                      </>
                    )}
                  </button>

                  <a
                    href={course.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition py-1.5 px-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
                  >
                    <span>Open Course</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import { Course } from '../types';
import { Search, X, BookOpen, ChevronRight, GraduationCap } from 'lucide-react';

interface CoursesBrowserProps {
  isOpen: boolean;
  onClose: () => void;
  courses: Course[];
  onSelectCourse: (courseCode: string) => void;
}

export const CoursesBrowser: React.FC<CoursesBrowserProps> = ({
  isOpen,
  onClose,
  courses,
  onSelectCourse
}) => {
  const [courseSearch, setCourseSearch] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState<string>('ALL');

  // Distinct faculties
  const faculties = useMemo(() => {
    const set = new Set<string>();
    courses.forEach(c => set.add(c.faculty));
    return ['ALL', ...Array.from(set)];
  }, [courses]);

  // Filtered courses
  const filteredCourses = useMemo(() => {
    return courses.filter(c => {
      const matchesFaculty = selectedFaculty === 'ALL' || c.faculty === selectedFaculty;
      const matchesQuery =
        !courseSearch ||
        c.code.toLowerCase().includes(courseSearch.toLowerCase()) ||
        c.title.toLowerCase().includes(courseSearch.toLowerCase());
      return matchesFaculty && matchesQuery;
    });
  }, [courses, selectedFaculty, courseSearch]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="course-browser-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3 sm:p-6 transition-all duration-150"
    >
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[85vh] overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2 id="course-browser-title" className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">
                Curated Course Directory
              </h2>
              <p className="text-xs text-slate-500">
                Browse through all 400+ Virtual University course resource catalogues
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-2 rounded-lg transition-colors cursor-pointer"
            aria-label="Close course directory"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Faculty Tabs */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={courseSearch}
              onChange={(e) => setCourseSearch(e.target.value)}
              placeholder="Search course code or title (e.g. CS302, Digital Logic, Calculus)..."
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {/* Faculty Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            {faculties.map((fac) => (
              <button
                key={fac}
                type="button"
                onClick={() => setSelectedFaculty(fac)}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  selectedFaculty === fac
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {fac}
              </button>
            ))}
          </div>
        </div>

        {/* Course Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredCourses.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-400 text-sm">
              No courses matching your filter.
            </div>
          ) : (
            filteredCourses.map((c) => (
              <button
                key={c.code}
                type="button"
                onClick={() => {
                  onSelectCourse(c.code);
                  onClose();
                }}
                className="text-left bg-white hover:bg-blue-50/50 border border-slate-200 hover:border-blue-400 rounded-xl p-3.5 transition-all group flex flex-col justify-between gap-2 cursor-pointer shadow-2xs"
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-mono font-bold text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                      {c.code}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {c.faculty}
                    </span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-semibold text-slate-900 group-hover:text-blue-600 line-clamp-2 transition-colors">
                    {c.title}
                  </h4>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                  <span>Explore 12+ files</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                </div>
              </button>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-center text-xs text-slate-500">
          Click any course to load its dedicated resource archive.
        </div>
      </div>
    </div>
  );
};

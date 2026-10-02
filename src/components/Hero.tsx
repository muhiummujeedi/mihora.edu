import React, { useRef, useEffect } from 'react';
import { Search, X, Sparkles, BookOpen, CheckCircle2 } from 'lucide-react';

interface HeroProps {
  query: string;
  onQueryChange: (val: string) => void;
  onCategoryClick: (category: string) => void;
  onCourseClick: (course: string) => void;
  totalResources: number;
  totalCourses: number;
}

export const Hero: React.FC<HeroProps> = ({
  query,
  onQueryChange,
  onCategoryClick,
  onCourseClick,
  totalResources,
  totalCourses
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus search on '/' key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const quickCategories = [
    { label: 'MIDTERMS', query: 'midterm' },
    { label: 'FINALS', query: 'finalterm' },
    { label: 'QUIZZES', query: 'quiz' },
    { label: 'MCQS', query: 'mcq' },
    { label: 'ASSIGNMENTS', query: 'assignment' },
    { label: 'HANDOUTS', query: 'handout' },
    { label: 'SOLVED', query: 'solved' },
    { label: 'PAST PAPERS', query: 'past-paper' },
    { label: 'SLIDES', query: 'slides' }
  ];

  const featuredCourses = ['CS302', 'CS101', 'CS201', 'MTH101', 'ACC311', 'MGT301', 'STA301', 'ENG201'];

  return (
    <section className="relative overflow-hidden bg-slate-950 text-white pt-16 pb-20 sm:pt-20 sm:pb-24 border-b border-slate-800">
      {/* Dynamic tech constellation / grid backdrop */}
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px]" />
      
      {/* Ambient gradient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        {/* Trust announcement */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-950/60 border border-blue-500/30 text-blue-300 text-xs font-medium">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span>Independent Student Study Portal</span>
          <span className="text-slate-500">·</span>
          <span className="text-slate-300 tabular-nums">400+ Curated Courses</span>
        </div>

        {/* Hero Title & Subtext */}
        <div className="space-y-4 max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Find Your Course <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Resources Faster</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto font-normal">
            Search thousands of student resources from one place. Instant access to handouts, solved midterms, finals, MCQs, and past papers.
          </p>
        </div>

        {/* High-Intent Search Bar */}
        <div className="max-w-2xl mx-auto">
          <div className="relative flex items-center bg-white rounded-xl shadow-2xl p-2 sm:p-2.5 focus-within:ring-4 focus-within:ring-blue-500/25 transition-all">
            <Search className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400 ml-2.5 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="Search courses, midterms, finals, MCQs, assignments, handouts..."
              className="w-full pl-3 pr-10 py-2 sm:py-2.5 text-sm sm:text-base text-slate-900 placeholder-slate-400 focus:outline-none bg-transparent"
              aria-label="Search study resources"
            />
            {query ? (
              <button
                type="button"
                onClick={() => onQueryChange('')}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md transition-colors cursor-pointer mr-1"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
              <kbd className="hidden sm:inline-block px-2 py-0.5 text-[11px] font-mono font-medium text-slate-400 bg-slate-100 rounded border border-slate-200 mr-2 select-none">
                /
              </kbd>
            )}
          </div>

          {/* Search Examples */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-3 text-xs text-slate-400">
            <span className="text-slate-500">Try searching:</span>
            {['CS302 midterm', 'CS101 MCQs', 'ACC311 solved final', 'MGT301 handouts'].map((eg) => (
              <button
                key={eg}
                type="button"
                onClick={() => onQueryChange(eg)}
                className="text-slate-300 hover:text-blue-400 hover:underline transition-colors cursor-pointer"
              >
                {eg}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Categories Buttons */}
        <div className="pt-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
            Quick Categories
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 max-w-4xl mx-auto">
            {quickCategories.map((cat) => (
              <button
                key={cat.label}
                type="button"
                onClick={() => onCategoryClick(cat.query)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 hover:border-slate-700 transition-all cursor-pointer whitespace-nowrap"
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Featured Course Shortcuts */}
        <div className="pt-1 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400">
          <span className="text-slate-400 font-medium">Popular Courses:</span>
          {featuredCourses.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onCourseClick(c)}
              className="px-2.5 py-1 rounded bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-blue-400 hover:border-blue-500/40 transition-colors font-mono font-medium cursor-pointer"
            >
              {c}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

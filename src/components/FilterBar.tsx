import React from 'react';
import { FilterState, Course } from '../types';
import { Filter, RotateCcw, Check, ChevronDown } from 'lucide-react';

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  courses: Course[];
  limit: number;
  onLimitChange: (limit: number) => void;
  totalFiltered: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  courses,
  limit,
  onLimitChange,
  totalFiltered
}) => {
  const resourceTypes = [
    { label: 'All Types', value: '' },
    { label: 'Midterms', value: 'MIDTERM' },
    { label: 'Finals', value: 'FINALTERM' },
    { label: 'Handouts', value: 'HANDOUT' },
    { label: 'Quizzes', value: 'QUIZ' },
    { label: 'Assignments', value: 'ASSIGNMENT' }
  ];

  const formats = [
    { label: 'All Formats', value: '' },
    { label: 'PDF Docs', value: 'PDF' },
    { label: 'Word (DOC)', value: 'DOC' },
    { label: 'Slides (PPT)', value: 'PPT' },
    { label: 'Archives (ZIP)', value: 'ARCHIVE' }
  ];

  const activeFilterCount =
    (filters.course ? 1 : 0) +
    (filters.type ? 1 : 0) +
    (filters.format ? 1 : 0) +
    (filters.solvedOnly ? 1 : 0) +
    (filters.pastPapersOnly ? 1 : 0) +
    (filters.currentOnly ? 1 : 0) +
    filters.tags.length;

  const handleReset = () => {
    onFilterChange({
      course: '',
      type: '',
      format: '',
      tags: [],
      solvedOnly: false,
      pastPapersOnly: false,
      currentOnly: false
    });
  };

  return (
    <div className="bg-white border-b border-slate-200 py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Filters Selectors */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mr-1">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span>Filters:</span>
          </div>

          {/* Course Selector */}
          <div className="relative">
            <select
              value={filters.course}
              onChange={(e) => onFilterChange({ ...filters, course: e.target.value })}
              className="appearance-none bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-800 text-xs font-medium rounded-lg pl-3 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
              aria-label="Filter by course"
            >
              <option value="">All Courses ({courses.length})</option>
              {courses.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} — {c.title}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Type Selector */}
          <div className="relative">
            <select
              value={filters.type}
              onChange={(e) => onFilterChange({ ...filters, type: e.target.value })}
              className="appearance-none bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-800 text-xs font-medium rounded-lg pl-3 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
              aria-label="Filter by type"
            >
              {resourceTypes.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Format Selector */}
          <div className="relative">
            <select
              value={filters.format}
              onChange={(e) => onFilterChange({ ...filters, format: e.target.value })}
              className="appearance-none bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-800 text-xs font-medium rounded-lg pl-3 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
              aria-label="Filter by format"
            >
              {formats.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Fast Toggle Buttons for Solved & Past Papers */}
          <button
            type="button"
            onClick={() => onFilterChange({ ...filters, solvedOnly: !filters.solvedOnly })}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer border ${
              filters.solvedOnly
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Solved Only
          </button>

          <button
            type="button"
            onClick={() => onFilterChange({ ...filters, pastPapersOnly: !filters.pastPapersOnly })}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer border ${
              filters.pastPapersOnly
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Past Papers
          </button>

          {/* Reset Filters if active */}
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:text-red-600 transition-colors cursor-pointer"
              title="Reset all filters"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset ({activeFilterCount})</span>
            </button>
          )}
        </div>

        {/* Results per page / limit (Part 50) */}
        <div className="flex items-center justify-between sm:justify-end gap-3 text-xs text-slate-500">
          <span>
            Showing <strong className="text-slate-800 tabular-nums">{totalFiltered}</strong> results
          </span>
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg">
            <span className="px-2 text-slate-400 font-medium">Limit:</span>
            {[12, 24, 50].map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => onLimitChange(l)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                  limit === l
                    ? 'bg-white text-blue-700 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

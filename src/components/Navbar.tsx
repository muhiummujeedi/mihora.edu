import React from 'react';
import { MihoraLogo } from './MihoraLogo';
import { BookOpen, Layers, Info, ShieldCheck, Download } from 'lucide-react';

interface NavbarProps {
  onOpenCourses: () => void;
  onOpenAbout: () => void;
  selectedCount: number;
  onScrollToSearch: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenCourses,
  onOpenAbout,
  selectedCount,
  onScrollToSearch
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Brand Wordmark (Single element) */}
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="focus-visible:ring-2 focus-visible:ring-blue-600 rounded-lg"
          aria-label="Mihora Study Library Home"
        >
          <MihoraLogo variant="dark" size="md" />
        </a>

        {/* Zone 2: Clean Typography Nav Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
          <button
            type="button"
            onClick={onScrollToSearch}
            className="hover:text-blue-600 transition-colors cursor-pointer"
          >
            Search Catalog
          </button>
          <button
            type="button"
            onClick={onOpenCourses}
            className="hover:text-blue-600 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <BookOpen className="w-4 h-4 text-slate-400" />
            <span>Course Index</span>
          </button>
          <button
            type="button"
            onClick={onOpenAbout}
            className="hover:text-blue-600 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <ShieldCheck className="w-4 h-4 text-slate-400" />
            <span>Security & Relay</span>
          </button>
          <button
            type="button"
            onClick={onOpenAbout}
            className="hover:text-blue-600 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Info className="w-4 h-4 text-slate-400" />
            <span>About</span>
          </button>
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onOpenCourses}
            className="md:hidden inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Courses</span>
          </button>

          {selectedCount > 0 ? (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold tabular-nums">
              <Download className="w-3.5 h-3.5" />
              <span>{selectedCount} Selected</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={onScrollToSearch}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap shadow-sm shadow-blue-500/20"
            >
              <span>Explore Materials</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

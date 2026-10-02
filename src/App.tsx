import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Resource, Course, FilterState, DownloadSession } from './types';
import { searchResources } from './search/searchEngine';
import { antiDevTools } from './security/antiDevTools';
import { SecurityOverlay } from './security/SecurityOverlay';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { FilterBar } from './components/FilterBar';
import { ResourceCard } from './components/ResourceCard';
import { MultiDownloadBar } from './components/MultiDownloadBar';
import { DownloadModal } from './components/DownloadModal';
import { CoursesBrowser } from './components/CoursesBrowser';
import { AboutModal } from './components/AboutModal';
import { MihoraLogo } from './components/MihoraLogo';
import { Shield, Sparkles, BookOpen, Layers, CheckCircle2, AlertCircle } from 'lucide-react';

// Static sanitized data compiled at build time
import coursesData from './data/courses.json';
import resourcesData from './data/resources.json';

const courses: Course[] = coursesData as Course[];
const resources: Resource[] = resourcesData as Resource[];

export default function App() {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    course: '',
    type: '',
    format: '',
    tags: [],
    solvedOnly: false,
    pastPapersOnly: false,
    currentOnly: false
  });
  const [limit, setLimit] = useState<number>(12);
  const [selectedRLHs, setSelectedRLHs] = useState<Set<string>>(new Set());

  // Modals & Overlay States
  const [isCoursesOpen, setIsCoursesOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [devToolsDetected, setDevToolsDetected] = useState(false);
  const [downloadSession, setDownloadSession] = useState<DownloadSession | null>(null);
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);

  const searchResultsRef = useRef<HTMLDivElement>(null);

  // Initialize anti-DevTools deterrence & subscribe to detection signals
  useEffect(() => {
    antiDevTools.init();
    const unsubscribe = antiDevTools.subscribe((detected) => {
      setDevToolsDetected(detected);
      if (detected && downloadSession) {
        // Invalidate active session if dev tools opened
        setDownloadSession(null);
      }
    });
    return () => {
      unsubscribe();
      antiDevTools.destroy();
    };
  }, [downloadSession]);

  // Compute search results with ranking algorithm
  const filteredResources = useMemo(() => {
    return searchResources(resources, query, filters, limit);
  }, [query, filters, limit]);

  // Handle single resource download through Two-Stage Relay
  const handleDownload = async (resource: Resource) => {
    setDownloadSession({
      rlh: resource.rlh,
      name: resource.name,
      format: resource.format,
      course: resource.course,
      status: 'resolving'
    });

    try {
      // Stage 1: Resolve RLH to short-lived signed download token
      const res = await fetch('/api/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rlh: resource.rlh })
      });

      if (!res.ok) {
        throw new Error('Resource not available.');
      }

      const data = await res.json();
      if (!data.ok || !data.downloadUrl) {
        throw new Error('Failed to resolve resource token.');
      }

      setDownloadSession((prev) =>
        prev
          ? {
              ...prev,
              status: 'ready',
              token: data.token,
              downloadUrl: data.downloadUrl,
              expiresIn: data.expiresIn
            }
          : null
      );

      // Automatically trigger stage 2 download
      triggerFileStream(data.downloadUrl);
    } catch (err: any) {
      setDownloadSession((prev) =>
        prev
          ? {
              ...prev,
              status: 'error',
              errorMessage: err.message || 'This resource is temporarily unavailable.'
            }
          : null
      );
    }
  };

  // Trigger file stream through hidden anchor or window navigation to preserve domain
  const triggerFileStream = (downloadUrl: string) => {
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      setDownloadSession((prev) => (prev ? { ...prev, status: 'complete' } : null));
    }, 1000);
  };

  // Handle multi-download ZIP archive
  const handleDownloadZip = async () => {
    if (selectedRLHs.size === 0) return;
    setIsDownloadingZip(true);

    try {
      const rlhArray = Array.from(selectedRLHs);
      const courseLabel = filters.course || 'Mihora_Study';
      const zipName = `${courseLabel}_Selected_Resources`;

      const res = await fetch('/api/resolve-multi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rlhs: rlhArray, zipName })
      });

      if (!res.ok) throw new Error('Multi-download session failed');
      const data = await res.json();

      if (data.ok && data.downloadUrl) {
        triggerFileStream(data.downloadUrl);
      }
    } catch {
      alert('Unable to generate ZIP archive at this moment. Please try downloading individual files.');
    } finally {
      setIsDownloadingZip(false);
    }
  };

  // Toggle selection
  const handleToggleSelect = (rlh: string) => {
    setSelectedRLHs((prev) => {
      const next = new Set(prev);
      if (next.has(rlh)) {
        next.delete(rlh);
      } else {
        next.add(rlh);
      }
      return next;
    });
  };

  // Select all currently visible in results
  const handleSelectAllVisible = () => {
    const visibleRLHs = filteredResources.map((r) => r.rlh);
    const allSelected = visibleRLHs.every((id) => selectedRLHs.has(id));

    setSelectedRLHs((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        visibleRLHs.forEach((id) => next.delete(id));
      } else {
        visibleRLHs.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const handleClearSelection = () => {
    setSelectedRLHs(new Set());
  };

  const scrollToSearch = () => {
    searchResultsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      {/* DevTools Deterrence Security Overlay */}
      {devToolsDetected && (
        <SecurityOverlay onDismiss={() => antiDevTools.resume()} />
      )}

      {/* Top Bar Contract Navigation */}
      <Navbar
        onOpenCourses={() => setIsCoursesOpen(true)}
        onOpenAbout={() => setIsAboutOpen(true)}
        selectedCount={selectedRLHs.size}
        onScrollToSearch={scrollToSearch}
      />

      {/* Hero Section */}
      <Hero
        query={query}
        onQueryChange={(val) => {
          setQuery(val);
          scrollToSearch();
        }}
        onCategoryClick={(cat) => {
          setQuery(cat);
          scrollToSearch();
        }}
        onCourseClick={(code) => {
          setFilters((prev) => ({ ...prev, course: code }));
          setQuery('');
          scrollToSearch();
        }}
        totalResources={resources.length}
        totalCourses={courses.length}
      />

      {/* Filter Toolbar */}
      <div ref={searchResultsRef}>
        <FilterBar
          filters={filters}
          onFilterChange={setFilters}
          courses={courses}
          limit={limit}
          onLimitChange={setLimit}
          totalFiltered={filteredResources.length}
        />
      </div>

      {/* Main Resource Catalog Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Results Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-200">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {filters.course ? `${filters.course} Study Materials` : 'Verified Educational Catalog'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Showing <span className="font-semibold text-slate-800 tabular-nums">{filteredResources.length}</span> most relevant resources for your study query.
            </p>
          </div>

          {filteredResources.length > 0 && (
            <button
              type="button"
              onClick={handleSelectAllVisible}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer self-start sm:self-auto"
            >
              {filteredResources.every((r) => selectedRLHs.has(r.rlh))
                ? 'Deselect Visible'
                : 'Select All Visible'}
            </button>
          )}
        </div>

        {/* Resources Grid */}
        {filteredResources.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto space-y-4 my-8 shadow-xs">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <BookOpen className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-base text-slate-900">No resources found</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                We couldn't find any resources matching your current search or filters. Try searching by course code (e.g. <strong>CS302</strong>, <strong>MTH101</strong>) or clearing filters.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setFilters({
                  course: '',
                  type: '',
                  format: '',
                  tags: [],
                  solvedOnly: false,
                  pastPapersOnly: false,
                  currentOnly: false
                });
              }}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors cursor-pointer"
            >
              Clear Search & Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredResources.map((res) => (
              <ResourceCard
                key={res.rlh}
                resource={res}
                isSelected={selectedRLHs.has(res.rlh)}
                onToggleSelect={handleToggleSelect}
                onDownload={handleDownload}
                isDownloading={downloadSession?.rlh === res.rlh && downloadSession.status === 'resolving'}
              />
            ))}
          </div>
        )}

        {/* Informational Callout */}
        <div className="mt-12 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xs">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700">
              <Shield className="w-4 h-4" />
              <span>Independent Student Resource Network</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Looking for a specific course archive?
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Explore our comprehensive 400+ course directory categorized by Computer Science, Mathematics, Management, Economics, and Mass Media.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsCoursesOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm transition-colors cursor-pointer shrink-0 shadow-xs"
          >
            Open Course Directory
          </button>
        </div>
      </main>

      {/* Floating Multi-Download Action Bar */}
      <MultiDownloadBar
        selectedCount={selectedRLHs.size}
        totalVisible={filteredResources.length}
        onClear={handleClearSelection}
        onSelectAllVisible={handleSelectAllVisible}
        onDownloadZip={handleDownloadZip}
        isDownloadingZip={isDownloadingZip}
      />

      {/* Two-Stage Download Status Dialog */}
      <DownloadModal
        session={downloadSession}
        onClose={() => setDownloadSession(null)}
        onTriggerDownload={() => {
          if (downloadSession?.downloadUrl) {
            triggerFileStream(downloadSession.downloadUrl);
          }
        }}
      />

      {/* Course Directory Modal */}
      <CoursesBrowser
        isOpen={isCoursesOpen}
        onClose={() => setIsCoursesOpen(false)}
        courses={courses}
        onSelectCourse={(courseCode) => {
          setFilters((prev) => ({ ...prev, course: courseCode }));
          setQuery('');
          scrollToSearch();
        }}
      />

      {/* About & Disclaimer Modal */}
      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />

      {/* Mihora Footer */}
      <footer className="bg-slate-950 text-white border-t border-slate-900 mt-20 pt-12 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-slate-800">
            <div className="space-y-2">
              <MihoraLogo variant="white" size="md" />
              <p className="text-xs text-slate-400 max-w-md leading-relaxed">
                MIHORA STUDY LIBRARY is a fast, independent educational resource repository designed for university students.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-xs text-slate-400">
              <button
                type="button"
                onClick={() => setIsCoursesOpen(true)}
                className="hover:text-blue-400 transition-colors cursor-pointer"
              >
                All Courses
              </button>
              <button
                type="button"
                onClick={() => setIsAboutOpen(true)}
                className="hover:text-blue-400 transition-colors cursor-pointer"
              >
                Security & Relay
              </button>
              <button
                type="button"
                onClick={() => setIsAboutOpen(true)}
                className="hover:text-blue-400 transition-colors cursor-pointer"
              >
                Disclaimer & Terms
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div>
              &copy; {new Date().getFullYear()} Mihora Tech. Independent student resource portal.
            </div>
            <div className="text-[11px] text-slate-400 text-center sm:text-right">
              Primary: <span className="font-mono text-slate-300">study.mihora.tech</span> · Relay: <span className="font-mono text-slate-300">dl.study.mihora.tech</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

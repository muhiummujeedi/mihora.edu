import React from 'react';
import { Download, X, Archive, CheckSquare, Square } from 'lucide-react';

interface MultiDownloadBarProps {
  selectedCount: number;
  totalVisible: number;
  onClear: () => void;
  onSelectAllVisible: () => void;
  onDownloadZip: () => void;
  isDownloadingZip?: boolean;
}

export const MultiDownloadBar: React.FC<MultiDownloadBarProps> = ({
  selectedCount,
  totalVisible,
  onClear,
  onSelectAllVisible,
  onDownloadZip,
  isDownloadingZip = false
}) => {
  if (selectedCount === 0) return null;

  const isAllSelected = selectedCount >= totalVisible && totalVisible > 0;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-3.5 sm:p-4 text-white flex flex-col sm:flex-row items-center justify-between gap-3 backdrop-blur-md">
        {/* Selection Count Info */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center tabular-nums">
              {selectedCount}
            </span>
            <span className="text-sm font-semibold">
              {selectedCount === 1 ? '1 Resource Selected' : `${selectedCount} Resources Selected`}
            </span>
          </div>

          <button
            type="button"
            onClick={onSelectAllVisible}
            className="sm:hidden text-xs text-blue-400 hover:text-blue-300 font-medium cursor-pointer"
          >
            {isAllSelected ? 'Deselect All' : 'Select All'}
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={onSelectAllVisible}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
          >
            {isAllSelected ? (
              <>
                <Square className="w-3.5 h-3.5" />
                <span>Deselect All</span>
              </>
            ) : (
              <>
                <CheckSquare className="w-3.5 h-3.5" />
                <span>Select All Visible</span>
              </>
            )}
          </button>

          <button
            type="button"
            disabled={isDownloadingZip}
            onClick={onDownloadZip}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer shadow-md shadow-blue-500/30 disabled:opacity-50"
          >
            <Archive className="w-4 h-4" />
            <span>
              {isDownloadingZip ? 'Building ZIP Archive...' : `Download Selected (${selectedCount})`}
            </span>
          </button>

          <button
            type="button"
            onClick={onClear}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Clear selection"
            title="Clear selection"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

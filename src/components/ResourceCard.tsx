import React from 'react';
import { Resource } from '../types';
import { FileText, Download, Check, FileArchive, Presentation, FileCode } from 'lucide-react';

interface ResourceCardProps {
  resource: Resource;
  isSelected: boolean;
  onToggleSelect: (rlh: string) => void;
  onDownload: (resource: Resource) => void;
  isDownloading?: boolean;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({
  resource,
  isSelected,
  onToggleSelect,
  onDownload,
  isDownloading = false
}) => {
  // Format icon helper
  const getFormatIcon = (format: string) => {
    switch (format.toUpperCase()) {
      case 'PDF':
        return <FileText className="w-5 h-5 text-red-500 shrink-0" />;
      case 'DOC':
      case 'DOCX':
        return <FileText className="w-5 h-5 text-blue-500 shrink-0" />;
      case 'PPT':
      case 'PPTX':
        return <Presentation className="w-5 h-5 text-amber-500 shrink-0" />;
      case 'ARCHIVE':
      case 'ZIP':
        return <FileArchive className="w-5 h-5 text-emerald-500 shrink-0" />;
      default:
        return <FileCode className="w-5 h-5 text-slate-500 shrink-0" />;
    }
  };

  return (
    <div
      className={`group relative bg-white border rounded-xl p-4 sm:p-5 transition-all duration-150 flex flex-col justify-between gap-4 ${
        isSelected
          ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-md'
          : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
      }`}
    >
      <div className="space-y-3">
        {/* Top bar: Selection Checkbox & Category */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            {getFormatIcon(resource.format)}
            <span className="font-mono font-bold text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
              {resource.course}
            </span>
          </div>

          {/* Select Checkbox */}
          <label className="flex items-center gap-1.5 cursor-pointer text-xs text-slate-500 hover:text-slate-800 select-none">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onToggleSelect(resource.rlh)}
              className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
              aria-label={`Select ${resource.name}`}
            />
            <span className="hidden sm:inline">Select</span>
          </label>
        </div>

        {/* Resource Name */}
        <h3 className="font-semibold text-slate-900 text-sm sm:text-base leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
          {resource.name}
        </h3>

        {/* Clean Unboxed Metadata with Typographic Separator (Zero-Pill Rule) */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 font-medium">
          <span className="text-slate-700 font-semibold">{resource.type}</span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span>{resource.format}</span>
          {resource.tags && resource.tags.length > 0 && (
            <>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span>{resource.tags.slice(0, 3).join(' · ')}</span>
            </>
          )}
        </div>
      </div>

      {/* Card Footer: Action button */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
        <span className="text-[11px] text-slate-400 font-mono">Verified Resource</span>
        <button
          type="button"
          disabled={isDownloading}
          onClick={() => onDownload(resource)}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer shadow-xs disabled:opacity-50"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{isDownloading ? 'Resolving...' : 'Download'}</span>
        </button>
      </div>
    </div>
  );
};

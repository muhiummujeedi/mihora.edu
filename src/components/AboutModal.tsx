import React from 'react';
import { X, ShieldCheck, Lock, ExternalLink, Database, Globe } from 'lucide-react';
import { MihoraLogo } from './MihoraLogo';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="about-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 transition-all duration-150"
    >
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 sm:p-8 space-y-6 text-slate-900 relative max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-2 rounded-lg transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand header */}
        <div className="space-y-3">
          <MihoraLogo variant="dark" size="md" />
          <h2 id="about-modal-title" className="text-xl font-bold text-slate-950">
            About Mihora Study Library
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            MIHORA STUDY LIBRARY is a high-speed, privacy-first educational resource hub engineered by Mihora Tech to make finding study materials fast, accessible, and safe for university students.
          </p>
        </div>

        {/* Important Disclaimer */}
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1.5 text-xs">
          <div className="font-bold flex items-center gap-1.5">
            <span>IMPORTANT NOTICE & DISCLAIMER</span>
          </div>
          <p className="leading-relaxed">
            This is an <strong>independent student resource portal</strong>. Mihora Tech does not falsely claim official affiliation with Virtual University. All intellectual course contents remain the property of their respective educators and student contributors.
          </p>
        </div>

        {/* Security Architecture Highlights */}
        <div className="space-y-3 text-xs">
          <h3 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
            Security & Privacy Architecture
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <div className="flex items-center gap-1.5 text-blue-700 font-semibold">
                <Lock className="w-3.5 h-3.5" />
                <span>Zero Data Exposure</span>
              </div>
              <p className="text-slate-500 leading-relaxed text-[11px]">
                The public website contains zero Google Drive links, folder IDs, or credentials. Only opaque RLH identifiers exist client-side.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <div className="flex items-center gap-1.5 text-blue-700 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Two-Stage Signed Relay</span>
              </div>
              <p className="text-slate-500 leading-relaxed text-[11px]">
                Downloads resolve through <code className="font-mono text-slate-700">dl.study.mihora.tech</code> via short-lived HMAC signed tokens with one-time nonce consumption.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <div className="flex items-center gap-1.5 text-blue-700 font-semibold">
                <Database className="w-3.5 h-3.5" />
                <span>Encrypted Sharding</span>
              </div>
              <p className="text-slate-500 leading-relaxed text-[11px]">
                Server-side mappings are encrypted using AES-256-GCM. Decryption keys remain strictly isolated on the serverless edge.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <div className="flex items-center gap-1.5 text-blue-700 font-semibold">
                <Globe className="w-3.5 h-3.5" />
                <span>Direct Media Stream</span>
              </div>
              <p className="text-slate-500 leading-relaxed text-[11px]">
                Files are streamed directly without 302/307 redirects to Google Drive, ensuring high security and privacy.
              </p>
            </div>
          </div>
        </div>

        {/* Footer / Brand Links */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <span>&copy; {new Date().getFullYear()} Mihora Tech. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <a
              href="https://study.mihora.tech"
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 hover:underline flex items-center gap-1"
            >
              <span>study.mihora.tech</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

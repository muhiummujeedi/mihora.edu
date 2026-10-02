import React from 'react';

interface MihoraLogoProps {
  variant?: 'dark' | 'white';
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export const MihoraLogo: React.FC<MihoraLogoProps> = ({
  variant = 'dark',
  size = 'md',
  showText = true,
  className = ''
}) => {
  const sizeMap = {
    sm: { icon: 'w-7 h-7', textTitle: 'text-base', textSub: 'text-[9px]' },
    md: { icon: 'w-9 h-9', textTitle: 'text-lg', textSub: 'text-[10px]' },
    lg: { icon: 'w-14 h-14', textTitle: 'text-2xl', textSub: 'text-xs' }
  };

  const currentSize = sizeMap[size];
  const isWhite = variant === 'white';

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Dynamic SVG Icon matching the user's provided logo mark */}
      <div className={`relative shrink-0 ${currentSize.icon}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id={`grad-left-${variant}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0066FF" />
              <stop offset="100%" stopColor="#002266" />
            </linearGradient>
            <linearGradient id={`grad-right-${variant}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2980FF" />
              <stop offset="100%" stopColor="#001847" />
            </linearGradient>
            <linearGradient id={`grad-center-${variant}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#479BFF" />
              <stop offset="100%" stopColor="#0047BA" />
            </linearGradient>
          </defs>

          {/* M Facets */}
          <polygon points="12,12 28,26 28,74 12,88" fill={`url(#grad-left-${variant})`} />
          <polygon points="28,26 50,60 50,38 28,12" fill={`url(#grad-center-${variant})`} opacity="0.95" />
          <polygon points="28,26 50,60 28,74" fill="#003580" />
          <polygon points="72,26 50,60 50,38 72,12" fill={`url(#grad-center-${variant})`} opacity="0.9" />
          <polygon points="72,26 50,60 72,74" fill="#002666" />
          <polygon points="88,12 72,26 72,74 88,88" fill={`url(#grad-right-${variant})`} />

          {/* Constellation Network */}
          <g stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" opacity="0.9">
            <line x1="22" y1="36" x2="34" y2="30" />
            <line x1="34" y1="30" x2="40" y2="48" />
            <line x1="34" y1="30" x2="50" y2="44" />
            <line x1="22" y1="36" x2="40" y2="48" />
            <line x1="40" y1="48" x2="50" y2="44" />
            <line x1="50" y1="44" x2="64" y2="40" />
            <line x1="64" y1="40" x2="72" y2="28" />
            <line x1="50" y1="44" x2="68" y2="44" />
            <line x1="68" y1="44" x2="78" y2="44" />
            <line x1="72" y1="28" x2="68" y2="44" />
          </g>

          <g fill="#FFFFFF">
            <circle cx="22" cy="36" r="2.2" />
            <circle cx="34" cy="30" r="2.4" />
            <circle cx="40" cy="48" r="2.2" />
            <circle cx="50" cy="44" r="2.4" />
            <circle cx="64" cy="40" r="2.4" />
            <circle cx="72" cy="28" r="2.2" />
            <circle cx="68" cy="44" r="2" />
            <circle cx="78" cy="44" r="2.2" />
          </g>
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col justify-center text-left leading-none">
          <span
            className={`font-black tracking-tight ${currentSize.textTitle} ${
              isWhite ? 'text-white' : 'text-slate-950'
            }`}
          >
            MIHORA
          </span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <div className={`h-[1.5px] w-2.5 ${isWhite ? 'bg-blue-400' : 'bg-blue-600'}`} />
            <span
              className={`font-extrabold tracking-widest ${currentSize.textSub} ${
                isWhite ? 'text-blue-400' : 'text-blue-600'
              }`}
            >
              STUDY LIBRARY
            </span>
            <div className={`h-[1.5px] w-2.5 ${isWhite ? 'bg-blue-400' : 'bg-blue-600'}`} />
          </div>
        </div>
      )}
    </div>
  );
};

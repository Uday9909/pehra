import React from 'react';

interface PehraLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  textColor?: string;
}

/**
 * PEHRA Minimal Logo
 * Concept: A minimal combination of Water Wave + Location Pin + Warning Signal Beacon
 */
export const PehraLogo: React.FC<PehraLogoProps> = ({
  className = '',
  size = 32,
  showText = true,
  textColor = 'text-pehra-text',
}) => {
  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      <div
        className="relative flex items-center justify-center rounded-none bg-pehra-panelr from-pehra-panel to-pehra-panel text-white shadow-none p-1.5 shrink-0"
        style={{ width: size, height: size }}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full text-white"
        >
          {/* Location pin outer contour with stylized wave curves at bottom */}
          <path
            d="M12 2C8.13401 2 5 5.13401 5 9C5 13.5 12 21 12 21C12 21 19 13.5 19 9C19 5.13401 15.866 2 12 2Z"
            fill="var(--pehra-text)"
            fillOpacity="0.2"
            stroke="var(--pehra-text)"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Wave ripple lines inside pin */}
          <path
            d="M8 12C9 10.8 11 10.8 12 12C13 13.2 15 13.2 16 12"
            stroke="var(--pehra-text)"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d="M9 14.5C10 13.8 11.5 13.8 12.5 14.5C13.5 15.2 15 15.2 16 14.5"
            stroke="var(--pehra-text)"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeOpacity="0.8"
          />
          {/* Warning beacon signal dot at center top */}
          <circle cx="12" cy="7" r="1.8" fill="var(--pehra-text)" />
          <path
            d="M9.5 5C10.2 4.4 11.1 4 12 4C12.9 4 13.8 4.4 14.5 5"
            stroke="var(--pehra-text)"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeOpacity="0.9"
          />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center gap-1.5">
            <span className={`font-bold tracking-tight text-pehra-text font-sans ${textColor}`}>
              PEHRA
            </span>
            <span className="text-pehra-text font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-pehra-panel text-pehra-text border border-pehra-border-subtle/30">
              MMR
            </span>
          </div>
          <span className={`text-pehra-text ${textColor === 'text-white' ? 'text-pehra-text' : 'text-pehra-text'} font-medium tracking-tight mt-0.5`}>
            Flood Risk Intelligence
          </span>
        </div>
      )}
    </div>
  );
};

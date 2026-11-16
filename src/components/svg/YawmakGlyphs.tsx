import React from "react";

export interface YmGlyphProps {
  className?: string;
  size?: number;
  strokeWidth?: number;
}

function makeGlyph(children: React.ReactNode) {
  return function Glyph({
    className = "",
    size = 24,
    strokeWidth = 1.7,
    ...rest
  }: YmGlyphProps & React.SVGProps<SVGSVGElement>) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`shrink-0 ${className}`.trim()}
        aria-hidden="true"
        focusable="false"
        {...rest}
      >
        {children}
      </svg>
    );
  };
}

export const YmHome = makeGlyph(
  <>
    <path d="M3.4 11.2 12 3.6l8.6 7.6" />
    <path d="M5.8 9.8V20h12.4V9.8" />
    <path d="M9.8 20v-5.2h4.4V20" />
  </>
);

export const YmTasks = makeGlyph(
  <>
    <rect x="3.2" y="3.2" width="7.2" height="7.2" rx="2.2" />
    <rect x="3.2" y="13.6" width="7.2" height="7.2" rx="2.2" />
    <path d="M13.4 6.2h7.2" />
    <path d="M13.4 16.6h7.2" />
    <path d="M13.4 10.6h4.4" />
    <path d="M13.4 21h3" />
  </>
);

export const YmFocus = makeGlyph(
  <>
    <circle cx="12" cy="13.4" r="7.6" />
    <path d="M12 9.4v4.2l2.8 1.8" />
    <path d="M9.4 2.6h5.2" />
    <path d="M12 2.6v3.2" />
    <circle cx="12" cy="13.4" r="1.2" fill="currentColor" stroke="none" />
  </>
);

export const YmNotes = makeGlyph(
  <>
    <path d="M4.4 4.2h11.2l4 4v11.6a1.8 1.8 0 0 1-1.8 1.8H4.4z" />
    <path d="M15.4 4.2v4.2h4" />
    <path d="M7.8 12.4h8" />
    <path d="M7.8 16.2h5.6" />
  </>
);

export const YmCards = makeGlyph(
  <>
    <rect x="2.8" y="6.4" width="13.2" height="11.2" rx="2.6" />
    <path d="M8 6.4V5.2a1.8 1.8 0 0 1 1.8-1.8h8.6a1.8 1.8 0 0 1 1.8 1.8v8.2a1.8 1.8 0 0 1-1.8 1.8H17" />
    <path d="M6.2 11.2h6.4" />
    <path d="M6.2 14.2h4" />
  </>
);

export const YmCheck = makeGlyph(<path d="M4.6 12.6 9.6 17.6 19.4 6.8" />);

export const YmPlus = makeGlyph(
  <>
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </>
);

export const YmSearch = makeGlyph(
  <>
    <circle cx="10.8" cy="10.8" r="6.6" />
    <path d="M20.2 20.2 15.8 15.8" />
  </>
);

export const YmTrash = makeGlyph(
  <>
    <path d="M4 6.6h16" />
    <path d="M9.2 6.6V3.8h5.6v2.8" />
    <path d="M6.2 6.6 7.2 20.2h9.6l1-13.6" />
    <path d="M10.2 10.6v5.8" />
    <path d="M13.8 10.6v5.8" />
  </>
);

export const YmEdit = makeGlyph(
  <>
    <path d="M4 20.2 4.9 16.4 15.9 5.4a2 2 0 0 1 2.8 0l1 1a2 2 0 0 1 0 2.8L8.7 20.2z" />
    <path d="M14 7.3 17.2 10.5" />
  </>
);

export const YmPlay = makeGlyph(<path d="M8 5.2 18.6 12 8 18.8z" />);

export const YmPause = makeGlyph(
  <>
    <rect x="7" y="5" width="3.6" height="14" rx="1.4" />
    <rect x="13.4" y="5" width="3.6" height="14" rx="1.4" />
  </>
);

export const YmReset = makeGlyph(
  <>
    <path d="M4 4.6v5h5" />
    <path d="M4.8 9.6A8 8 0 1 1 4.2 13.6" />
  </>
);

export const YmPin = makeGlyph(
  <>
    <path d="M9 3.2h6l-1 5.8 3.2 3.2H6.8L10 9z" />
    <path d="M12 12.8V21" />
  </>
);

export const YmCalendar = makeGlyph(
  <>
    <rect x="3.2" y="5" width="17.6" height="15.8" rx="2.6" />
    <path d="M3.2 10h17.6" />
    <path d="M8 3.2v3.6" />
    <path d="M16 3.2v3.6" />
    <rect x="7.2" y="13" width="3.4" height="3.4" rx="1" fill="currentColor" stroke="none" />
  </>
);

export const YmChart = makeGlyph(
  <>
    <path d="M3.2 3.4v17.2h17.4" />
    <path d="M7.8 17.2v-4.6" />
    <path d="M12.4 17.2V7.4" />
    <path d="M17 17.2v-7" />
  </>
);

export const YmSparkle = makeGlyph(
  <>
    <path d="M12 3.4 13.9 8.7 19.2 10.6 13.9 12.5 12 17.8 10.1 12.5 4.8 10.6 10.1 8.7z" />
    <path d="M18.2 15.4l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z" />
  </>
);

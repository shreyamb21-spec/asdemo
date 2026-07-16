// Portfolio design system tokens — the single source of truth for color and type.
// The CSS variables in app/globals.css mirror these values 1:1 so Tailwind
// utilities (bg-background, text-dim, font-display, ...) resolve to them;
// change a value here and in globals.css together.

export const C = {
  bg: "#F5F1EA",          // page background (cream)
  bgAlt: "#EDE9DC",        // alternating panel background, deeper cream
  card: "#FFFFFF",         // card surfaces
  cardHover: "#FAF8F3",
  ink: "#1A1815",          // primary text and ALL former accent roles
  text: "#4A453D",         // body text
  muted: "#6B6558",        // tertiary text
  dim: "#A39C8C",          // hints, timestamps, microlabels
  border: "rgba(26,24,21,0.15)",
  borderStrong: "rgba(26,24,21,0.35)",
  tagBg: "#EDE9DC",        // the ONE allowed non-binary fill, for chips/tags only
};

export const FONT = {
  display: "'Playfair Display', serif",   // headings, the ROI number, company names
  body: "'Outfit', sans-serif",           // all body copy, buttons, questions
  mono: "'JetBrains Mono', monospace",    // labels, tags, stats, source chips, badges
};

// The portfolio eyebrow-label pattern, used above every brief section.
export const EYEBROW = "font-mono text-[11px] uppercase tracking-[0.08em] text-dim";

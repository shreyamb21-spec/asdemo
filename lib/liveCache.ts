// Client-side cache of live-run briefs (localStorage). No database per spec —
// cached briefs survive reloads on this browser only.
import { Brief } from "./types";

const KEY = "liveBriefCache";

function slugify(brief: Brief): string {
  const base = brief.domain || brief.companyName || "brief";
  return (
    "live-" +
    base
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
  );
}

export function loadCachedBriefs(): Brief[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Brief[]) : [];
  } catch {
    return [];
  }
}

/** Saves (or overwrites by slug) a live brief. Returns the brief with its cache slug. */
export function saveCachedBrief(brief: Brief): Brief {
  const slugged = { ...brief, slug: slugify(brief) };
  try {
    const existing = loadCachedBriefs().filter((b) => b.slug !== slugged.slug);
    localStorage.setItem(KEY, JSON.stringify([slugged, ...existing]));
  } catch {
    /* storage full or unavailable — brief still works via sessionStorage */
  }
  return slugged;
}

export function getCachedBrief(slug: string): Brief | undefined {
  return loadCachedBriefs().find((b) => b.slug === slug);
}

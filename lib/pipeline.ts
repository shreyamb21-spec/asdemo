import { Brief, StageEvent } from "./types";
import { callLLMJson } from "./gateway";
import { PROMPT_A, PROMPT_B, PROMPT_C } from "./prompts";

const PAGE_CHAR_CAP = 8_000;
const FETCH_TIMEOUT_MS = 10_000;
const CAREERS_PATHS = ["/careers", "/jobs", "/about"];

const STAGE_LABELS = [
  "Fetching public footprint",
  "Building company profile",
  "Inferring toolchain",
  "Forming pain hypotheses",
  "Assembling brief",
];

interface ProfileResult {
  companyName: string;
  vertical: string;
  snapshot: [string, string];
  teamSignal: { stat: string; label: string };
  compliance: { badge: string; note: string }[];
  toolchain: { tool: string; confidence: "confirmed" | "inferred"; sourceQuote: string }[];
}

interface HypothesesResult {
  hypotheses: Brief["hypotheses"];
}

interface AssemblyResult {
  questions: Brief["questions"];
  storyline: Brief["storyline"];
  roiDefaults: Brief["roiDefaults"];
}

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchPage(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
    });
    if (!res.ok) return null;
    const ct = res.headers.get("content-type") ?? "";
    if (!ct.includes("html") && !ct.includes("text")) return null;
    return await res.text();
  } catch {
    return null;
  }
}

/** Find on-page links whose text matches /careers|jobs|join/i. Returns absolute URLs. */
function findCareersLinks(html: string, baseUrl: string): string[] {
  const links: string[] = [];
  const re = /<a\s[^>]*href=["']([^"'#]+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null && links.length < 3) {
    const text = stripHtml(m[2]);
    if (/careers|jobs|join/i.test(text)) {
      try {
        links.push(new URL(m[1], baseUrl).href);
      } catch {
        /* ignore malformed hrefs */
      }
    }
  }
  return links;
}

export interface CorpusResult {
  corpus: string;
  sources: string[];
}

export async function buildCorpus(
  domain: string,
  pastedJobPosting?: string
): Promise<CorpusResult> {
  const cleanDomain = domain
    .trim()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "");
  const base = `https://${cleanDomain}`;

  const sources: string[] = [];
  const parts: string[] = [];

  const homepageHtml = await fetchPage(base);
  if (homepageHtml) {
    parts.push(`HOMEPAGE (${base}):\n${stripHtml(homepageHtml).slice(0, PAGE_CHAR_CAP)}`);
    sources.push(base);
  }

  const candidates = CAREERS_PATHS.map((p) => `${base}${p}`);
  if (homepageHtml) candidates.push(...findCareersLinks(homepageHtml, base));

  const seen = new Set<string>(sources);
  for (const url of candidates) {
    if (seen.has(url) || sources.length >= 4) continue;
    seen.add(url);
    const html = await fetchPage(url);
    if (html) {
      const text = stripHtml(html);
      if (text.length > 200) {
        parts.push(`PAGE (${url}):\n${text.slice(0, PAGE_CHAR_CAP)}`);
        sources.push(url);
      }
    }
  }

  if (pastedJobPosting?.trim()) {
    parts.push(`PASTED JOB POSTING:\n${pastedJobPosting.trim().slice(0, PAGE_CHAR_CAP)}`);
  }

  return { corpus: parts.join("\n\n---\n\n"), sources };
}

/** Runs the full pipeline, yielding stage events. The final event carries the Brief. */
export async function* runPipeline(
  domain: string,
  pastedJobPosting?: string,
  signal?: AbortSignal
): AsyncGenerator<StageEvent> {
  // Stage 1: footprint fetch (no LLM)
  yield { stage: 1, label: STAGE_LABELS[0], status: "running" };
  const { corpus, sources } = await buildCorpus(domain, pastedJobPosting);
  if (!corpus) {
    yield {
      stage: 1,
      status: "error",
      message:
        "Couldn't fetch anything from that domain. Paste a job posting below and try again — the pipeline works from pasted text too.",
    };
    return;
  }
  yield { stage: 1, status: "done" };

  // Stages 2-3: profile + toolchain (LLM call 1)
  yield { stage: 2, label: STAGE_LABELS[1], status: "running" };
  let profile: ProfileResult;
  try {
    profile = await callLLMJson<ProfileResult>(PROMPT_A.replace("{corpus}", corpus), signal);
  } catch (err) {
    console.error("[pipeline] profile call failed:", err);
    yield {
      stage: 2,
      status: "error",
      message: "The profile model call failed. Hit retry — this is usually transient.",
    };
    return;
  }
  yield { stage: 2, status: "done" };
  yield { stage: 3, label: STAGE_LABELS[2], status: "running" };
  yield { stage: 3, status: "done" };

  // Stage 4: pain hypotheses (LLM call 2)
  yield { stage: 4, label: STAGE_LABELS[3], status: "running" };
  const profileJson = JSON.stringify(profile);
  let hypotheses: HypothesesResult;
  try {
    hypotheses = await callLLMJson<HypothesesResult>(
      PROMPT_B.replace("{profileJson}", profileJson).replace("{corpus}", corpus),
      signal
    );
  } catch (err) {
    console.error("[pipeline] hypotheses call failed:", err);
    yield {
      stage: 4,
      status: "error",
      message: "The hypotheses model call failed. Hit retry — this is usually transient.",
    };
    return;
  }
  yield { stage: 4, status: "done" };

  // Stage 5: brief assembly (LLM call 3)
  yield { stage: 5, label: STAGE_LABELS[4], status: "running" };
  let assembly: AssemblyResult;
  try {
    assembly = await callLLMJson<AssemblyResult>(
      PROMPT_C.replace("{profileJson}", profileJson).replace(
        "{hypothesesJson}",
        JSON.stringify(hypotheses)
      ),
      signal
    );
  } catch (err) {
    console.error("[pipeline] assembly call failed:", err);
    yield {
      stage: 5,
      status: "error",
      message: "The assembly model call failed. Hit retry — this is usually transient.",
    };
    return;
  }

  const cleanDomain = domain.trim().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  const homepage = sources[0] ?? `https://${cleanDomain}`;

  const brief: Brief = {
    slug: "live",
    companyName: profile.companyName,
    domain: cleanDomain,
    vertical: profile.vertical,
    icpBlurb: "",
    snapshot: profile.snapshot,
    teamSignal: profile.teamSignal,
    compliance: profile.compliance as Brief["compliance"],
    toolchain: profile.toolchain.map((t) => ({
      ...t,
      // Model only returns quotes; point chips at the corpus pages we actually fetched.
      sourceUrl: sources.find((s) => /careers|jobs/i.test(s)) ?? homepage,
    })),
    hypotheses: hypotheses.hypotheses.map((h) => ({ ...h, sourceUrl: homepage })),
    questions: assembly.questions,
    storyline: assembly.storyline,
    roiDefaults: assembly.roiDefaults,
    sources,
    generatedAt: new Date().toISOString(),
    mode: "live",
  };

  yield { stage: 5, status: "done", brief };
}

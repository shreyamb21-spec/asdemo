
# Discovery Copilot: Build Spec for Claude Code

Pre-call discovery briefs for AllSpice solutions engineers. Enter a prospect's domain, get a grounded, skimmable brief in about 90 seconds: company snapshot, inferred ECAD toolchain with sources, compliance profile, pain hypotheses, discovery questions, demo storyline, and an interactive respin ROI calculator.

**Context:** This will be demoed live in a 30-minute interview call tomorrow (3-minute demo window). Reliability beats features. Pre-baked briefs must load instantly and never break. The live run is the bonus, not the foundation.

**The one design law:** nothing longer than two lines visible by default. Depth lives behind clicks. If a section reads like a document, it is wrong.

---

## 1. Stack

- Next.js 14+ (App Router), TypeScript
- Tailwind CSS + shadcn/ui components
- Deployed to Vercel
- LLM calls via Merge Gateway (Anthropic-compatible), server-side only
- No database. Pre-baked briefs are static JSON files in the repo. Live-run briefs live in client state only.

## 2. Environment variables

```
MERGE_GATEWAY_API_KEY=        # provided by Shreyam, never expose client-side
MERGE_GATEWAY_BASE_URL=       # Shreyam's Merge Gateway endpoint
MERGE_GATEWAY_MODEL=          # model string available on the gateway
```

All LLM calls happen in route handlers under `app/api/`. The client never sees the key. Add `.env.local` to `.gitignore`. Set the same vars in Vercel project settings before deploy.

## 3. File structure

```
app/
  page.tsx                     # landing: input + 3 ICP cards
  brief/[slug]/page.tsx        # pre-baked brief view (skydio, butterfly, formlabs)
  brief/live/page.tsx          # live-run brief view (reads from client state/sessionStorage)
  api/generate/route.ts        # SSE pipeline endpoint
components/
  CompanyCard.tsx              # ICP card on landing
  PipelineProgress.tsx         # 5-stage animated progress
  BriefHeader.tsx              # snapshot + compliance pills + team stat
  ToolchainChips.tsx           # tool chips with source popovers
  HypothesisCards.tsx          # 3 cards, evidence behind click
  DiscoveryQuestions.tsx       # numbered list, color-coded
  DemoStoryline.tsx            # horizontal 4-step stepper
  RoiCalculator.tsx            # sliders + animated dollar figure
  SourcesFooter.tsx            # collapsed list of all URLs used
lib/
  types.ts                     # Brief type (schema below)
  pipeline.ts                  # fetch + LLM orchestration
  prompts.ts                   # the 3 prompts, verbatim from section 6
  roi.ts                       # ROI math + defaults
data/
  briefs/skydio.json
  briefs/butterfly-network.json
  briefs/formlabs.json
```

## 4. Data model

```ts
// lib/types.ts
export interface Brief {
  slug: string;
  companyName: string;
  domain: string;
  vertical: string;                 // e.g. "Defense & Drones"
  icpBlurb: string;                 // 2 lines max: why they fit AllSpice's ICP
  snapshot: string[];               // exactly 2 short lines
  teamSignal: { stat: string; label: string };   // e.g. { stat: "40+", label: "EE & hardware roles posted since 2024" }
  compliance: { badge: "ITAR" | "FDA" | "ISO 9001" | "AS9100" | "IEC 62304"; note: string }[];
  toolchain: { tool: string; confidence: "confirmed" | "inferred"; sourceUrl: string; sourceQuote: string }[];
  hypotheses: {
    title: string;                  // one line
    icon: "review" | "compliance" | "respin" | "handoff" | "scale";
    confidence: "high" | "medium";
    evidence: string;               // 2-3 sentences, hidden behind click
    sourceUrl?: string;
  }[];                              // exactly 3
  questions: { text: string; hypothesisIndex: 0 | 1 | 2 }[];   // 5-7
  storyline: { step: string; capability: string }[];           // exactly 4
  roiDefaults: { respinsPerYear: number; costPerRespin: number; reviewHoursPerWeek: number; engineerCount: number };
  sources: string[];                // every URL used anywhere
  generatedAt: string;
  mode: "prebaked" | "live";
}
```

## 5. Pipeline (app/api/generate/route.ts)

POST body: `{ domain: string, pastedJobPosting?: string }`

Respond as an SSE / streamed NDJSON of stage events so the UI animates in real time:

```
{ "stage": 1, "label": "Fetching public footprint", "status": "running" }
{ "stage": 1, "status": "done" }
{ "stage": 2, "label": "Building company profile", "status": "running" }
...
{ "stage": 5, "status": "done", "brief": { ...Brief } }
```

**Stage 1: Footprint fetch (no LLM).** Server-side fetch of `https://{domain}` plus best-effort careers page. Try, in order: `/careers`, `/jobs`, `/about`, and any link on the homepage whose text matches /careers|jobs|join/i. Strip HTML to text (a simple tag-strip + whitespace collapse is fine; cap each page at ~8,000 chars). If `pastedJobPosting` is provided, append it to the corpus labeled as "PASTED JOB POSTING". If all fetches fail AND no pasted posting, return a stage error event with a friendly message telling the user to paste a job posting instead. Never hard-crash.

**Stage 2-3: Profile + toolchain (LLM call 1).** One call using PROMPT_A over the corpus. Emit stage 2 done when the call starts returning, stage 3 done when parsed.

**Stage 4: Pain hypotheses (LLM call 2).** PROMPT_B, input is the JSON output of call 1 plus the corpus.

**Stage 5: Brief assembly (LLM call 3).** PROMPT_C, input is outputs of calls 1 and 2. Produces questions, storyline, ROI defaults. Server merges everything into the Brief object and emits it in the final event.

Total: 3 LLM calls. Temperature 0.3. Each prompt demands JSON only; strip markdown fences before `JSON.parse`, wrap in try/catch, and on parse failure retry once with the reply "Return ONLY valid JSON, no other text." appended. On second failure, emit a stage error event.

## 6. Prompts (lib/prompts.ts, use verbatim)

**PROMPT_A (profile + toolchain):**

```
You are a research analyst preparing a sales pre-call brief for AllSpice.io, a hardware collaboration platform (Git-based version control, design reviews, and AI review for electronics teams).

Below is text scraped from a prospect company's public website and job postings. Analyze it and return ONLY a JSON object with this exact shape:

{
  "companyName": string,
  "vertical": string,
  "snapshot": [string, string],
  "teamSignal": { "stat": string, "label": string },
  "compliance": [{ "badge": string, "note": string }],
  "toolchain": [{ "tool": string, "confidence": "confirmed" | "inferred", "sourceQuote": string }]
}

Rules:
- snapshot: exactly 2 lines, each under 15 words, describing what they build and ship.
- teamSignal: one concrete number you can support from the text (e.g. count of hardware roles listed). If nothing concrete exists, use a qualitative stat like "Hiring" with a supportable label.
- compliance: only include badges genuinely implied by their industry (ITAR for US defense, FDA/IEC 62304 for medical, AS9100 for aerospace, ISO 9001 general). Empty array if none.
- toolchain: "confirmed" ONLY if a tool is literally named in the text, with sourceQuote being the exact sentence naming it. "inferred" for reasonable guesses from the industry, with sourceQuote explaining the inference basis. Never invent quotes.
- If the text is thin, say less. Do not fabricate.

TEXT:
{corpus}
```

**PROMPT_B (hypotheses):**

```
You are a solutions engineer at AllSpice.io preparing for a discovery call. AllSpice sells: Git-based version control with visual diffs for schematics/layouts/BOMs, pull-request-style design reviews with sign-offs and audit trails, automation on every revision, and DRCY, a grounded AI design reviewer.

Given this company profile JSON and source text, produce the 3 most likely workflow pain points this company has that AllSpice addresses. Return ONLY JSON:

{
  "hypotheses": [
    { "title": string, "icon": "review" | "compliance" | "respin" | "handoff" | "scale", "confidence": "high" | "medium", "evidence": string }
  ]
}

Rules:
- Exactly 3 hypotheses. title under 10 words. evidence is 2-3 sentences tying the hypothesis to something specific about THIS company (their industry, scale, compliance regime, or job posting language). Generic pain that applies to any company scores zero.
- confidence "high" only when the evidence includes something specific from the source text.

PROFILE: {profileJson}
TEXT: {corpus}
```

**PROMPT_C (questions + storyline + ROI defaults):**

```
You are a solutions engineer at AllSpice.io. Given the company profile and pain hypotheses below, produce discovery questions, a demo storyline, and ROI calculator defaults. Return ONLY JSON:

{
  "questions": [{ "text": string, "hypothesisIndex": 0 | 1 | 2 }],
  "storyline": [{ "step": string, "capability": string }],
  "roiDefaults": { "respinsPerYear": number, "costPerRespin": number, "reviewHoursPerWeek": number, "engineerCount": number }
}

Rules:
- questions: 5 to 7, open-ended, ordered as you would ask them in a real call, each under 20 words, each mapped to the hypothesis it tests.
- storyline: exactly 4 steps. step is what you show (under 8 words), capability is the AllSpice feature it demonstrates (under 6 words). Order for maximum credibility with a skeptical engineer: start where their pain is sharpest.
- roiDefaults: realistic for this company's size and industry. costPerRespin in USD (typical range 15000 to 250000 depending on volume and complexity). engineerCount estimated from team signals.

PROFILE: {profileJson}
HYPOTHESES: {hypothesesJson}
```

## 7. ROI math (lib/roi.ts)

```
annualRespinCost   = respinsPerYear * costPerRespin
reviewCost         = reviewHoursPerWeek * engineerCount * 48 * 110   // $110/hr loaded EE rate
statusQuoCost      = annualRespinCost + reviewCost
withAllSpice       = annualRespinCost * 0.5 + reviewCost * 0.7       // assumptions shown in UI fine print
annualSavings      = statusQuoCost - withAllSpice
```

Show the assumptions ("assumes half of respins are review-escapable; 30% review time saved") in small muted text under the number. These are demo assumptions, clearly labeled, not AllSpice claims.

## 8. UI spec

**Global design:** light mode, near-white background (#FAFAF8), single accent green (#2F6B4F, echoing AllSpice's branding) used sparingly for CTAs, pills, and the ROI number. Ink #1A1A1A, muted #6B7280. Generous whitespace, 8px radius cards with subtle borders (no heavy shadows). Inter or system font stack. The whole app is 2 screens; make them feel expensive, not busy.

**Landing (`/`):**
- Title: "Discovery Copilot" with subline "Pre-call briefs for AllSpice SEs. Grounded in public sources."
- Domain input + "Generate brief" button. Below it, a collapsed "or paste a job posting" textarea (expands on click).
- Three CompanyCards in a row (stack on mobile): company name, vertical badge, 2-line ICP blurb, "View brief" ghost button. Clicking navigates to the pre-baked brief instantly.
- Footer line, small and muted: "Built by Shreyam Borah. Every claim links to its source."

**Pipeline view (live run only):** replaces the input area in place. Five rows, each with label + spinner that becomes a green check: Fetching public footprint / Building company profile / Inferring toolchain / Forming pain hypotheses / Assembling brief. On the final event, route to `/brief/live`.

**Brief page (both modes), top to bottom:**
1. **BriefHeader:** company name + vertical badge left; compliance pills center (colored: ITAR slate, FDA blue, ISO neutral, hover shows note); teamSignal as a big stat right. Snapshot's 2 lines under the name. A "prebaked" or "live" tag, small, top-right.
2. **ToolchainChips:** one row of chips. Confirmed chips solid, inferred chips outlined with a dotted border and an "inferred" microlabel. Every chip has a small link icon opening a popover with the sourceQuote and a link to sourceUrl. This popover is the DRCY-rhyme moment in the demo; make it feel instant.
3. **HypothesisCards:** 3 equal cards in a row. Icon, one-line title, confidence dot (green high, amber medium). Card expands on click to reveal evidence text and source link. Collapsed by default.
4. **DiscoveryQuestions:** numbered compact list. Each row has a 3px left border colored to match its hypothesis card (assign each hypothesis one of 3 hues). No paragraph text.
5. **DemoStoryline:** horizontal stepper, 4 nodes connected by a line. Node: step text above, capability as a small pill below.
6. **RoiCalculator:** the visual centerpiece. Left: 4 sliders (respins/year 0-12, cost per respin $10K-$500K log-ish steps, review hrs/week 0-40, engineers 1-100) with live value labels. Right: "Estimated annual cost of the status quo" and the savings number, large (48px+), accent green, animating (count-up) on change. Assumption fine print below.
7. **SourcesFooter:** collapsed accordion "Sources (N)". Expanded: plain list of URLs, each clickable.

**Interaction budget:** the whole brief must be scannable in 60 seconds with zero clicks, and fully explored in 2-3 minutes with clicks. No section may exceed one viewport height on a 13" laptop.

## 9. Pre-baked briefs (data/briefs/*.json)

Do NOT hand-write facts. Generate each by running the real pipeline against the real domain during the build, then review and trim the output. This guarantees sourceQuotes and sourceUrls are real, which is the entire credibility story. If a careers page will not fetch for one of them, find a live job posting URL manually and use the paste path to generate.

The three companies and their ICP blurbs (use these verbatim on the CompanyCards):

1. **Skydio** (`skydio.com`), vertical "Defense & Drones". ICP blurb: "US drone maker with defense contracts: ITAR means every design review needs an audit trail, and rapid iteration makes respin costs compound."
2. **Butterfly Network** (`butterflynetwork.com`), vertical "Medical Devices". ICP blurb: "FDA-regulated handheld ultrasound: design history files are mandatory, so traceable reviews are a regulatory requirement, not a nice-to-have."
3. **Formlabs** (`formlabs.com`), vertical "Consumer & Pro Hardware". ICP blurb: "Boston-based 3D printer maker shipping at volume: one respin on a high-volume board is a margin event, and a large EE team means review throughput matters."

Set `mode: "prebaked"` and keep `generatedAt` honest. If any pipeline output for these three contains a claim that cannot be traced to a fetched page, delete that claim rather than keep it. Thin and true beats rich and shaky.

## 10. Error handling and demo insurance

- Every fetch and LLM call in try/catch. Stage errors render as an amber row with a retry button and the paste-a-job-posting fallback, never a blank screen or console dump.
- 60-second hard timeout on the full pipeline with a graceful message.
- Pre-baked briefs are static imports: zero network, cannot fail.
- Rate-limit the generate route lightly (in-memory, 5/min) since the URL may be shared after the call.

## 11. Build order (half-day budget)

1. Scaffold + types + the three static brief JSONs stubbed with placeholder data; build the entire brief UI against stubs first. The UI is the demo; it gets the polish hours.
2. Landing page + cards + routing.
3. Pipeline route + prompts + live view.
4. Run pipeline against the three domains, replace stubs with real reviewed output.
5. Deploy to Vercel, set env vars, test the live run on 2 extra domains (pick ones tested tonight) so tomorrow's live moment is rehearsed, not gambled.
6. Test on the laptop + screen-share resolution actually used tomorrow.

## 12. Acceptance checklist

- [ ] Pre-baked brief loads in under 1 second, no network
- [ ] Full live run completes in under 90 seconds on a tested domain
- [ ] Every toolchain chip and hypothesis evidence links to a real, working URL
- [ ] ROI number animates and the math matches lib/roi.ts
- [ ] Paste-a-job-posting path works with fetching fully blocked
- [ ] Nothing on the brief page exceeds two lines without a click
- [ ] Key is server-side only; view-source and network tab show no key
- [ ] Looks right at 1280px wide (screen-share size), not just full screen

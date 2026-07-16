// The three pipeline prompts, verbatim from the spec (section 6).
// {corpus}, {profileJson}, {hypothesesJson} are replaced at call time.

export const PROMPT_A = `You are a research analyst preparing a sales pre-call brief for AllSpice.io, a hardware collaboration platform (Git-based version control, design reviews, and AI review for electronics teams).

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
{corpus}`;

export const PROMPT_B = `You are a solutions engineer at AllSpice.io preparing for a discovery call. AllSpice sells: Git-based version control with visual diffs for schematics/layouts/BOMs, pull-request-style design reviews with sign-offs and audit trails, automation on every revision, and DRCY, a grounded AI design reviewer.

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
TEXT: {corpus}`;

export const PROMPT_C = `You are a solutions engineer at AllSpice.io. Given the company profile and pain hypotheses below, produce discovery questions, a demo storyline, and ROI calculator defaults. Return ONLY JSON:

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
HYPOTHESES: {hypothesesJson}`;

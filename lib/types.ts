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

export type StageStatus = "running" | "done" | "error";

export interface StageEvent {
  stage: number;
  label?: string;
  status: StageStatus;
  message?: string;      // friendly error message when status === "error"
  brief?: Brief;         // present on the final stage-5 done event
}

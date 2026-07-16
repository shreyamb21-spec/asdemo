"use client";

import { useState } from "react";
import {
  GitPullRequest,
  ShieldCheck,
  RefreshCw,
  ArrowLeftRight,
  TrendingUp,
  ExternalLink,
  ChevronDown,
} from "lucide-react";
import { Brief } from "@/lib/types";
import { HYPOTHESIS_HUES } from "@/lib/hues";
import { cn } from "@/lib/utils";

const ICONS = {
  review: GitPullRequest,
  compliance: ShieldCheck,
  respin: RefreshCw,
  handoff: ArrowLeftRight,
  scale: TrendingUp,
};

export function HypothesisCards({ hypotheses }: { hypotheses: Brief["hypotheses"] }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section>
      <h2 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Pain hypotheses
      </h2>
      <div className="grid gap-3 sm:grid-cols-3">
        {hypotheses.map((h, i) => {
          const Icon = ICONS[h.icon] ?? GitPullRequest;
          const hue = HYPOTHESIS_HUES[i % 3];
          const expanded = open === i;
          return (
            <button
              key={h.title}
              type="button"
              onClick={() => setOpen(expanded ? null : i)}
              className="flex cursor-pointer flex-col items-start gap-2 rounded-lg border bg-card p-4 text-left transition-shadow hover:shadow-sm"
              style={{ borderTop: `3px solid ${hue.border}` }}
              aria-expanded={expanded}
            >
              <div className="flex w-full items-center gap-2">
                <span
                  className="flex size-7 items-center justify-center rounded-md"
                  style={{ backgroundColor: hue.bg, color: hue.text }}
                >
                  <Icon className="size-4" />
                </span>
                <span
                  className={cn(
                    "ml-auto size-2 rounded-full",
                    h.confidence === "high" ? "bg-emerald-500" : "bg-amber-400"
                  )}
                  title={`${h.confidence} confidence`}
                />
                <ChevronDown
                  className={cn(
                    "size-4 text-muted-foreground transition-transform",
                    expanded && "rotate-180"
                  )}
                />
              </div>
              <span className="text-sm font-medium leading-snug">{h.title}</span>
              {expanded && (
                <div className="text-sm leading-snug text-muted-foreground">
                  {h.evidence}
                  {h.sourceUrl && (
                    <a
                      href={h.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="mt-1 flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      <ExternalLink className="size-3" />
                      Source
                    </a>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}

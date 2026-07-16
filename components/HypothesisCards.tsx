"use client";

import { useState } from "react";
import {
  GitPullRequest,
  ShieldCheck,
  RefreshCw,
  ArrowLeftRight,
  TrendingUp,
  ChevronDown,
} from "lucide-react";
import { Brief } from "@/lib/types";
import { EYEBROW } from "@/lib/theme";
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
      <h2 className={cn("mb-2", EYEBROW)}>Pain hypotheses</h2>
      <div className="grid gap-3 sm:grid-cols-3">
        {hypotheses.map((h, i) => {
          const Icon = ICONS[h.icon] ?? GitPullRequest;
          const expanded = open === i;
          return (
            <button
              key={h.title}
              type="button"
              onClick={() => setOpen(expanded ? null : i)}
              className={cn(
                "flex cursor-pointer flex-col items-start gap-2 rounded-lg border bg-card p-4 text-left transition-colors duration-150 hover:border-border-strong",
                expanded && "border-border-strong"
              )}
              aria-expanded={expanded}
            >
              <div className="flex w-full items-center gap-2">
                <Icon className="size-4 text-foreground" strokeWidth={1.5} />
                <span className="ml-auto flex items-center gap-1.5">
                  <span
                    className={cn(
                      "size-2 rounded-full",
                      h.confidence === "high"
                        ? "bg-foreground"
                        : "border border-foreground bg-transparent"
                    )}
                  />
                  <span className="font-mono text-[10px] text-dim">{h.confidence}</span>
                </span>
                <span className="rounded-[4px] bg-tag px-1.5 py-0.5 font-mono text-[10px] text-foreground">
                  H{i + 1}
                </span>
                <ChevronDown
                  className={cn(
                    "size-4 text-dim transition-transform duration-150",
                    expanded && "rotate-180"
                  )}
                  strokeWidth={1.5}
                />
              </div>
              <span className="text-sm font-medium leading-snug text-foreground">
                {h.title}
              </span>
              {expanded && (
                <div className="text-sm leading-snug text-body">
                  {h.evidence}
                  {h.sourceUrl && (
                    <a
                      href={h.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="mt-1 block w-fit text-xs text-foreground underline underline-offset-2"
                    >
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

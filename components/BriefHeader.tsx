"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Brief } from "@/lib/types";

export function BriefHeader({ brief }: { brief: Brief }) {
  return (
    <header className="relative flex flex-wrap items-start justify-between gap-6 rounded-lg border bg-card p-6">
      <span className="absolute right-4 top-3 font-mono text-[10px] lowercase tracking-[0.08em] text-dim">
        {brief.mode}
      </span>

      <div className="min-w-56 flex-1">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-3xl font-bold text-foreground">
            {brief.companyName}
          </h1>
          <span className="rounded-[4px] bg-tag px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em] text-foreground">
            {brief.vertical}
          </span>
        </div>
        <div className="mt-2 space-y-0.5 text-sm text-body">
          {brief.snapshot.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      </div>

      {brief.compliance.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 self-center">
          {brief.compliance.map((c) => (
            <Popover key={c.badge}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="cursor-pointer rounded-[4px] border border-border-strong px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.08em] text-foreground transition-colors duration-150 hover:bg-card-hover"
                >
                  {c.badge}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-64 text-sm text-body" side="bottom">
                {c.note}
              </PopoverContent>
            </Popover>
          ))}
        </div>
      )}

      <div className="self-center text-right">
        <div className="font-display text-4xl font-semibold text-foreground">
          {brief.teamSignal.stat}
        </div>
        <div className="mt-1 max-w-44 font-mono text-[11px] leading-snug text-dim">
          {brief.teamSignal.label}
        </div>
      </div>
    </header>
  );
}

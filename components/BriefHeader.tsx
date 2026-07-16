"use client";

import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Brief } from "@/lib/types";
import { cn } from "@/lib/utils";

const BADGE_STYLES: Record<string, string> = {
  ITAR: "bg-slate-600 text-white",
  FDA: "bg-blue-600 text-white",
  "IEC 62304": "bg-blue-500 text-white",
  AS9100: "bg-slate-500 text-white",
  "ISO 9001": "bg-neutral-200 text-neutral-700",
};

export function BriefHeader({ brief }: { brief: Brief }) {
  return (
    <header className="relative flex flex-wrap items-start justify-between gap-6 rounded-lg border bg-card p-6">
      <span className="absolute right-3 top-3 rounded border px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
        {brief.mode}
      </span>

      <div className="min-w-56 flex-1">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">{brief.companyName}</h1>
          <Badge variant="secondary">{brief.vertical}</Badge>
        </div>
        <div className="mt-2 space-y-0.5 text-sm text-muted-foreground">
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
                <button type="button" className="cursor-pointer">
                  <Badge className={cn("h-6 px-2.5", BADGE_STYLES[c.badge] ?? "bg-neutral-200 text-neutral-700")}>
                    {c.badge}
                  </Badge>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-64 text-sm" side="bottom">
                {c.note}
              </PopoverContent>
            </Popover>
          ))}
        </div>
      )}

      <div className="self-center text-right">
        <div className="text-4xl font-semibold text-primary">{brief.teamSignal.stat}</div>
        <div className="mt-1 max-w-44 text-xs text-muted-foreground">{brief.teamSignal.label}</div>
      </div>
    </header>
  );
}

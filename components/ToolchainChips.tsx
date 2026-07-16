"use client";

import { Link2 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Brief } from "@/lib/types";
import { EYEBROW } from "@/lib/theme";
import { cn } from "@/lib/utils";

export function ToolchainChips({ toolchain }: { toolchain: Brief["toolchain"] }) {
  if (toolchain.length === 0) return null;
  return (
    <section>
      <h2 className={cn("mb-2", EYEBROW)}>Toolchain</h2>
      <div className="flex flex-wrap gap-2">
        {toolchain.map((t) => (
          <Popover key={t.tool}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className={cn(
                  "inline-flex cursor-pointer items-center gap-1.5 rounded-[4px] px-3 py-1 font-mono text-xs transition-colors duration-150",
                  t.confidence === "confirmed"
                    ? "border border-border bg-tag text-foreground hover:border-border-strong"
                    : "border border-dashed border-border-strong text-muted-foreground hover:bg-card-hover"
                )}
              >
                {t.tool}
                {t.confidence === "inferred" && (
                  <span className="text-[9px] uppercase tracking-[0.08em] text-dim">
                    inferred
                  </span>
                )}
                <Link2 className="size-3 opacity-60" strokeWidth={1.5} />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-80" side="bottom" align="start">
              <p className="text-sm italic leading-snug text-body">
                &ldquo;{t.sourceQuote}&rdquo;
              </p>
              <a
                href={t.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-block break-all text-xs text-foreground underline underline-offset-2"
              >
                {t.sourceUrl}
              </a>
            </PopoverContent>
          </Popover>
        ))}
      </div>
    </section>
  );
}

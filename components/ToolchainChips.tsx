"use client";

import { Link2, ExternalLink } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Brief } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ToolchainChips({ toolchain }: { toolchain: Brief["toolchain"] }) {
  if (toolchain.length === 0) return null;
  return (
    <section>
      <h2 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Toolchain
      </h2>
      <div className="flex flex-wrap gap-2">
        {toolchain.map((t) => (
          <Popover key={t.tool}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className={cn(
                  "inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1 text-sm transition-colors",
                  t.confidence === "confirmed"
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "border border-dashed border-muted-foreground/50 text-foreground hover:bg-muted"
                )}
              >
                {t.tool}
                {t.confidence === "inferred" && (
                  <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    inferred
                  </span>
                )}
                <Link2 className="size-3 opacity-70" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-80" side="bottom" align="start">
              <p className="text-sm leading-snug">&ldquo;{t.sourceQuote}&rdquo;</p>
              <a
                href={t.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-flex items-center gap-1 text-xs text-primary hover:underline"
              >
                <ExternalLink className="size-3" />
                {t.sourceUrl}
              </a>
            </PopoverContent>
          </Popover>
        ))}
      </div>
    </section>
  );
}

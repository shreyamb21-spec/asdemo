"use client";

import { Check, Loader2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export const PIPELINE_STAGES = [
  "Fetching public footprint",
  "Building company profile",
  "Inferring toolchain",
  "Forming pain hypotheses",
  "Assembling brief",
];

export type StageState = "pending" | "running" | "done" | "error";

export function PipelineProgress({
  states,
  errorMessage,
  onRetry,
}: {
  states: StageState[]; // length 5
  errorMessage?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex w-full flex-col gap-1 rounded-lg border bg-card p-4">
      {PIPELINE_STAGES.map((label, i) => {
        const state = states[i] ?? "pending";
        return (
          <div
            key={label}
            className={cn(
              "flex items-center gap-3 rounded-[4px] px-2 py-1.5 text-sm transition-colors duration-150",
              state === "pending" && "text-dim",
              state === "done" && "text-muted-foreground",
              state === "running" && "text-foreground",
              state === "error" && "bg-tag text-foreground"
            )}
          >
            <span className="flex size-5 items-center justify-center">
              {state === "running" && (
                <Loader2 className="size-4 animate-spin text-foreground" strokeWidth={1.5} />
              )}
              {state === "done" && (
                <span className="flex size-4.5 items-center justify-center rounded-full bg-tag">
                  <Check className="size-3 text-foreground" strokeWidth={2} />
                </span>
              )}
              {state === "error" && (
                <AlertTriangle className="size-4 text-foreground" strokeWidth={1.5} />
              )}
              {state === "pending" && (
                <span className="size-1.5 rounded-full bg-dim/50" />
              )}
            </span>
            <span>{label}</span>
          </div>
        );
      })}
      {errorMessage && (
        <div className="mt-2 flex items-center justify-between gap-3 rounded-[4px] border border-border-strong bg-tag px-3 py-2 text-sm text-foreground">
          <span>{errorMessage}</span>
          {onRetry && (
            <Button
              size="sm"
              variant="outline"
              onClick={onRetry}
              className="shrink-0 rounded-[4px] border-foreground text-foreground"
            >
              Retry
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

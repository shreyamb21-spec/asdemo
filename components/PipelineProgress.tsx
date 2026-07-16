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
              "flex items-center gap-3 rounded-md px-2 py-1.5 text-sm transition-colors",
              state === "pending" && "text-muted-foreground/50",
              state === "error" && "bg-amber-50 text-amber-800"
            )}
          >
            <span className="flex size-5 items-center justify-center">
              {state === "running" && (
                <Loader2 className="size-4 animate-spin text-primary" />
              )}
              {state === "done" && <Check className="size-4 text-primary" />}
              {state === "error" && <AlertTriangle className="size-4 text-amber-600" />}
              {state === "pending" && (
                <span className="size-1.5 rounded-full bg-muted-foreground/30" />
              )}
            </span>
            <span>{label}</span>
          </div>
        );
      })}
      {errorMessage && (
        <div className="mt-2 flex items-center justify-between gap-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          <span>{errorMessage}</span>
          {onRetry && (
            <Button size="sm" variant="outline" onClick={onRetry} className="shrink-0">
              Retry
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Brief } from "@/lib/types";
import { computeRoi, formatUsd, formatUsdFull, ROI_ASSUMPTIONS } from "@/lib/roi";
import { EYEBROW } from "@/lib/theme";
import { cn } from "@/lib/utils";

// Log-ish steps for cost per respin, $10K-$500K
const COST_STEPS = [
  10000, 15000, 25000, 40000, 60000, 90000, 120000, 175000, 250000, 350000, 500000,
];

function nearestStepIndex(value: number): number {
  let best = 0;
  for (let i = 1; i < COST_STEPS.length; i++) {
    if (Math.abs(COST_STEPS[i] - value) < Math.abs(COST_STEPS[best] - value)) best = i;
  }
  return best;
}

/** Animates displayed number toward `target` with an ease-out count-up. */
function useCountUp(target: number, durationMs = 500): number {
  const [display, setDisplay] = useState(target);
  const fromRef = useRef(target);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const from = fromRef.current;
    if (from === target) return;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      const value = from + (target - from) * eased;
      setDisplay(value);
      fromRef.current = value;
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, durationMs]);

  return display;
}

function SliderRow({
  label,
  valueLabel,
  value,
  min,
  max,
  step = 1,
  onChange,
}: {
  label: string;
  valueLabel: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between text-sm">
        <span className="text-body">{label}</span>
        <span className="font-mono text-xs text-muted-foreground tabular-nums">
          {valueLabel}
        </span>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={([v]) => onChange(v)}
      />
    </div>
  );
}

export function RoiCalculator({ defaults }: { defaults: Brief["roiDefaults"] }) {
  const [respins, setRespins] = useState(defaults.respinsPerYear);
  const [costIdx, setCostIdx] = useState(nearestStepIndex(defaults.costPerRespin));
  const [reviewHours, setReviewHours] = useState(defaults.reviewHoursPerWeek);
  const [engineers, setEngineers] = useState(defaults.engineerCount);

  const costPerRespin = COST_STEPS[costIdx];
  const roi = computeRoi({
    respinsPerYear: respins,
    costPerRespin,
    reviewHoursPerWeek: reviewHours,
    engineerCount: engineers,
  });

  const savings = useCountUp(roi.annualSavings);

  return (
    <section>
      <h2 className={cn("mb-2", EYEBROW)}>ROI</h2>
      <div className="grid gap-8 rounded-lg border bg-alt p-6 md:grid-cols-2">
        <div className="flex flex-col gap-5">
          <SliderRow
            label="Respins per year"
            valueLabel={String(respins)}
            value={respins}
            min={0}
            max={12}
            onChange={setRespins}
          />
          <SliderRow
            label="Cost per respin"
            valueLabel={formatUsd(costPerRespin)}
            value={costIdx}
            min={0}
            max={COST_STEPS.length - 1}
            onChange={setCostIdx}
          />
          <SliderRow
            label="Review hours per week (per engineer)"
            valueLabel={`${reviewHours} hrs`}
            value={reviewHours}
            min={0}
            max={40}
            onChange={setReviewHours}
          />
          <SliderRow
            label="Engineers"
            valueLabel={String(engineers)}
            value={engineers}
            min={1}
            max={100}
            onChange={setEngineers}
          />
        </div>

        <div className="flex flex-col justify-center gap-1 md:pl-4">
          <span className={EYEBROW}>
            Estimated annual cost of the status quo
          </span>
          <span className="font-mono text-sm text-muted-foreground tabular-nums">
            {formatUsdFull(roi.statusQuoCost)}
          </span>
          <span className={cn("mt-4", EYEBROW)}>Estimated annual savings</span>
          <span className="font-display text-[56px] font-bold leading-none text-foreground tabular-nums">
            {formatUsdFull(savings)}
          </span>
          <p className="mt-3 text-xs leading-snug text-dim">{ROI_ASSUMPTIONS}</p>
        </div>
      </div>
    </section>
  );
}

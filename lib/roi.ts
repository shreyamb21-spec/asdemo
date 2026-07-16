export interface RoiInputs {
  respinsPerYear: number;
  costPerRespin: number;
  reviewHoursPerWeek: number;
  engineerCount: number;
}

export const LOADED_EE_RATE = 110; // $/hr loaded EE rate
export const WORK_WEEKS = 48;
export const RESPIN_REDUCTION = 0.5;  // assumes half of respins are review-escapable
export const REVIEW_TIME_FACTOR = 0.7; // 30% review time saved

export function computeRoi(i: RoiInputs) {
  const annualRespinCost = i.respinsPerYear * i.costPerRespin;
  const reviewCost = i.reviewHoursPerWeek * i.engineerCount * WORK_WEEKS * LOADED_EE_RATE;
  const statusQuoCost = annualRespinCost + reviewCost;
  const withAllSpice = annualRespinCost * RESPIN_REDUCTION + reviewCost * REVIEW_TIME_FACTOR;
  const annualSavings = statusQuoCost - withAllSpice;
  return { annualRespinCost, reviewCost, statusQuoCost, withAllSpice, annualSavings };
}

export const ROI_ASSUMPTIONS =
  "Demo assumptions, not AllSpice claims: assumes half of respins are review-escapable; 30% review time saved; $110/hr loaded EE rate; 48 work weeks.";

export function formatUsd(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1)}M`;
  if (n >= 1_000) return `$${Math.round(n / 1_000)}K`;
  return `$${Math.round(n)}`;
}

export function formatUsdFull(n: number): string {
  return `$${Math.round(n).toLocaleString("en-US")}`;
}

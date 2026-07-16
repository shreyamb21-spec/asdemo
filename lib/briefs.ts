import { Brief } from "./types";
import skydio from "@/data/briefs/skydio.json";
import butterflyNetwork from "@/data/briefs/butterfly-network.json";
import formlabs from "@/data/briefs/formlabs.json";

// Static imports: zero network at request time, cannot fail.
export const PREBAKED_BRIEFS: Brief[] = [
  skydio,
  butterflyNetwork,
  formlabs,
] as unknown as Brief[];

export function getBrief(slug: string): Brief | undefined {
  return PREBAKED_BRIEFS.find((b) => b.slug === slug);
}

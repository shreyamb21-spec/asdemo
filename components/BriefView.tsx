import { Brief } from "@/lib/types";
import { BriefHeader } from "./BriefHeader";
import { ToolchainChips } from "./ToolchainChips";
import { HypothesisCards } from "./HypothesisCards";
import { DiscoveryQuestions } from "./DiscoveryQuestions";
import { DemoStoryline } from "./DemoStoryline";
import { RoiCalculator } from "./RoiCalculator";
import { SourcesFooter } from "./SourcesFooter";

export function BriefView({ brief }: { brief: Brief }) {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8">
      <BriefHeader brief={brief} />
      <ToolchainChips toolchain={brief.toolchain} />
      <HypothesisCards hypotheses={brief.hypotheses} />
      <DiscoveryQuestions questions={brief.questions} />
      <DemoStoryline storyline={brief.storyline} />
      <RoiCalculator defaults={brief.roiDefaults} />
      <SourcesFooter sources={brief.sources} />
    </div>
  );
}

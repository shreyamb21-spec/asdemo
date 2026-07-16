import { Brief } from "@/lib/types";
import { EYEBROW } from "@/lib/theme";
import { cn } from "@/lib/utils";

export function DiscoveryQuestions({ questions }: { questions: Brief["questions"] }) {
  return (
    <section>
      <h2 className={cn("mb-2", EYEBROW)}>Discovery questions</h2>
      <ol className="overflow-hidden rounded-lg border bg-card">
        {questions.map((q, i) => (
          <li
            key={q.text}
            className="flex items-baseline gap-3 border-b px-4 py-2.5 text-sm last:border-b-0"
          >
            <span className="w-5 shrink-0 font-display text-base text-dim">
              {i + 1}
            </span>
            <span className="text-body">{q.text}</span>
            <span className="ml-auto shrink-0 self-center rounded-[4px] bg-tag px-1.5 py-0.5 font-mono text-[10px] text-foreground">
              H{q.hypothesisIndex + 1}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

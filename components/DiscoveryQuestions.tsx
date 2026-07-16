import { Brief } from "@/lib/types";
import { HYPOTHESIS_HUES } from "@/lib/hues";

export function DiscoveryQuestions({ questions }: { questions: Brief["questions"] }) {
  return (
    <section>
      <h2 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Discovery questions
      </h2>
      <ol className="overflow-hidden rounded-lg border bg-card">
        {questions.map((q, i) => {
          const hue = HYPOTHESIS_HUES[q.hypothesisIndex % 3];
          return (
            <li
              key={q.text}
              className="flex items-baseline gap-3 border-b px-4 py-2.5 text-sm last:border-b-0"
              style={{ borderLeft: `3px solid ${hue.border}` }}
            >
              <span className="w-4 shrink-0 text-xs font-medium text-muted-foreground">
                {i + 1}
              </span>
              <span>{q.text}</span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

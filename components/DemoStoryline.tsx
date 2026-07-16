import { Brief } from "@/lib/types";

export function DemoStoryline({ storyline }: { storyline: Brief["storyline"] }) {
  return (
    <section>
      <h2 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Demo storyline
      </h2>
      <div className="rounded-lg border bg-card px-6 py-5">
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
          <div className="absolute left-3.5 top-4 hidden h-[calc(100%-2rem)] w-px bg-border sm:left-0 sm:top-3.5 sm:block sm:h-px sm:w-full" />
          {storyline.map((s, i) => (
            <div
              key={s.step}
              className="relative flex flex-1 flex-row items-start gap-3 sm:flex-col sm:items-center sm:text-center"
            >
              <span className="z-10 flex size-7 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-card text-xs font-semibold text-primary">
                {i + 1}
              </span>
              <div className="flex flex-col gap-1.5 sm:items-center">
                <span className="text-sm font-medium leading-snug">{s.step}</span>
                <span className="w-fit rounded-full bg-accent px-2 py-0.5 text-xs text-accent-foreground">
                  {s.capability}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

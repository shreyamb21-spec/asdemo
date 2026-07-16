"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CompanyCard } from "@/components/CompanyCard";
import { PipelineProgress, StageState } from "@/components/PipelineProgress";
import { PREBAKED_BRIEFS } from "@/lib/briefs";
import { loadCachedBriefs, saveCachedBrief } from "@/lib/liveCache";
import { Brief, StageEvent } from "@/lib/types";

const IDLE_STATES: StageState[] = ["pending", "pending", "pending", "pending", "pending"];

export default function LandingPage() {
  const router = useRouter();
  const [domain, setDomain] = useState("");
  const [pasted, setPasted] = useState("");
  const [pasteOpen, setPasteOpen] = useState(false);
  const [running, setRunning] = useState(false);
  const [states, setStates] = useState<StageState[]>(IDLE_STATES);
  const [error, setError] = useState<string | undefined>();
  const [cached, setCached] = useState<Brief[]>([]);

  useEffect(() => {
    setCached(loadCachedBriefs());
  }, []);

  async function generate() {
    if (!domain.trim() && !pasted.trim()) return;
    setRunning(true);
    setError(undefined);
    setStates(IDLE_STATES);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain: domain.trim(),
          pastedJobPosting: pasted.trim() || undefined,
        }),
      });

      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "The pipeline couldn't start. Hit retry.");
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      const apply = (event: StageEvent) => {
        setStates((prev) => {
          const next = [...prev];
          const idx = event.stage - 1;
          if (idx >= 0 && idx < 5) {
            next[idx] = event.status;
          }
          return next;
        });
        if (event.status === "error") {
          setError(
            event.message ?? "Something went wrong. Retry, or paste a job posting."
          );
          if (event.message && /paste a job posting/i.test(event.message)) {
            setPasteOpen(true);
          }
        }
        if (event.brief) {
          const saved = saveCachedBrief(event.brief);
          sessionStorage.setItem("liveBrief", JSON.stringify(saved));
          router.push(`/brief/live?slug=${saved.slug}`);
        }
      };

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            apply(JSON.parse(line) as StageEvent);
          } catch {
            /* skip malformed line */
          }
        }
      }
      if (buffer.trim()) {
        try {
          apply(JSON.parse(buffer) as StageEvent);
        } catch {
          /* ignore trailing garbage */
        }
      }
    } catch {
      setError("Network error mid-run. Hit retry.");
    } finally {
      setRunning(false);
    }
  }

  const showPipeline = running || error !== undefined;

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 py-16">
      <div className="text-center">
        <h1 className="text-3xl font-semibold tracking-tight">Discovery Copilot</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Pre-call briefs for AllSpice SEs. Grounded in public sources.
        </p>
      </div>

      <div className="mx-auto mt-8 w-full max-w-xl">
        {showPipeline ? (
          <PipelineProgress
            states={states}
            errorMessage={running ? undefined : error}
            onRetry={() => generate()}
          />
        ) : (
          <div className="flex gap-2">
            <Input
              placeholder="Company domain, e.g. skydio.com"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && generate()}
            />
            <Button onClick={generate} disabled={!domain.trim() && !pasted.trim()}>
              Generate brief
            </Button>
          </div>
        )}
        {!running && (
          <div className="mt-3">
            {pasteOpen ? (
              <Textarea
                placeholder="Paste a job posting here — used alongside (or instead of) the domain fetch."
                value={pasted}
                onChange={(e) => setPasted(e.target.value)}
                rows={6}
              />
            ) : (
              <button
                type="button"
                onClick={() => setPasteOpen(true)}
                className="cursor-pointer text-sm text-muted-foreground underline-offset-4 hover:underline"
              >
                or paste a job posting
              </button>
            )}
          </div>
        )}
      </div>

      <div className="mt-14 grid gap-4 sm:grid-cols-3">
        {PREBAKED_BRIEFS.map((brief) => (
          <CompanyCard key={brief.slug} brief={brief} />
        ))}
      </div>

      {cached.length > 0 && (
        <>
          <h2 className="mt-10 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Your live briefs
          </h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-3">
            {cached.map((brief) => (
              <CompanyCard
                key={brief.slug}
                brief={brief}
                href={`/brief/live?slug=${brief.slug}`}
              />
            ))}
          </div>
        </>
      )}

      <footer className="mt-auto pt-16 text-center text-xs text-muted-foreground">
        Built by Shreyam Borah. Every claim links to its source.
      </footer>
    </main>
  );
}

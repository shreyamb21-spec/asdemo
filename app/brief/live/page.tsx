"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { BriefView } from "@/components/BriefView";
import { Button } from "@/components/ui/button";
import { getCachedBrief } from "@/lib/liveCache";
import { Brief } from "@/lib/types";

function LiveBrief() {
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug");
  const [brief, setBrief] = useState<Brief | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      if (slug) {
        setBrief(getCachedBrief(slug) ?? null);
      } else {
        const raw = sessionStorage.getItem("liveBrief");
        if (raw) setBrief(JSON.parse(raw) as Brief);
      }
    } catch {
      /* corrupt state — treat as missing */
    }
    setLoaded(true);
  }, [slug]);

  if (!loaded) return null;

  if (!brief) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-24 text-center">
        <p className="text-sm text-muted-foreground">
          No live brief found here. Generate one from the landing page.
        </p>
        <Button asChild variant="outline">
          <Link href="/">Go to Discovery Copilot</Link>
        </Button>
      </main>
    );
  }

  return (
    <main className="flex-1">
      <div className="mx-auto w-full max-w-5xl px-4 pt-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          All briefs
        </Link>
      </div>
      <BriefView brief={brief} />
    </main>
  );
}

export default function LiveBriefPage() {
  return (
    <Suspense fallback={null}>
      <LiveBrief />
    </Suspense>
  );
}

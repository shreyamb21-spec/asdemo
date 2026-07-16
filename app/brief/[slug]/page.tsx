import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BriefView } from "@/components/BriefView";
import { PREBAKED_BRIEFS, getBrief } from "@/lib/briefs";

export function generateStaticParams() {
  return PREBAKED_BRIEFS.map((b) => ({ slug: b.slug }));
}

export const dynamicParams = false;

export default async function BriefPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const brief = getBrief(slug);
  if (!brief) notFound();

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

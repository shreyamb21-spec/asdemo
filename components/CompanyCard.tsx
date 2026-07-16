import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brief } from "@/lib/types";

export function CompanyCard({ brief, href }: { brief: Brief; href?: string }) {
  const blurb = brief.icpBlurb || brief.snapshot.join(" ");
  return (
    <Card className="flex flex-col justify-between gap-4 p-5 transition-colors duration-150 hover:bg-card-hover hover:ring-border-strong">
      <CardContent className="flex flex-col gap-3 p-0">
        <div className="flex items-center justify-between gap-2">
          <span className="font-display text-base font-semibold">
            {brief.companyName}
          </span>
          <span className="shrink-0 rounded-[4px] bg-tag px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em] text-foreground">
            {brief.vertical}
          </span>
        </div>
        <p className="text-sm leading-snug text-body">{blurb}</p>
      </CardContent>
      <Button
        asChild
        variant="outline"
        size="sm"
        className="w-fit rounded-[4px] border-foreground text-foreground"
      >
        <Link href={href ?? `/brief/${brief.slug}`}>View brief</Link>
      </Button>
    </Card>
  );
}

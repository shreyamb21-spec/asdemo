import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brief } from "@/lib/types";

export function CompanyCard({ brief, href }: { brief: Brief; href?: string }) {
  const blurb = brief.icpBlurb || brief.snapshot.join(" ");
  return (
    <Card className="flex flex-col justify-between gap-4 p-5 transition-shadow hover:shadow-sm">
      <CardContent className="flex flex-col gap-3 p-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-base font-semibold">{brief.companyName}</span>
          <Badge variant="secondary" className="shrink-0">
            {brief.vertical}
          </Badge>
        </div>
        <p className="text-sm leading-snug text-muted-foreground">{blurb}</p>
      </CardContent>
      <Button asChild variant="outline" size="sm" className="w-fit">
        <Link href={href ?? `/brief/${brief.slug}`}>View brief</Link>
      </Button>
    </Card>
  );
}

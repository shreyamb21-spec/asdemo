"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ExternalLink } from "lucide-react";

export function SourcesFooter({ sources }: { sources: string[] }) {
  return (
    <section className="rounded-lg border bg-card px-4">
      <Accordion type="single" collapsible>
        <AccordionItem value="sources" className="border-b-0">
          <AccordionTrigger className="py-3 text-sm text-muted-foreground hover:no-underline">
            Sources ({sources.length})
          </AccordionTrigger>
          <AccordionContent>
            <ul className="space-y-1.5 pb-2">
              {sources.map((url) => (
                <li key={url}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                  >
                    <ExternalLink className="size-3 shrink-0" />
                    {url}
                  </a>
                </li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </section>
  );
}

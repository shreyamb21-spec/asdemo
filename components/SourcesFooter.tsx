"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function SourcesFooter({ sources }: { sources: string[] }) {
  return (
    <section className="rounded-lg border bg-card px-4">
      <Accordion type="single" collapsible>
        <AccordionItem value="sources" className="border-b-0">
          <AccordionTrigger className="py-3 font-mono text-xs uppercase tracking-[0.08em] text-muted-foreground hover:no-underline">
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
                    className="break-all text-[13px] text-foreground underline underline-offset-2"
                  >
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

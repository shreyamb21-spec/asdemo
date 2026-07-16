import { runPipeline } from "@/lib/pipeline";

export const dynamic = "force-dynamic";
export const maxDuration = 90;

const PIPELINE_TIMEOUT_MS = 60_000;
const RATE_LIMIT = 5; // requests per window per IP
const RATE_WINDOW_MS = 60_000;

const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  if (recent.length >= RATE_LIMIT) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  return false;
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (rateLimited(ip)) {
    return Response.json(
      { error: "Rate limited. Try again in a minute." },
      { status: 429 }
    );
  }

  let body: { domain?: string; pastedJobPosting?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const domain = body.domain?.trim();
  if (!domain && !body.pastedJobPosting?.trim()) {
    return Response.json(
      { error: "Provide a domain or a pasted job posting" },
      { status: 400 }
    );
  }

  const encoder = new TextEncoder();
  const abort = new AbortController();
  const timeout = setTimeout(() => abort.abort(), PIPELINE_TIMEOUT_MS);

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (obj: unknown) =>
        controller.enqueue(encoder.encode(JSON.stringify(obj) + "\n"));
      try {
        for await (const event of runPipeline(
          domain ?? "",
          body.pastedJobPosting,
          abort.signal
        )) {
          send(event);
          if (event.status === "error") break;
        }
      } catch (err) {
        const timedOut = abort.signal.aborted;
        send({
          stage: 0,
          status: "error",
          message: timedOut
            ? "The pipeline hit the 60-second limit. Retry, or paste a job posting for a faster run."
            : "Something went wrong mid-pipeline. Hit retry.",
        });
      } finally {
        clearTimeout(timeout);
        controller.close();
      }
    },
    cancel() {
      clearTimeout(timeout);
      abort.abort();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}

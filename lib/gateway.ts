// Server-side only. Calls the Merge Gateway (OpenAI Responses-shaped API).

const RETRY_SUFFIX = "Return ONLY valid JSON, no other text.";

interface GatewayResponse {
  output: {
    type: string;
    role?: string;
    content?: { type: string; text?: string }[];
  }[];
}

async function callGateway(prompt: string, signal?: AbortSignal): Promise<string> {
  const baseUrl = process.env.MERGE_GATEWAY_BASE_URL;
  const apiKey = process.env.MERGE_GATEWAY_API_KEY;
  const model = process.env.MERGE_GATEWAY_MODEL;
  if (!baseUrl || !apiKey || !model) {
    throw new Error("Merge Gateway env vars are not configured");
  }

  const res = await fetch(baseUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      // Spec asks for temperature 0.3, but claude-sonnet-5 on this gateway
      // rejects the temperature param as deprecated, so it is omitted.
      model,
      stream: false,
      input: [{ type: "message", role: "user", content: prompt }],
    }),
    signal: signal ?? null,
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Gateway returned ${res.status}: ${body.slice(0, 300)}`);
  }

  const data = (await res.json()) as GatewayResponse;
  const text = data.output
    ?.filter((o) => o.type === "message")
    .flatMap((o) => o.content ?? [])
    .map((c) => c.text ?? "")
    .join("");
  if (!text) throw new Error("Gateway response contained no text");
  return text;
}

function stripFences(text: string): string {
  return text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();
}

/** Call the LLM expecting JSON. Retries once with a "JSON only" nudge on parse failure. */
export async function callLLMJson<T>(prompt: string, signal?: AbortSignal): Promise<T> {
  let raw = await callGateway(prompt, signal);
  try {
    return JSON.parse(stripFences(raw)) as T;
  } catch {
    raw = await callGateway(`${prompt}\n\n${RETRY_SUFFIX}`, signal);
    return JSON.parse(stripFences(raw)) as T; // second failure throws to caller
  }
}

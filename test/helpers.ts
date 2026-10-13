import { Metamob, type MetamobOptions } from "../src/index.js";

export interface Call {
  url: URL;
  /** Path under the API root, for example `/monsters/20`. */
  path: string;
  method: string;
  headers: Headers;
  /** Parsed JSON body, or undefined. */
  body: unknown;
  init: RequestInit;
}

type Answer = Response | Record<string, unknown>;
type Responder = Answer | ((call: Call) => Answer | Promise<Answer>);

export function json(body: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(body === undefined ? null : JSON.stringify(body), { status, headers: { "content-type": "application/json", ...headers } });
}

/** An error the way the API writes most of them. */
export function apiError(status: number, message: string, headers: Record<string, string> = {}): Response {
  return json({ status, error: status, messages: { error: message } }, status, headers);
}

/**
 * A fake `fetch`. With one responder it answers every call; with several,
 * they are used in order and the last one repeats.
 */
export function mockFetch(...responders: Responder[]): { fetch: typeof fetch; calls: Call[] } {
  const calls: Call[] = [];
  const fetchImpl = (async (input: string | URL | Request, init: RequestInit = {}) => {
    if (init.signal?.aborted) throw init.signal.reason ?? new DOMException("Aborted", "AbortError");
    const url = new URL(String(input));
    const call: Call = {
      url,
      path: url.pathname.replace(/^\/api\/v1/, ""),
      method: init.method ?? "GET",
      headers: new Headers(init.headers),
      body: typeof init.body === "string" ? JSON.parse(init.body) : undefined,
      init,
    };
    calls.push(call);
    const responder = responders[Math.min(calls.length - 1, responders.length - 1)];
    const result = typeof responder === "function" ? await responder(call) : responder;
    // A fixed Response may be served several times: hand out copies.
    if (result instanceof Response) return result.clone();
    return json(result ?? {});
  }) as typeof fetch;
  return { fetch: fetchImpl, calls };
}

/** A client wired to a fake fetch: no rate limiter, retries made instant. */
export function client(responders: Responder[] | Responder = { data: [] }, options: MetamobOptions = {}): { metamob: Metamob; calls: Call[] } {
  const { fetch, calls } = mockFetch(...(Array.isArray(responders) ? responders : [responders]));
  const metamob = new Metamob({ apiKey: "test-key", rateLimit: false, retry: { delay: 1, maxDelay: 5 }, ...options, fetch });
  return { metamob, calls };
}

/** A body of the offset-paginated lists. */
export const page = (data: unknown[], total = data.length, offset = 0, limit = 50) => ({ data, pagination: { total, limit, offset } });

/** `count` monsters, ids starting at `from`. */
export const monsters = (count: number, from = 1) =>
  Array.from({ length: count }, (_, index) => ({ id: from + index, name: { fr: `Monstre ${from + index}`, en: `Monster ${from + index}`, es: `Monstruo ${from + index}` }, image: "m.png", level_min: 1, level_max: 2, type: { id: 1, name: { fr: "monstre", en: "monster", es: "monstruo" } } }));

import { MetamobArgumentError } from "../core/errors.js";
import type { Context } from "../core/resource.js";
import type { RequestOptions } from "../core/rest.js";
import type { ServerLike } from "../data/dataset.js";
import { METHODS } from "../generated/methods.js";
import type { KraloveEvent, KraloveEventDetail } from "../types.js";

/** Filters of {@link Kralove.list}. */
export interface KraloveListParams {
  /** Only the events of this server. */
  server?: ServerLike | undefined;
  /**
   * First day to list, as `YYYY-MM-DD` or a `Date` (read in UTC). Default:
   * today, so past events are left out.
   */
  from?: string | Date | undefined;
}

function day(value: string | Date): string {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) throw new MetamobArgumentError("`from` is an invalid Date.");
    return value.toISOString().slice(0, 10);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new MetamobArgumentError("`from` must be a Date or a string like \"2026-01-27\".");
  return value;
}

/** Ids are numbers everywhere in the library, also where the API writes them as strings. */
function numericId<T extends { id: unknown }>(event: T): T {
  if (typeof event.id === "string" && /^\d+$/.test(event.id)) event.id = Number(event.id);
  return event;
}

/** The Kralamoure events: meetings players organise to fight the Kralove. */
export class Kralove {
  readonly #context: Context;

  /** @internal */
  constructor(context: Context) {
    this.#context = context;
  }

  /**
   * The Kralamoure events from today on, or from another date, optionally for
   * one server.
   *
   * `creator` can be `null`: the account was deleted for good, or you and
   * that user blocked each other.
   *
   * @example
   * const events = await metamob.kralove.list({ server: "Draconiros" });
   * const since = await metamob.kralove.list({ from: "2026-01-01" });
   */
  async list(params: KraloveListParams = {}, options?: RequestOptions): Promise<KraloveEvent[]> {
    const query = {
      server: params.server === undefined ? undefined : await this.#context.resolve.server(params.server, options),
      from: params.from === undefined ? undefined : day(params.from),
    };
    const body = await this.#context.rest.request<{ data: KraloveEvent[] }>(METHODS["kralove.list"], { query }, options);
    return body.data.map(numericId);
  }

  /**
   * One Kralamoure event with its participants and its messages.
   *
   * @example
   * const event = await metamob.kralove.get(42);
   * event.participants.length, event.messages.length;
   */
  async get(id: number | string | { readonly id: number }, options?: RequestOptions): Promise<KraloveEventDetail> {
    const value = typeof id === "object" && id !== null ? id.id : id;
    if ((typeof value !== "number" && typeof value !== "string") || !/^\d+$/.test(String(value))) throw new MetamobArgumentError("`id` must be the id of a Kralamoure event.");
    const body = await this.#context.rest.request<{ data: KraloveEventDetail }>(METHODS["kralove.get"], { path: { id: value } }, options);
    return numericId(body.data);
  }
}

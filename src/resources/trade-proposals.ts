import { MetamobArgumentError } from "../core/errors.js";
import { ListRequest, topLevel } from "../core/pagination.js";
import { type Context, text } from "../core/resource.js";
import type { RequestOptions } from "../core/rest.js";
import { METHODS } from "../generated/methods.js";
import type { TradeProposal, TradeProposalDetail } from "../types.js";

/** Filters of {@link TradeProposals.list}. */
export interface TradeProposalListParams {
  /** `received`: made to you. `sent`: made by you. `all` (default): both. */
  direction?: "received" | "sent" | "all" | undefined;
  /** Only the proposals in this state. */
  status?: "pending" | "half_applied" | "completed" | "cancelled" | undefined;
  /** Only the proposals about this quest of yours, by its slug. */
  quest?: string | undefined;
  /**
   * Only the proposals created from this moment on, included: a `Date`, or an
   * ISO 8601 date with its time zone such as `"2026-01-27T14:00:00Z"`.
   */
  since?: Date | string | undefined;
  /** Items per page. Default 30, at most 50. */
  limit?: number | undefined;
  /** Start from older proposals: the `nextBeforeId` of a page you already have. */
  beforeId?: number | undefined;
}

/** An ISO 8601 date and time with a time zone, which is what the API reads. */
const ISO_DATE_TIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,9})?)?(?:Z|[+-]\d{2}:\d{2})$/;

function since(value: Date | string): string {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) throw new MetamobArgumentError("`since` is an invalid Date.");
    return value.toISOString();
  }
  if (typeof value !== "string" || !ISO_DATE_TIME.test(value) || Number.isNaN(Date.parse(value))) {
    throw new MetamobArgumentError('`since` must be a Date or an ISO 8601 date with its time zone, such as "2026-01-27T14:00:00Z".');
  }
  return value;
}

/** A proposal id: a number, its digits, or the proposal itself. */
function proposalId(value: number | string | { readonly id: number }): number {
  const id = typeof value === "object" && value !== null ? value.id : typeof value === "string" && /^\d+$/.test(value.trim()) ? Number(value) : value;
  if (typeof id !== "number" || !Number.isInteger(id) || id <= 0) throw new MetamobArgumentError("Expected a trade proposal: its id, or the proposal itself.");
  return id;
}

/**
 * The trade proposals of the account: the ones you sent and the ones you
 * received, on every quest. Making, confirming or cancelling a proposal is
 * done on the site.
 */
export class TradeProposals {
  readonly #context: Context;

  /** @internal */
  constructor(context: Context) {
    this.#context = context;
  }

  /**
   * The trade proposals you sent and received, most recent first. Await it
   * for one page, or iterate it to walk back in time.
   *
   * Asked every few minutes with `since`, it tells you about new proposals
   * soon after they are made.
   *
   * @example
   * // What is waiting for an answer from you.
   * const waiting = await metamob.tradeProposals.list({ direction: "received", status: "pending" }).all();
   *
   * // What arrived since the last check.
   * const fresh = await metamob.tradeProposals.list({ direction: "received", since: lastCheck }).all();
   */
  list(params: TradeProposalListParams = {}, options?: RequestOptions): ListRequest<TradeProposal> {
    return new ListRequest(
      this.#context.rest,
      METHODS["tradeProposals.list"],
      async () => ({
        query: {
          direction: params.direction,
          status: params.status,
          quest: params.quest === undefined ? undefined : text(params.quest, "quest"),
          since: params.since === undefined ? undefined : since(params.since),
          limit: params.limit,
          before_id: params.beforeId,
        },
      }),
      options,
      topLevel<TradeProposal>,
    );
  }

  /**
   * One trade proposal. Each monster comes with `owned`: how many of it you
   * own now in the quest the proposal is about, so what you will have after
   * the trade is one addition away.
   *
   * @example
   * const proposal = await metamob.tradeProposals.get(57);
   * const mine = proposal.recipient === me.username;
   * for (const monster of mine ? proposal.monsters_given : proposal.monsters_received) {
   *   console.log(monster.monster_id, `${monster.owned ?? 0} owned, ${monster.quantity} coming`);
   * }
   */
  async get(id: number | string | { readonly id: number }, options?: RequestOptions): Promise<TradeProposalDetail> {
    const path = { id: proposalId(id) };
    return (await this.#context.rest.request<{ data: TradeProposalDetail }>(METHODS["tradeProposals.get"], { path }, options)).data;
  }
}

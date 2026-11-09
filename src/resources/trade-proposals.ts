import { MetamobArgumentError } from "../core/errors.js";
import { ListRequest, topLevel } from "../core/pagination.js";
import { type Context, text } from "../core/resource.js";
import type { RequestOptions } from "../core/rest.js";
import { METHODS } from "../generated/methods.js";
import type { ProposalMonster, ProposalViewer, TradeProposal, TradeProposalDetail } from "../types.js";
import { entries, type MonsterQuantities, type Quests } from "./quests.js";

/** What {@link TradeProposals.create} sends. */
export interface NewTradeProposal {
  /** Username of the player the proposal is made to. */
  recipient: string;
  /** Slug of your quest the trade is about. */
  sender_quest: string;
  /** Slug of the recipient's quest, of the same kind as yours and on the same server. `quests.matches()` gives it. */
  recipient_quest: string;
  /** What you give, in the shapes `quests.setMonsters()` takes. */
  monsters_given?: MonsterQuantities | undefined;
  /** What you receive, in the same shapes. */
  monsters_received?: MonsterQuantities | undefined;
}

const PROPOSAL_MONSTERS = 200;
const MAX_QUANTITY = 99;

/** Options of {@link TradeProposals.apply}. */
export interface ApplyProposalOptions {
  /**
   * `false` (default): when you own fewer copies of a monster than you give,
   * nothing is applied and the API answers `CONFLICT`. `true`: applied anyway,
   * with each quantity reduced to what you own.
   */
  allowPartial?: boolean | undefined;
}

/** Filters of {@link TradeProposals.list}. */
export interface TradeProposalListParams {
  /** `received`: made to you. `sent`: made by you. `all` (default): both. */
  direction?: "received" | "sent" | "all" | undefined;
  /** Only the proposals in this state. */
  status?: "pending" | "half_applied" | "completed" | "cancelled" | undefined;
  /** Only the proposals about this quest of yours, by its slug. */
  quest?: string | undefined;
  /** Only the proposals created from this moment on: a `Date`, or an ISO 8601 date with its time zone. */
  since?: Date | string | undefined;
  /** Items per page. Default 30, at most 50. */
  limit?: number | undefined;
  /** Start from older proposals: the `nextBeforeId` of a page you already have. */
  beforeId?: number | undefined;
}

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

type Single = { data: TradeProposal; viewer: ProposalViewer };

/** A proposal and your side of it, as one object. */
function detail(answer: Single): TradeProposalDetail {
  return { ...answer.data, viewer: answer.viewer };
}

function proposalId(value: number | string | { readonly id: number }): number {
  const id = typeof value === "object" && value !== null ? value.id : typeof value === "string" && /^\d+$/.test(value.trim()) ? Number(value) : value;
  if (typeof id !== "number" || !Number.isInteger(id) || id <= 0) throw new MetamobArgumentError("Expected a trade proposal: its id, or the proposal itself.");
  return id;
}

/**
 * The trade proposals of the account: the ones you sent and the ones you
 * received, on every quest. Send one, apply your side, or cancel it.
 */
export class TradeProposals {
  readonly #context: Context;
  readonly #quests: Quests;

  /** @internal */
  constructor(context: Context, quests: Quests) {
    this.#context = context;
    this.#quests = quests;
  }

  /**
   * The trade proposals you sent and received, most recent first. Await it
   * for one page, or iterate it to walk back in time.
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
   * One trade proposal, with `viewer`: your side of it. `viewer.removed` is
   * what leaves your quest and `viewer.added` what enters it, each monster
   * with what you own of it now.
   *
   * @example
   * const proposal = await metamob.tradeProposals.get(57);
   * for (const monster of proposal.viewer.added) {
   *   console.log(monster.monster_id, `${monster.owned ?? 0} owned, ${monster.quantity} coming`);
   * }
   */
  async get(id: number | string | { readonly id: number }, options?: RequestOptions): Promise<TradeProposalDetail> {
    const path = { id: proposalId(id) };
    return detail(await this.#context.rest.request<Single>(METHODS["tradeProposals.get"], { path }, options));
  }

  /**
   * Applies your side of a proposal to your quest: what you give leaves it,
   * what you receive enters it. Works for the sender and for the recipient.
   * The proposal is `completed` once both sides are applied.
   *
   * When you own fewer copies than you give, the API answers `CONFLICT` and
   * nothing changes, unless `allowPartial` is `true`: then each quantity is
   * reduced to what you own, `viewer.clamped` is `true`, and
   * `applied_quantity` says what really moved. Applying twice, or a cancelled
   * proposal, is a `CONFLICT` too. Never retried.
   *
   * @example
   * const proposal = await metamob.tradeProposals.apply(57);
   * proposal.status; // "half_applied", or "completed" when the other side was applied too
   */
  async apply(id: number | string | { readonly id: number }, options: ApplyProposalOptions = {}, requestOptions?: RequestOptions): Promise<TradeProposalDetail> {
    const path = { id: proposalId(id) };
    const allowPartial = options.allowPartial ?? false;
    if (typeof allowPartial !== "boolean") throw new MetamobArgumentError("`allowPartial` must be true or false.");
    return detail(await this.#context.rest.request<Single>(METHODS["tradeProposals.apply"], { path, body: { allow_partial: allowPartial } }, requestOptions));
  }

  /**
   * Cancels a proposal you sent, or declines one you received, as long as you
   * have not applied your side, even when the other player applied theirs.
   * A proposal already cancelled, or already applied by you, is a `CONFLICT`.
   * Never retried.
   *
   * @example
   * await metamob.tradeProposals.cancel(57);
   */
  async cancel(id: number | string | { readonly id: number }, options?: RequestOptions): Promise<TradeProposalDetail> {
    const path = { id: proposalId(id) };
    return detail(await this.#context.rest.request<Single>(METHODS["tradeProposals.cancel"], { path }, options));
  }

  /**
   * Proposes a trade to a player from one of your quests, and answers the
   * proposal with your side of it, like `get()`. Monsters are an id, a name or
   * a monster.
   *
   * Sending is closed by default: Metamob opens it account by account, on
   * request. Without it, or when one player blocked the other, the API answers
   * `FORBIDDEN`. Quests of different kinds or servers, a monster not in the
   * quest, more copies than you own, or a quantity out of bounds give
   * `BAD_REQUEST`. A proposal is never
   * retried: after a timeout or a network failure, check `list()` before
   * proposing again.
   *
   * @example
   * // The partner and its quest, as matches() finds them.
   * const best = await metamob.quests.matches("21b0a742").first();
   * if (best) {
   *   await metamob.tradeProposals.create({
   *     recipient: best.user.username,
   *     sender_quest: "21b0a742",
   *     recipient_quest: best.quest.slug,
   *     monsters_given: { "Tofu Maléfique": 1 },
   *     monsters_received: { "Bouftou Royal": 1 },
   *   });
   * }
   */
  async create(proposal: NewTradeProposal, options?: RequestOptions): Promise<TradeProposalDetail> {
    if (!proposal || typeof proposal !== "object") throw new MetamobArgumentError("`proposal` must be an object with `recipient`, `sender_quest`, `recipient_quest` and monsters.");
    const quest = text(proposal.sender_quest, "sender_quest");
    const body = {
      recipient: text(proposal.recipient, "recipient"),
      sender_quest: quest,
      recipient_quest: text(proposal.recipient_quest, "recipient_quest"),
      monsters_given: await this.#monsters(quest, proposal.monsters_given, "monsters_given", options),
      monsters_received: await this.#monsters(quest, proposal.monsters_received, "monsters_received", options),
    };
    if (!body.monsters_given.length && !body.monsters_received.length) throw new MetamobArgumentError("A proposal needs at least one monster, given or received.");
    return detail(await this.#context.rest.request<Single>(METHODS["tradeProposals.create"], { body }, options));
  }

  async #monsters(quest: string, quantities: MonsterQuantities | undefined, name: string, options: RequestOptions | undefined): Promise<ProposalMonster[]> {
    if (quantities === undefined) return [];
    const list = entries(quantities);
    if (list.length > PROPOSAL_MONSTERS) throw new MetamobArgumentError(`\`${name}\` has ${list.length} monsters: a proposal takes ${PROPOSAL_MONSTERS} at most on each side.`);
    for (const [, quantity] of list) {
      if (typeof quantity !== "number" || !Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) throw new MetamobArgumentError(`Each quantity of \`${name}\` must be a whole number from 1 to ${MAX_QUANTITY}.`);
    }
    const ids = await Promise.all(list.map(([monster]) => this.#quests.monsterIn(quest, monster, options)));
    const seen = new Set<number>();
    for (const id of ids) {
      if (seen.has(id)) throw new MetamobArgumentError(`\`${name}\` names the monster ${id} twice: give it once, with the total quantity.`);
      seen.add(id);
    }
    return ids.map((monster_id, index) => ({ monster_id, quantity: list[index]![1] }));
  }
}

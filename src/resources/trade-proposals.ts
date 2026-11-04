import { MetamobArgumentError } from "../core/errors.js";
import { ListRequest, topLevel } from "../core/pagination.js";
import { type Context, text } from "../core/resource.js";
import type { RequestOptions } from "../core/rest.js";
import { METHODS } from "../generated/methods.js";
import type { ProposalMonster, TradeProposal, TradeProposalDetail } from "../types.js";
import { entries, type MonsterQuantities, type Quests } from "./quests.js";

/** What {@link TradeProposals.create} sends: the same names the API reads back. */
export interface NewTradeProposal {
  /** Username of the player the proposal is made to. */
  recipient: string;
  /** Slug of your quest the trade is about. */
  sender_quest: string;
  /** Slug of the recipient's quest, of the same kind as yours and on the same server, as `quests.matches()` gives it. */
  recipient_quest?: string | null | undefined;
  /**
   * What you give, in the shapes `quests.setMonsters()` takes: a list of
   * `{ monster, quantity }`, an object keyed by monster name, or a `Map`.
   */
  monsters_given?: MonsterQuantities | undefined;
  /** What you receive, in the same shapes. */
  monsters_received?: MonsterQuantities | undefined;
}

/** Most monsters in one list of a proposal. */
const PROPOSAL_MONSTERS = 200;

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
 * received, on every quest, and new ones to send. Confirming or cancelling a
 * proposal is done on the site.
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

  /**
   * Proposes a trade to a player, from one of your quests, and answers the
   * proposal as `list()` shows it. Monsters are named like everywhere else:
   * an id, a name in any language, or a monster.
   *
   * The rules are the ones of the site. Sending is closed by default: Metamob
   * opens it account by account, on request, and the API answers `FORBIDDEN`
   * without it, or when one of the two players blocked the other. Past the
   * anti-spam limits, it answers `RATE_LIMITED`. A monster that is not in the
   * quest, or a quantity out of bounds, is a `BAD_REQUEST`.
   *
   * A proposal is never retried, whatever the failure: sent twice, it would
   * exist twice. After a timeout or a network failure, look at `list()` before
   * proposing again.
   *
   * @example
   * await metamob.tradeProposals.create({
   *   recipient: "Ix-xs",
   *   sender_quest: "21b0a742",
   *   monsters_given: { "Tofu Maléfique": 1 },
   *   monsters_received: { "Bouftou Royal": 1 },
   * });
   */
  async create(proposal: NewTradeProposal, options?: RequestOptions): Promise<TradeProposal> {
    if (!proposal || typeof proposal !== "object") throw new MetamobArgumentError("`proposal` must be an object with `recipient`, `sender_quest` and monsters.");
    const quest = text(proposal.sender_quest, "sender_quest");
    const recipient = text(proposal.recipient, "recipient");
    // Left out rather than sent as null when it is not known.
    const theirs = proposal.recipient_quest === undefined || proposal.recipient_quest === null ? {} : { recipient_quest: text(proposal.recipient_quest, "recipient_quest") };
    const body = {
      recipient,
      sender_quest: quest,
      ...theirs,
      monsters_given: await this.#monsters(quest, proposal.monsters_given, "monsters_given", options),
      monsters_received: await this.#monsters(quest, proposal.monsters_received, "monsters_received", options),
    };
    if (!body.monsters_given.length && !body.monsters_received.length) throw new MetamobArgumentError("A proposal needs at least one monster, given or received.");
    return (await this.#context.rest.request<{ data: TradeProposal }>(METHODS["tradeProposals.create"], { body }, options)).data;
  }

  /** One side of a proposal, as the API takes it. A monster named twice is refused rather than guessed. */
  async #monsters(quest: string, quantities: MonsterQuantities | undefined, name: string, options: RequestOptions | undefined): Promise<ProposalMonster[]> {
    if (quantities === undefined) return [];
    const list = entries(quantities);
    if (list.length > PROPOSAL_MONSTERS) throw new MetamobArgumentError(`\`${name}\` has ${list.length} monsters: a proposal takes ${PROPOSAL_MONSTERS} at most on each side.`);
    for (const [, quantity] of list) {
      if (typeof quantity !== "number" || !Number.isInteger(quantity) || quantity < 1) throw new MetamobArgumentError(`Each quantity of \`${name}\` must be a whole number, 1 or more.`);
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

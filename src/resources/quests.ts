import { MetamobArgumentError } from "../core/errors.js";
import { ListRequest, type RawPagination, topLevel } from "../core/pagination.js";
import { type Context, count, type PageParams, text } from "../core/resource.js";
import type { RequestOptions } from "../core/rest.js";
import type { MonsterLike, MonsterTypeLike, SubzoneLike, ZoneLike } from "../data/dataset.js";
import { METHODS } from "../generated/methods.js";
import type {
  MonsterQuantityResult,
  MonstersUpdateResult,
  OwnQuest,
  OwnQuestMonster,
  QuestSettings,
  QuestUpdate,
  QuestUpdateResult,
  TradeMatch,
  TradeOverride,
  TradeOverrideResult,
  ZoneProgress,
} from "../types.js";

/** Filters of {@link Quests.monsters}. */
export interface OwnQuestMonstersParams extends PageParams {
  /** Only this kind of monster. */
  type?: MonsterTypeLike | undefined;
  /**
   * Two different questions share this filter.
   *
   * Progress, what you own against the number of parallel quests:
   * `needed` (not enough), `ok` (exactly enough), `excess` (spares).
   *
   * Trade, what the quest really puts on the market after your trade
   * settings: `wanted`, `offered`. A monster in `excess` is not always
   * `offered`.
   */
  status?: "needed" | "ok" | "excess" | "wanted" | "offered" | undefined;
  /** `manual`: monsters with a manual trade override. `auto`: the others. */
  trade?: "manual" | "auto" | undefined;
  /** Only the monsters of this step. */
  step?: number | undefined;
}

/** Filters of {@link Quests.matches}. */
export interface MatchesParams extends PageParams {
  /** Only partners doing at least this many quests in parallel. Default 1, which filters nothing. */
  minParallelQuests?: number | undefined;
  /** Leave out partners with whom the trade can only go one way. Default false. */
  onlyPossibleTrades?: boolean | undefined;
}

/** Filters of {@link Quests.zones}. */
export interface QuestZonesParams {
  /** Only this zone. */
  zone?: ZoneLike | undefined;
  /** Only this subzone. */
  subzone?: SubzoneLike | undefined;
  /** Only this kind of monster. */
  type?: MonsterTypeLike | undefined;
}

/**
 * Quantities to set, in any of three shapes: a list of `{ monster, quantity }`,
 * an object keyed by monster name, or a `Map`.
 */
export type MonsterQuantities = readonly { readonly monster: MonsterLike; readonly quantity: number }[] | Readonly<Record<string, number>> | ReadonlyMap<MonsterLike, number>;

/** Most monsters the API takes in one batch. */
const BATCH = 200;
const FLAGS = ["never_offer_normal", "never_want_normal", "never_offer_boss", "never_want_boss", "never_offer_arch", "never_want_arch"] as const;

function entries(quantities: MonsterQuantities): [MonsterLike, number][] {
  if (Array.isArray(quantities)) return (quantities as readonly { monster: MonsterLike; quantity: number }[]).map((entry) => [entry?.monster, entry?.quantity]);
  if (quantities instanceof Map) return [...quantities];
  if (quantities && typeof quantities === "object") return Object.entries(quantities as Record<string, number>);
  throw new MetamobArgumentError("`quantities` must be a list of `{ monster, quantity }`, an object keyed by monster name, or a Map.");
}

/**
 * Your own quests: the ones of the account the API key belongs to. Everything
 * here answers `NOT_FOUND` for a quest that is someone else's.
 */
export class Quests {
  readonly #context: Context;
  /** Quest template of each quest seen, to tell apart monsters that share a name. */
  readonly #templates = new Map<string, Promise<number>>();

  /** @internal */
  constructor(context: Context) {
    this.#context = context;
  }

  /**
   * Every quest of the account, hidden ones included, favourites first. This
   * is where slugs come from: the other methods all take one.
   *
   * @example
   * const quests = await metamob.quests.list();
   * const slug = quests[0]?.slug;
   */
  async list(options?: RequestOptions): Promise<OwnQuest[]> {
    return (await this.#context.rest.request<{ data: OwnQuest[] }>(METHODS["quests.list"], {}, options)).data;
  }

  /**
   * The full settings of one of your quests, including what public endpoints
   * never show: trade mode, thresholds and filters by kind of monster.
   *
   * @example
   * const quest = await metamob.quests.get("21b0a742");
   * quest.trade_mode, quest.type_filters["3"]?.never_want;
   */
  async get(slug: string, options?: RequestOptions): Promise<QuestSettings> {
    const path = { slug: text(slug, "slug") };
    return (await this.#context.rest.request<{ data: QuestSettings }>(METHODS["quests.get"], { path }, options)).data;
  }

  /**
   * Changes settings of one of your quests. Send only what changes.
   *
   * The answer holds the slug and the fields you changed, nothing else, and
   * the `never_*` flags come back grouped in `type_filters`. Use
   * {@link Quests.get} to read the whole quest.
   *
   * @example
   * await metamob.quests.update("21b0a742", { current_step: 12, parallel_quests: 2 });
   * await metamob.quests.update("21b0a742", { trade_mode: 1, trade_offer_threshold: 3 });
   * await metamob.quests.update("21b0a742", { type_filters: { "3": { never_offer: true } } });
   */
  async update(slug: string, changes: QuestUpdate, options?: RequestOptions): Promise<QuestUpdateResult> {
    const path = { slug: text(slug, "slug") };
    if (!changes || typeof changes !== "object" || Array.isArray(changes)) throw new MetamobArgumentError("`changes` must be an object with the settings to change.");
    const body: Record<string, unknown> = {};
    for (const [field, value] of Object.entries(changes)) if (value !== undefined) body[field] = value;
    if (!Object.keys(body).length) throw new MetamobArgumentError("`changes` is empty: there is nothing to update.");
    // The flat flags are documented as 0 or 1.
    for (const flag of FLAGS) if (typeof body[flag] === "boolean") body[flag] = body[flag] ? 1 : 0;
    return (await this.#context.rest.request<{ data: QuestUpdateResult }>(METHODS["quests.update"], { path, body }, options)).data;
  }

  /**
   * The monsters of one of your quests, with what you own, what the quest
   * wants and offers, and your manual trade overrides. Works on a hidden
   * quest too. Await it for one page, or iterate it for all of them.
   *
   * @example
   * // What is still missing.
   * const missing = await metamob.quests.monsters("21b0a742", { status: "needed" }).all();
   *
   * // How many archmonsters are left to find, in one small request.
   * const left = await metamob.quests.monsters("21b0a742", { type: "archimonstre", status: "needed" }).count();
   */
  monsters(slug: string, params: OwnQuestMonstersParams = {}, options?: RequestOptions): ListRequest<OwnQuestMonster, { slug: string }> {
    const { rest, resolve } = this.#context;
    return new ListRequest(
      rest,
      METHODS["quests.monsters"],
      async () => ({
        path: { slug: text(slug, "slug") },
        query: {
          monster_type: params.type === undefined ? undefined : await resolve.monsterType(params.type, options),
          status: params.status,
          trade: params.trade,
          step: params.step,
          limit: params.limit,
          offset: params.offset,
        },
      }),
      options,
      (body) => {
        const data = (body as { data: { slug: string; monsters: OwnQuestMonster[]; pagination: RawPagination } }).data;
        return { items: data.monsters ?? [], pagination: data.pagination, extra: { slug: data.slug } };
      },
    );
  }

  /** The quest template a quest follows. Asked once per quest and per key, then remembered. */
  #template(slug: string, options: RequestOptions | undefined): Promise<number> {
    const key = `${this.#context.rest.apiKey(options)}\n${slug}`;
    let pending = this.#templates.get(key);
    if (!pending) {
      if (this.#templates.size >= 500) this.#templates.clear();
      pending = this.get(slug, options).then((quest) => quest.quest_template.id);
      this.#templates.set(key, pending);
      // A failure is not remembered: the next call asks again.
      pending.catch(() => this.#templates.delete(key));
    }
    return pending;
  }

  /**
   * The id of a monster of a quest. A few archmonsters share their name
   * across versions of the game: for those, the quest says which one is meant.
   */
  async #monster(slug: string, monster: MonsterLike, options: RequestOptions | undefined): Promise<number> {
    const { resolve } = this.#context;
    const hint = resolve.isAmbiguous(monster) ? { template: await this.#template(slug, options) } : undefined;
    return resolve.monster(monster, options, hint);
  }

  /**
   * Sets how many of a monster you own in a quest, from 0 to 30. The monster
   * is an id or a name in French, English or Spanish.
   *
   * @example
   * const result = await metamob.quests.setMonster("21b0a742", "Tofu Maléfique", 2);
   * result.status;          // owned - parallel_quests
   * result.effective_offer; // what the quest now offers
   */
  async setMonster(slug: string, monster: MonsterLike, quantity: number, options?: RequestOptions): Promise<MonsterQuantityResult> {
    const quest = text(slug, "slug");
    const body = { quantity: count(quantity, "quantity") };
    const monsterId = await this.#monster(quest, monster, options);
    return (await this.#context.rest.request<{ data: MonsterQuantityResult }>(METHODS["quests.setMonster"], { path: { slug: quest, monsterId }, body }, options)).data;
  }

  /**
   * Sets the quantities of many monsters at once. The API takes 200 per
   * request: longer lists are split across requests, sent one after the
   * other, and the answers are merged.
   *
   * @example
   * await metamob.quests.setMonsters("21b0a742", { "Tofu Maléfique": 2, "Bouftou Royal": 0 });
   *
   * await metamob.quests.setMonsters("21b0a742", [
   *   { monster: 397, quantity: 1 },
   *   { monster: "Aboudbra le Porteur", quantity: 3 },
   * ]);
   */
  async setMonsters(slug: string, quantities: MonsterQuantities, options?: RequestOptions): Promise<MonstersUpdateResult> {
    const quest = text(slug, "slug");
    const list = entries(quantities);
    if (!list.length) throw new MetamobArgumentError("`quantities` is empty: there is nothing to update.");
    const ids = await Promise.all(list.map(([monster, quantity]) => (count(quantity, "quantity"), this.#monster(quest, monster, options))));
    // The same monster given twice: the last quantity wins.
    const byId = new Map<number, number>();
    ids.forEach((id, index) => byId.set(id, list[index]![1]));
    const monsters = [...byId].map(([monster_id, quantity]) => ({ monster_id, quantity }));

    const result: MonstersUpdateResult = { updated_count: 0, monsters: [] };
    for (let start = 0; start < monsters.length; start += BATCH) {
      const body = { monsters: monsters.slice(start, start + BATCH) };
      const { data } = await this.#context.rest.request<{ data: MonstersUpdateResult }>(METHODS["quests.setMonsters"], { path: { slug: quest }, body }, options);
      result.updated_count += data.updated_count ?? 0;
      result.monsters.push(...(data.monsters ?? []));
    }
    return result;
  }

  /**
   * Forces how many of a monster a quest offers and wants, instead of the
   * automatic calculation. `null` hands a value back to the calculation; 0
   * forces "none", which is not the same thing.
   *
   * @example
   * // Offer a single one, however many spares there are.
   * await metamob.quests.setTrade("21b0a742", "Tofu Maléfique", { trade_offer: 1 });
   */
  async setTrade(slug: string, monster: MonsterLike, override: TradeOverride, options?: RequestOptions): Promise<TradeOverrideResult> {
    const quest = text(slug, "slug");
    if (!override || typeof override !== "object") throw new MetamobArgumentError("`override` must be an object with `trade_offer` and/or `trade_want`.");
    const body: TradeOverride = {};
    if (override.trade_offer !== undefined) body.trade_offer = override.trade_offer === null ? null : count(override.trade_offer, "trade_offer");
    if (override.trade_want !== undefined) body.trade_want = override.trade_want === null ? null : count(override.trade_want, "trade_want");
    if (!Object.keys(body).length) throw new MetamobArgumentError("`override` must set `trade_offer`, `trade_want` or both.");
    const monsterId = await this.#monster(quest, monster, options);
    return (await this.#context.rest.request<{ data: TradeOverrideResult }>(METHODS["quests.setTrade"], { path: { slug: quest, monsterId }, body }, options)).data;
  }

  /**
   * Removes the manual trade overrides of a monster: both values go back to
   * the automatic calculation.
   *
   * @example
   * await metamob.quests.resetTrade("21b0a742", "Tofu Maléfique");
   */
  resetTrade(slug: string, monster: MonsterLike, options?: RequestOptions): Promise<TradeOverrideResult> {
    return this.setTrade(slug, monster, { trade_offer: null, trade_want: null }, options);
  }

  /**
   * The best trade partners for one of your quests, ranked like the "Best
   * matching" option of the Community page: same server, same kind of quest,
   * active in the last two months. Await it for one page, or iterate it.
   *
   * @example
   * const page = await metamob.quests.matches("21b0a742", { onlyPossibleTrades: true });
   * for (const match of page.items) {
   *   console.log(match.user.username, match.matches.they_have_you_want.length);
   * }
   */
  matches(slug: string, params: MatchesParams = {}, options?: RequestOptions): ListRequest<TradeMatch> {
    return new ListRequest(
      this.#context.rest,
      METHODS["quests.matches"],
      async () => ({
        path: { slug: text(slug, "slug") },
        query: {
          min_parallel_quests: params.minParallelQuests,
          only_possible_trades: params.onlyPossibleTrades === undefined ? undefined : params.onlyPossibleTrades ? 1 : 0,
          limit: params.limit,
          offset: params.offset,
        },
      }),
      options,
      topLevel<TradeMatch>,
    );
  }

  /**
   * The progress of one of your quests, organised by zone and subzone, least
   * advanced subzones first. A monster shows up in each subzone it lives in.
   * The answer is not paginated: narrow it with the filters.
   *
   * @example
   * const zones = await metamob.quests.zones("21b0a742", { type: "archimonstre" });
   * for (const zone of zones) console.log(zone.name.fr, `${zone.completed}/${zone.total}`);
   */
  async zones(slug: string, params: QuestZonesParams = {}, options?: RequestOptions): Promise<ZoneProgress[]> {
    const { rest, resolve } = this.#context;
    const path = { slug: text(slug, "slug") };
    const [zone, subzone, type] = await Promise.all([
      params.zone === undefined ? undefined : resolve.zone(params.zone, options),
      params.subzone === undefined ? undefined : resolve.subzone(params.subzone, options, params.zone).then((found) => found.id),
      params.type === undefined ? undefined : resolve.monsterType(params.type, options),
    ]);
    return (await rest.request<{ data: ZoneProgress[] }>(METHODS["quests.zones"], { path, query: { zone_id: zone, subzone_id: subzone, monster_type_id: type } }, options)).data;
  }
}

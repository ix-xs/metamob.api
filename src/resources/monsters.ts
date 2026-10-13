import { ListRequest, topLevel } from "../core/pagination.js";
import { type Context, type PageParams, searchTerm } from "../core/resource.js";
import type { RequestOptions } from "../core/rest.js";
import type { MonsterHint, MonsterLike, MonsterTypeLike } from "../data/dataset.js";
import { METHODS } from "../generated/methods.js";
import type { Monster, MonsterDetail } from "../types.js";

/** Filters of {@link Monsters.list}. */
export interface MonsterListParams extends PageParams {
  /** Search by name, in French, English or Spanish. At least 3 characters. */
  query?: string | undefined;
  /** Only this kind of monster: `"monstre"`, `"boss"`, `"archimonstre"`, or its id. */
  type?: MonsterTypeLike | undefined;
}

/** The monsters of the game. */
export class Monsters {
  readonly #context: Context;

  /** @internal */
  constructor(context: Context) {
    this.#context = context;
  }

  /**
   * The monsters, optionally searched by name and filtered by kind. Await it
   * for one page, or iterate it for all of them.
   *
   * @example
   * const page = await metamob.monsters.list({ query: "tofu" });
   * page.items, page.total;
   *
   * // Every archmonster, 200 per request.
   * for await (const monster of metamob.monsters.list({ type: "archimonstre" })) {
   *   console.log(monster.name.fr);
   * }
   */
  list(params: MonsterListParams = {}, options?: RequestOptions): ListRequest<Monster> {
    const { rest, resolve } = this.#context;
    return new ListRequest(
      rest,
      METHODS["monsters.list"],
      async () => ({
        query: {
          q: params.query === undefined ? undefined : searchTerm(params.query),
          type: params.type === undefined ? undefined : await resolve.monsterType(params.type, options),
          limit: params.limit,
          offset: params.offset,
        },
      }),
      options,
      topLevel<Monster>,
    );
  }

  /**
   * One monster, with the zones and subzones where it can be found and, for
   * an archmonster, the monster it is the rare version of.
   *
   * Takes an id or a name in French, English or Spanish; accents and capitals
   * do not matter. A few archmonsters share their name across versions of the
   * game: pass `gameVersion` or `template` to say which one you mean.
   *
   * @example
   * const monster = await metamob.monsters.get("Tofu Maléfique");
   * monster.reference?.name.fr; // "Tofu"
   * monster.zones.map((zone) => zone.name.fr);
   */
  async get(monster: MonsterLike, params: MonsterHint = {}, options?: RequestOptions): Promise<MonsterDetail> {
    const id = await this.#context.resolve.monster(monster, options, params);
    return (await this.#context.rest.request<{ data: MonsterDetail }>(METHODS["monsters.get"], { path: { id } }, options)).data;
  }

  /**
   * Shorthand for `list({ query, ...params })`.
   *
   * @example
   * const bosses = await metamob.monsters.search("dragon", { type: "boss" }).all();
   */
  search(query: string, params: Omit<MonsterListParams, "query"> = {}, options?: RequestOptions): ListRequest<Monster> {
    return this.list({ ...params, query }, options);
  }
}

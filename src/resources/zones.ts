import { type Context, count, searchTerm } from "../core/resource.js";
import type { RequestOptions } from "../core/rest.js";
import type { GameVersionLike, SubzoneLike, ZoneLike } from "../data/dataset.js";
import { METHODS } from "../generated/methods.js";
import type { Monster, Subzone, SubzoneRef, Zone, ZoneDetail } from "../types.js";

/** Filters of {@link Zones.list}. */
export interface ZoneListParams {
  /** Search by name, in any language of the site. At least 3 characters. */
  query?: string | undefined;
  /** Only the zones of this version of the game: each version has its own, there are three Amakna. */
  gameVersion?: GameVersionLike | undefined;
  /** The zone with this identifier in the game client. Unique within a version of the game only: pass `gameVersion` too. */
  officialId?: number | undefined;
}

/** Says which zone a subzone belongs to, for a subzone newer than the package. */
export interface SubzoneParams {
  /** The zone the subzone sits in. Only needed for a subzone newer than the package. */
  zone?: ZoneLike | undefined;
}

/** The zones and subzones of the game, and the monsters that live there. */
export class Zones {
  readonly #context: Context;

  /** @internal */
  constructor(context: Context) {
    this.#context = context;
  }

  /**
   * The zones, optionally searched by name in any language of the site. Each
   * version of the game has its own zones: filter with `gameVersion`.
   *
   * @example
   * const zones = await metamob.zones.list({ gameVersion: "Dofus (Unity)" });
   * const found = await metamob.zones.list({ query: "ama" });
   */
  async list(params: ZoneListParams = {}, options?: RequestOptions): Promise<Zone[]> {
    const { resolve } = this.#context;
    const query = {
      q: params.query === undefined ? undefined : searchTerm(params.query),
      game_version: params.gameVersion === undefined ? undefined : await resolve.gameVersion(params.gameVersion, options),
      official_id: params.officialId === undefined ? undefined : count(params.officialId, "officialId"),
    };
    return (await this.#context.rest.request<{ data: Zone[] }>(METHODS["zones.list"], { query }, options)).data;
  }

  /**
   * One zone with its subzones, from its id or its name.
   *
   * @example
   * const amakna = await metamob.zones.get("Amakna");
   * amakna.subzones.map((subzone) => subzone.name.fr);
   */
  async get(zone: ZoneLike, options?: RequestOptions): Promise<ZoneDetail> {
    const id = await this.#context.resolve.zone(zone, options);
    return (await this.#context.rest.request<{ data: ZoneDetail }>(METHODS["zones.get"], { path: { id } }, options)).data;
  }

  /**
   * The subzones of a zone, optionally searched by name.
   *
   * @example
   * const plains = await metamob.zones.subzones("Amakna", { query: "plaine" });
   */
  async subzones(zone: ZoneLike, params: { query?: string | undefined } = {}, options?: RequestOptions): Promise<SubzoneRef[]> {
    const id = await this.#context.resolve.zone(zone, options);
    const query = { q: params.query === undefined ? undefined : searchTerm(params.query) };
    return (await this.#context.rest.request<{ data: SubzoneRef[] }>(METHODS["zones.subzones"], { path: { id }, query }, options)).data;
  }

  /**
   * One subzone with the zone it belongs to. The name is enough: the zone is
   * found for you.
   *
   * @example
   * const cemetery = await metamob.zones.subzone("Cimetière");
   * cemetery.zone.name.fr; // "Amakna"
   */
  async subzone(subzone: SubzoneLike, params: SubzoneParams = {}, options?: RequestOptions): Promise<Subzone> {
    const { id, zone } = await this.#context.resolve.subzone(subzone, options, params.zone);
    return (await this.#context.rest.request<{ data: Subzone }>(METHODS["zones.subzone"], { path: { id: zone, subzoneId: id } }, options)).data;
  }

  /**
   * The monsters that can be found in a subzone.
   *
   * @example
   * const monsters = await metamob.zones.monsters("Cimetière");
   */
  async monsters(subzone: SubzoneLike, params: SubzoneParams = {}, options?: RequestOptions): Promise<Monster[]> {
    const { id, zone } = await this.#context.resolve.subzone(subzone, options, params.zone);
    return (await this.#context.rest.request<{ data: Monster[] }>(METHODS["zones.monsters"], { path: { id: zone, subzoneId: id } }, options)).data;
  }
}

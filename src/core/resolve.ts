import {
  data,
  type GameVersionLike,
  type MonsterHint,
  type MonsterLike,
  type MonsterTypeLike,
  type QuestTemplateLike,
  type QuestTypeLike,
  type ServerLike,
  type SubzoneLike,
  type ZoneLike,
} from "../data/dataset.js";
import { normalizeName } from "../data/text.js";
import { METHODS } from "../generated/methods.js";
import type { GameVersion, LocalizedName, Monster, MonsterType, QuestTemplate, QuestType, Server, SubzoneRef, Zone } from "../types.js";
import { MetamobArgumentError } from "./errors.js";
import type { RequestOptions, Rest } from "./rest.js";

type Kind = Parameters<typeof data.suggest>[0];

const LABELS: Record<Kind, string> = { monster: "monster", zone: "zone", subzone: "subzone", server: "server", gameVersion: "game version", monsterType: "monster type", questType: "quest type" };

/** An id when the reference is one, the trimmed name otherwise. */
function direct(ref: unknown, kind: Kind): number | string {
  if (typeof ref === "number") {
    if (!Number.isInteger(ref) || ref <= 0) throw new MetamobArgumentError(`Invalid ${LABELS[kind]} id: ${ref}.`);
    return ref;
  }
  if (typeof ref === "string") {
    const text = ref.trim();
    if (!text) throw new MetamobArgumentError(`Expected a ${LABELS[kind]}, got an empty string.`);
    return /^\d+$/.test(text) ? Number(text) : text;
  }
  if (ref && typeof ref === "object" && typeof (ref as { id?: unknown }).id === "number") return (ref as { id: number }).id;
  throw new MetamobArgumentError(`Expected a ${LABELS[kind]}: its id, its name, or an object with its id.`);
}

function unknown(kind: Kind, name: string, extra = ""): MetamobArgumentError {
  const suggestions = data.suggest(kind, name);
  const hint = suggestions.length ? ` Did you mean ${suggestions.map((suggestion) => `"${suggestion}"`).join(", ")}?` : "";
  return new MetamobArgumentError(`Unknown ${LABELS[kind]} "${name}".${hint}${extra}`, { code: "UNKNOWN_NAME", suggestions });
}

/** Whether a record of the API answers to a name. A record without a name answers to none. */
function answersTo(name: LocalizedName | string | null | undefined, wanted: string): boolean {
  if (!name) return false;
  if (typeof name === "string") return normalizeName(name) === wanted;
  return [name.fr, name.en, name.es].some((written) => typeof written === "string" && normalizeName(written) === wanted);
}

/**
 * Turns what the caller wrote (a name, an id, an object) into the id the API
 * wants. Names are looked up in the embedded data first, which costs nothing.
 * A name that is not there may be newer than the package: the API is asked
 * before giving up.
 *
 * @internal
 */
export class Resolver {
  readonly #rest: Rest;

  constructor(rest: Rest) {
    this.#rest = rest;
  }

  async #list<T>(method: "servers.list" | "gameVersions.list" | "monsterTypes.list" | "questTypes.list" | "questTemplates.list", options: RequestOptions | undefined): Promise<T[]> {
    return (await this.#rest.request<{ data: T[] }>(METHODS[method], {}, options)).data;
  }

  async monster(ref: MonsterLike, options?: RequestOptions, hint?: MonsterHint): Promise<number> {
    const value = direct(ref, "monster");
    if (typeof value === "number") return value;
    const local = data.monster(value, hint);
    if (local) return local.id;
    // The API searches from 3 characters.
    if (value.length >= 3) {
      const wanted = normalizeName(value);
      const found = await this.#rest.request<{ data: Monster[] }>(METHODS["monsters.list"], { query: { q: value, limit: 200 } }, options);
      const match = found.data.find((monster) => answersTo(monster.name, wanted));
      if (match) return match.id;
    }
    throw unknown("monster", value);
  }

  /** Whether a name designates several monsters, so that a quest is needed to tell which. */
  isAmbiguous(ref: MonsterLike): boolean {
    return typeof ref === "string" && !/^\d+$/.test(ref.trim()) && data.monstersNamed(ref).length > 1;
  }

  async zone(ref: ZoneLike, options?: RequestOptions): Promise<number> {
    const value = direct(ref, "zone");
    if (typeof value === "number") return value;
    const local = data.zone(value);
    if (local) return local.id;
    if (value.length >= 3) {
      const wanted = normalizeName(value);
      const found = await this.#rest.request<{ data: Zone[] }>(METHODS["zones.list"], { query: { q: value } }, options);
      const match = found.data.find((zone) => answersTo(zone.name, wanted));
      if (match) return match.id;
    }
    throw unknown("zone", value);
  }

  /** A subzone and the zone it sits in: the API addresses a subzone through its zone. */
  async subzone(ref: SubzoneLike, options?: RequestOptions, zoneRef?: ZoneLike): Promise<{ id: number; zone: number }> {
    const value = direct(ref, "subzone");
    const local = data.subzone(value);
    if (zoneRef === undefined) {
      if (local) return { id: local.id, zone: local.zone.id };
      if (typeof value === "number") {
        throw new MetamobArgumentError(`Subzone #${value} is not in the data embedded in this version of the package. Pass the zone it belongs to: \`{ zone }\`.`);
      }
      throw unknown("subzone", value, " A subzone newer than this version of the package needs its zone: pass `{ zone }`.");
    }
    const zone = await this.zone(zoneRef, options);
    if (typeof value === "number") return { id: value, zone };
    if (local && local.zone.id === zone) return { id: local.id, zone };
    if (value.length >= 3) {
      const wanted = normalizeName(value);
      const found = await this.#rest.request<{ data: SubzoneRef[] }>(METHODS["zones.subzones"], { path: { id: zone }, query: { q: value } }, options);
      const match = found.data.find((subzone) => answersTo(subzone.name, wanted));
      if (match) return { id: match.id, zone };
    }
    throw unknown("subzone", value);
  }

  async server(ref: ServerLike, options?: RequestOptions): Promise<number> {
    const value = direct(ref, "server");
    if (typeof value === "number") return value;
    const local = data.server(value);
    if (local) return local.id;
    const wanted = normalizeName(value);
    const match = (await this.#list<Server>("servers.list", options)).find((server) => answersTo(server.name, wanted));
    if (match) return match.id;
    throw unknown("server", value);
  }

  async gameVersion(ref: GameVersionLike, options?: RequestOptions): Promise<number> {
    const value = direct(ref, "gameVersion");
    if (typeof value === "number") return value;
    const local = data.gameVersion(value);
    if (local) return local.id;
    const wanted = normalizeName(value);
    const match = (await this.#list<GameVersion>("gameVersions.list", options)).find((version) => answersTo(version.name, wanted));
    if (match) return match.id;
    throw unknown("gameVersion", value);
  }

  async monsterType(ref: MonsterTypeLike, options?: RequestOptions): Promise<number> {
    const value = direct(ref, "monsterType");
    if (typeof value === "number") return value;
    const local = data.monsterType(value);
    if (local) return local.id;
    const wanted = normalizeName(value);
    const match = (await this.#list<MonsterType>("monsterTypes.list", options)).find((type) => answersTo(type.name, wanted));
    if (match) return match.id;
    throw unknown("monsterType", value);
  }

  async questType(ref: QuestTypeLike, options?: RequestOptions): Promise<number> {
    const value = direct(ref, "questType");
    if (typeof value === "number") return value;
    const local = data.questType(value);
    if (local) return local.id;
    const wanted = normalizeName(value);
    const match = (await this.#list<QuestType>("questTypes.list", options)).find((type) => normalizeName(type.slug) === wanted || answersTo(type.name, wanted));
    if (match) return match.id;
    throw unknown("questType", value);
  }

  async questTemplate(ref: QuestTemplateLike, options?: RequestOptions): Promise<number> {
    if (typeof ref === "object" && ref !== null && "questType" in ref) {
      const local = data.questTemplate(ref);
      if (local) return local.id;
      const [type, version] = await Promise.all([this.questType(ref.questType, options), this.gameVersion(ref.gameVersion, options)]);
      const match = (await this.#list<QuestTemplate>("questTemplates.list", options)).find((template) => template.quest_type?.id === type && template.game_version?.id === version);
      if (match) return match.id;
      throw new MetamobArgumentError("There is no quest template for this kind of quest in this version of the game.", { code: "UNKNOWN_NAME" });
    }
    if (typeof ref === "number") {
      if (!Number.isInteger(ref) || ref <= 0) throw new MetamobArgumentError(`Invalid quest template id: ${ref}.`);
      return ref;
    }
    if (ref && typeof ref === "object" && typeof ref.id === "number") return ref.id;
    throw new MetamobArgumentError("Expected a quest template: its id, an object with its id, or `{ questType, gameVersion }`.");
  }
}

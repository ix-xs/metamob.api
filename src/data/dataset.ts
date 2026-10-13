import { DATASET_DATE, DATASET_JSON } from "../generated/dataset.js";
import type {
  GameVersionName,
  MonsterNameEn,
  MonsterNameEs,
  MonsterNameFr,
  MonsterTypeNameEn,
  MonsterTypeNameEs,
  MonsterTypeNameFr,
  QuestTemplateId,
  QuestTypeNameEn,
  QuestTypeNameEs,
  QuestTypeNameFr,
  QuestTypeSlug,
  ServerName,
  SubzoneNameEn,
  SubzoneNameEs,
  SubzoneNameFr,
  ZoneNameEn,
  ZoneNameEs,
  ZoneNameFr,
} from "../generated/names.js";
import type { GameVersion, LocalizedName, Monster, MonsterType, QuestTemplate, QuestType, Server, Subzone, TemplateMonster, Zone, ZoneDetail } from "../types.js";
import { closest, normalizeName } from "./text.js";

/**
 * How a record is designated: its id, its name, or any object that carries
 * its id (a monster returned by another call, for instance). The names known
 * to the package are suggested by the editor; any other string is accepted.
 */
type Like<Name extends string> = number | Name | (string & {}) | { readonly id: number };

/** A monster: its id, its name in French, English or Spanish, or an object with its `id`. */
export type MonsterLike = Like<MonsterNameFr | MonsterNameEn | MonsterNameEs>;
/** A zone: its id, its name in French, English or Spanish, or an object with its `id`. */
export type ZoneLike = Like<ZoneNameFr | ZoneNameEn | ZoneNameEs>;
/** A subzone: its id, its name in French, English or Spanish, or an object with its `id`. */
export type SubzoneLike = Like<SubzoneNameFr | SubzoneNameEn | SubzoneNameEs>;
/** A server: its id, its name, or an object with its `id`. */
export type ServerLike = Like<ServerName>;
/** A version of the game: its id, its name, or an object with its `id`. */
export type GameVersionLike = Like<GameVersionName>;
/** A kind of monster: its id (1, 2, 3), its name in French, English or Spanish, or an object with its `id`. */
export type MonsterTypeLike = Like<MonsterTypeNameFr | MonsterTypeNameEn | MonsterTypeNameEs>;
/** A kind of quest: its id, its slug (`ocre`, `dokille`), its name, or an object with its `id`. */
export type QuestTypeLike = Like<QuestTypeSlug | QuestTypeNameFr | QuestTypeNameEn | QuestTypeNameEs>;
/** A quest template: its id, an object with its `id`, or the kind of quest and the version of the game it is for. */
export type QuestTemplateLike = QuestTemplateId | (number & {}) | { readonly id: number } | { readonly questType: QuestTypeLike; readonly gameVersion: GameVersionLike };

/** What tells two monsters of the same name apart. */
export interface MonsterHint {
  /** Prefer the monster that belongs to this quest template. */
  template?: QuestTemplateLike | undefined;
  /** Prefer the monster of this version of the game. */
  gameVersion?: GameVersionLike | undefined;
}

/** Options of {@link Dataset.searchMonsters}. */
export interface MonsterSearchOptions extends MonsterHint {
  /** Only this kind of monster. */
  type?: MonsterTypeLike | undefined;
  /** Results to return. Default 25. */
  limit?: number | undefined;
}

/** A name stored as 0 is the same as the French one. */
type Translation = string | 0;

interface Raw {
  d: string;
  gv: [id: number, name: string][];
  mt: [id: number, fr: string, en: Translation, es: Translation][];
  qt: [id: number, slug: string, fr: string, en: Translation, es: Translation, image: string][];
  sv: [id: number, name: string, community: string, gameVersion: number][];
  tp: [id: number, questType: number, gameVersion: number, steps: number, monsters: number[], monsterSteps: number[]][];
  z: [id: number, fr: string, en: Translation, es: Translation][];
  sz: [id: number, fr: string, en: Translation, es: Translation, zone: number, monsters: number[]][];
  m: [id: number, fr: string, en: Translation, es: Translation, image: string, min: number, max: number, type: number, reference: number][];
}

const localized = (fr: string, en: Translation, es: Translation): LocalizedName => ({ fr, en: en || fr, es: es || fr });
const names = (record: { name: LocalizedName }): string[] => [record.name.fr, record.name.en, record.name.es];
const isId = (value: string): boolean => /^\d+$/.test(value);

/** Records of one kind, found by id or by name. The name index is built on first use. */
class Collection<T extends { readonly id: number }> {
  readonly list: readonly T[];
  readonly #byId = new Map<number, T>();
  readonly #names: (record: T) => readonly string[];
  #byName: Map<string, T[]> | undefined;

  constructor(list: T[], namesOf: (record: T) => readonly string[]) {
    this.list = list;
    this.#names = namesOf;
    for (const record of list) this.#byId.set(record.id, record);
  }

  byId(id: number): T | undefined {
    return this.#byId.get(id);
  }

  /** Every record that answers to a name, in any language. */
  named(name: string): readonly T[] {
    if (!this.#byName) {
      const index = new Map<string, T[]>();
      for (const record of this.list) {
        for (const written of this.#names(record)) {
          const key = normalizeName(written);
          const found = index.get(key);
          if (!found) index.set(key, [record]);
          else if (!found.includes(record)) found.push(record);
        }
      }
      this.#byName = index;
    }
    return this.#byName.get(normalizeName(name)) ?? [];
  }

  find(ref: number | string | { readonly id: number }): T | undefined {
    if (typeof ref === "number") return this.#byId.get(ref);
    if (typeof ref === "string") return isId(ref) ? this.#byId.get(Number(ref)) : this.named(ref)[0];
    return ref && typeof ref.id === "number" ? this.#byId.get(ref.id) : undefined;
  }

  /** Each name of each record, normalized and as written, for suggestions. */
  *written(): Generator<readonly [string, string, number, number]> {
    for (const record of this.list) {
      let rank = 0;
      for (const name of this.#names(record)) yield [normalizeName(name), name, record.id, rank++];
    }
  }
}

/** What the data set is decoded into, once. */
interface Loaded {
  gameVersions: Collection<GameVersion>;
  monsterTypes: Collection<MonsterType>;
  questTypes: Collection<QuestType>;
  servers: Collection<Server>;
  questTemplates: Collection<QuestTemplate>;
  zones: Collection<ZoneDetail>;
  subzones: Collection<Subzone>;
  monsters: Collection<Monster>;
  /** Monster ids of each subzone. */
  subzoneMonsters: Map<number, readonly number[]>;
  /** Monster ids and their steps, for each quest template. */
  templateRows: Map<number, { ids: readonly number[]; steps: readonly number[] }>;
  /** Quest templates each monster belongs to, lowest id first. */
  monsterTemplates: Map<number, number[]>;
}

/**
 * The reference data of Metamob, embedded in the package: monsters, zones,
 * subzones, servers, game versions and quest templates. Everything here is
 * answered from memory, without a request and without an API key.
 *
 * It is a copy made on {@link Dataset.fetchedAt}. The client uses it to turn
 * names into ids; when a name is not in it, the client asks the API.
 *
 * @example
 * import { data } from "@ix-xs/metamob.api";
 *
 * data.monster("Tofu Maléfique")?.id;
 * data.searchMonsters("bouf", { type: "archimonstre" });
 * data.monstersInSubzone("Cimetière");
 */
export class Dataset {
  #loaded: Loaded | undefined;
  #monsterSubzones: Map<number, number[]> | undefined;
  #archmonsters: Map<number, Monster[]> | undefined;
  #searchKeys: { monster: Monster; keys: string[] }[] | undefined;

  /** Day the data was fetched from the API, as `YYYY-MM-DD`. */
  readonly fetchedAt: string = DATASET_DATE;

  #load(): Loaded {
    if (this.#loaded) return this.#loaded;
    const raw = JSON.parse(DATASET_JSON) as Raw;

    const gameVersions = new Collection<GameVersion>(
      raw.gv.map(([id, name]) => ({ id, name })),
      (version) => [version.name],
    );
    const monsterTypes = new Collection<MonsterType>(
      raw.mt.map(([id, fr, en, es]) => ({ id, name: localized(fr, en, es) })),
      names,
    );
    const questTypes = new Collection<QuestType>(
      raw.qt.map(([id, slug, fr, en, es, image]) => ({ id, slug, name: localized(fr, en, es), image })),
      (type) => [type.slug, ...names(type)],
    );
    const servers = new Collection<Server>(
      raw.sv.map(([id, name, community, version]) => ({ id, name, community, game_version: gameVersions.byId(version) ?? null })),
      (server) => [server.name],
    );
    const questTemplates = new Collection<QuestTemplate>(
      raw.tp.map(([id, questType, version, steps, monsters]) => {
        const type = questTypes.byId(questType);
        return {
          id,
          quest_type: type ? { id: type.id, slug: type.slug, name: type.name } : null,
          game_version: gameVersions.byId(version) ?? null,
          monster_count: monsters.length,
          step_count: steps,
        };
      }),
      () => [],
    );

    const zoneRows = raw.z.map(([id, fr, en, es]): ZoneDetail => ({ id, name: localized(fr, en, es), subzones: [] }));
    const zones = new Collection<ZoneDetail>(zoneRows, names);
    const subzoneMonsters = new Map<number, readonly number[]>();
    const subzones = new Collection<Subzone>(
      raw.sz.map(([id, fr, en, es, zoneId, monsters]) => {
        const name = localized(fr, en, es);
        const zone = zones.byId(zoneId);
        zone?.subzones.push({ id, name });
        subzoneMonsters.set(id, monsters);
        return { id, name, zone: zone ? { id: zone.id, name: zone.name } : { id: zoneId, name: { fr: "", en: "", es: "" } } };
      }),
      names,
    );

    const templateRows = new Map<number, { ids: readonly number[]; steps: readonly number[] }>();
    const monsterTemplates = new Map<number, number[]>();
    for (const [id, , , , ids, steps] of raw.tp) {
      templateRows.set(id, { ids, steps });
      for (const monster of ids) {
        const list = monsterTemplates.get(monster);
        if (list) list.push(id);
        else monsterTemplates.set(monster, [id]);
      }
    }

    const monsterRows = raw.m.map(([id, fr, en, es, image, min, max, type]): Monster => ({ id, name: localized(fr, en, es), image, level_min: min, level_max: max, type: monsterTypes.byId(type) ?? null }));
    const monsters = new Collection<Monster>(monsterRows, names);
    raw.m.forEach(([, , , , , , , , reference], index) => {
      const base = reference ? monsters.byId(reference) : undefined;
      if (base) monsterRows[index]!.reference = { id: base.id, name: base.name };
    });

    this.#loaded = { gameVersions, monsterTypes, questTypes, servers, questTemplates, zones, subzones, monsters, subzoneMonsters, templateRows, monsterTemplates };
    return this.#loaded;
  }

  /** The versions of the game. */
  get gameVersions(): readonly GameVersion[] {
    return this.#load().gameVersions.list;
  }

  /** The kinds of monsters. */
  get monsterTypes(): readonly MonsterType[] {
    return this.#load().monsterTypes.list;
  }

  /** The kinds of quests. */
  get questTypes(): readonly QuestType[] {
    return this.#load().questTypes.list;
  }

  /** The game servers. */
  get servers(): readonly Server[] {
    return this.#load().servers.list;
  }

  /** The quest templates. */
  get questTemplates(): readonly QuestTemplate[] {
    return this.#load().questTemplates.list;
  }

  /** The zones, each with its subzones. */
  get zones(): readonly ZoneDetail[] {
    return this.#load().zones.list;
  }

  /** The subzones, each with its zone. */
  get subzones(): readonly Subzone[] {
    return this.#load().subzones.list;
  }

  /** Every monster. */
  get monsters(): readonly Monster[] {
    return this.#load().monsters.list;
  }

  /** A version of the game, from its id or its name. */
  gameVersion(ref: GameVersionLike): GameVersion | undefined {
    return this.#load().gameVersions.find(ref);
  }

  /** A kind of monster, from its id or its name in any language. */
  monsterType(ref: MonsterTypeLike): MonsterType | undefined {
    return this.#load().monsterTypes.find(ref);
  }

  /** A kind of quest, from its id, its slug or its name. */
  questType(ref: QuestTypeLike): QuestType | undefined {
    return this.#load().questTypes.find(ref);
  }

  /** A server, from its id or its name. */
  server(ref: ServerLike): Server | undefined {
    return this.#load().servers.find(ref);
  }

  /** A zone with its subzones, from its id or its name. */
  zone(ref: ZoneLike): ZoneDetail | undefined {
    return this.#load().zones.find(ref);
  }

  /** A subzone with its zone, from its id or its name. */
  subzone(ref: SubzoneLike): Subzone | undefined {
    return this.#load().subzones.find(ref);
  }

  /**
   * A quest template, from its id or from the kind of quest and the version
   * of the game it is for.
   *
   * @example
   * data.questTemplate({ questType: "ocre", gameVersion: "Dofus Touch" })?.step_count;
   */
  questTemplate(ref: QuestTemplateLike): QuestTemplate | undefined {
    const { questTemplates } = this.#load();
    if (typeof ref === "object" && ref !== null && "questType" in ref) {
      const type = this.questType(ref.questType);
      const version = this.gameVersion(ref.gameVersion);
      if (!type || !version) return undefined;
      return questTemplates.list.find((template) => template.quest_type?.id === type.id && template.game_version?.id === version.id);
    }
    return questTemplates.find(ref as number | { readonly id: number });
  }

  /**
   * A monster, from its id or its name in French, English or Spanish.
   * Accents and capitals do not matter.
   *
   * A few archmonsters share their name across versions of the game, under
   * different ids. Without a hint, the one of the lowest quest template wins,
   * Dofus (Unity) first; pass `template` or `gameVersion` to pick another.
   *
   * @example
   * data.monster("tofu malefique");
   * data.monster("Crognan le Barbare", { gameVersion: "Dofus Retro (1.29)" });
   */
  monster(ref: MonsterLike, hint?: MonsterHint): Monster | undefined {
    const { monsters } = this.#load();
    if (typeof ref !== "string" || isId(ref)) return monsters.find(ref);
    return this.#pick(monsters.named(ref), hint);
  }

  /** Every monster that answers to a name. More than one for the few names shared across versions of the game. */
  monstersNamed(name: string): Monster[] {
    return this.#rank(this.#load().monsters.named(name));
  }

  /** Candidates ordered by their lowest quest template, then by id. */
  #rank(candidates: readonly Monster[]): Monster[] {
    if (candidates.length < 2) return [...candidates];
    const { monsterTemplates } = this.#load();
    const first = (monster: Monster) => monsterTemplates.get(monster.id)?.[0] ?? Number.MAX_SAFE_INTEGER;
    return [...candidates].sort((a, b) => first(a) - first(b) || a.id - b.id);
  }

  #pick(candidates: readonly Monster[], hint: MonsterHint | undefined): Monster | undefined {
    if (candidates.length < 2) return candidates[0];
    const { monsterTemplates, questTemplates } = this.#load();
    if (hint?.template !== undefined) {
      const template = this.questTemplate(hint.template);
      const match = template && candidates.find((monster) => monsterTemplates.get(monster.id)?.includes(template.id));
      if (match) return match;
    }
    if (hint?.gameVersion !== undefined) {
      const version = this.gameVersion(hint.gameVersion);
      const match = version && candidates.find((monster) => monsterTemplates.get(monster.id)?.some((id) => questTemplates.byId(id)?.game_version?.id === version.id));
      if (match) return match;
    }
    return this.#rank(candidates)[0];
  }

  /**
   * Monsters whose name contains `query`, in any language, best match first:
   * exact names, then names that start with it, then the rest.
   *
   * @example
   * data.searchMonsters("bouf", { type: "archimonstre", limit: 5 });
   */
  searchMonsters(query: string, options: MonsterSearchOptions = {}): Monster[] {
    const needle = normalizeName(query);
    if (!needle) return [];
    const { monsterTemplates, questTemplates } = this.#load();
    this.#searchKeys ??= this.monsters.map((monster) => ({ monster, keys: [...new Set(names(monster).map(normalizeName))] }));
    const type = options.type === undefined ? undefined : this.monsterType(options.type);
    if (options.type !== undefined && !type) return [];
    const template = options.template === undefined ? undefined : this.questTemplate(options.template);
    const version = options.gameVersion === undefined ? undefined : this.gameVersion(options.gameVersion);

    const scored: { monster: Monster; score: number }[] = [];
    for (const { monster, keys } of this.#searchKeys) {
      if (type && monster.type?.id !== type.id) continue;
      let score = 3;
      for (const key of keys) {
        const at = key.indexOf(needle);
        if (at < 0) continue;
        const value = key === needle ? 0 : at === 0 ? 1 : 2;
        if (value < score) score = value;
      }
      if (score === 3) continue;
      if (template || version) {
        const templates = monsterTemplates.get(monster.id) ?? [];
        if (template && !templates.includes(template.id)) continue;
        if (version && !templates.some((id) => questTemplates.byId(id)?.game_version?.id === version.id)) continue;
      }
      scored.push({ monster, score });
    }
    return scored
      .sort((a, b) => a.score - b.score || a.monster.name.fr.localeCompare(b.monster.name.fr))
      .slice(0, Math.max(0, options.limit ?? 25))
      .map((entry) => entry.monster);
  }

  /** The monsters that can be found in a subzone. */
  monstersInSubzone(subzone: SubzoneLike): Monster[] {
    const loaded = this.#load();
    const found = loaded.subzones.find(subzone);
    if (!found) return [];
    return (loaded.subzoneMonsters.get(found.id) ?? []).flatMap((id) => loaded.monsters.byId(id) ?? []);
  }

  /** The monsters that can be found anywhere in a zone. */
  monstersInZone(zone: ZoneLike): Monster[] {
    const loaded = this.#load();
    const found = loaded.zones.find(zone);
    if (!found) return [];
    const ids = new Set<number>();
    for (const subzone of found.subzones) for (const id of loaded.subzoneMonsters.get(subzone.id) ?? []) ids.add(id);
    return [...ids].flatMap((id) => loaded.monsters.byId(id) ?? []);
  }

  /** The subzones where a monster can be found. */
  subzonesOf(monster: MonsterLike, hint?: MonsterHint): Subzone[] {
    const loaded = this.#load();
    const found = this.monster(monster, hint);
    if (!found) return [];
    if (!this.#monsterSubzones) {
      const index = new Map<number, number[]>();
      for (const [subzone, monsters] of loaded.subzoneMonsters) {
        for (const id of monsters) {
          const list = index.get(id);
          if (list) list.push(subzone);
          else index.set(id, [subzone]);
        }
      }
      this.#monsterSubzones = index;
    }
    return (this.#monsterSubzones.get(found.id) ?? []).flatMap((id) => loaded.subzones.byId(id) ?? []);
  }

  /** The zones where a monster can be found. */
  zonesOf(monster: MonsterLike, hint?: MonsterHint): Zone[] {
    const seen = new Map<number, Zone>();
    for (const subzone of this.subzonesOf(monster, hint)) seen.set(subzone.zone.id, subzone.zone);
    return [...seen.values()];
  }

  /** The archmonsters of a monster: the rare versions that have it as `reference`. One per version of the game at most. */
  archmonstersOf(monster: MonsterLike): Monster[] {
    const found = this.monster(monster);
    if (!found) return [];
    if (!this.#archmonsters) {
      const index = new Map<number, Monster[]>();
      for (const candidate of this.monsters) {
        if (!candidate.reference) continue;
        const list = index.get(candidate.reference.id);
        if (list) list.push(candidate);
        else index.set(candidate.reference.id, [candidate]);
      }
      this.#archmonsters = index;
    }
    return [...(this.#archmonsters.get(found.id) ?? [])];
  }

  /** The quest templates a monster belongs to. */
  templatesOf(monster: MonsterLike, hint?: MonsterHint): QuestTemplate[] {
    const loaded = this.#load();
    const found = this.monster(monster, hint);
    if (!found) return [];
    return (loaded.monsterTemplates.get(found.id) ?? []).flatMap((id) => loaded.questTemplates.byId(id) ?? []);
  }

  /**
   * The monsters a quest template asks for, in the order of the quest, each
   * with its step.
   *
   * @example
   * data.templateMonsters({ questType: "ocre", gameVersion: "Dofus (Unity)" }, { step: 4 });
   */
  templateMonsters(template: QuestTemplateLike, options: { step?: number | undefined } = {}): TemplateMonster[] {
    const loaded = this.#load();
    const found = this.questTemplate(template);
    const rows = found && loaded.templateRows.get(found.id);
    if (!rows) return [];
    const out: TemplateMonster[] = [];
    rows.ids.forEach((id, index) => {
      const step = rows.steps[index] ?? 0;
      if (options.step !== undefined && step !== options.step) return;
      const monster = loaded.monsters.byId(id);
      if (monster) out.push({ ...monster, step });
    });
    return out;
  }

  /** The step a monster belongs to in a quest template, or `undefined` when it is not part of it. */
  stepOf(monster: MonsterLike, template: QuestTemplateLike): number | undefined {
    const loaded = this.#load();
    const quest = this.questTemplate(template);
    const found = quest && this.monster(monster, { template: quest });
    const rows = quest && loaded.templateRows.get(quest.id);
    if (!found || !rows) return undefined;
    const index = rows.ids.indexOf(found.id);
    return index < 0 ? undefined : rows.steps[index] || undefined;
  }

  /**
   * The names closest to a misspelled one, best first.
   *
   * @example
   * data.suggest("monster", "Tofu Malefik"); // ["Tofu Maléfique"]
   */
  suggest(kind: "monster" | "zone" | "subzone" | "server" | "gameVersion" | "monsterType" | "questType", input: string, limit = 3): string[] {
    const loaded = this.#load();
    const collection = { monster: loaded.monsters, zone: loaded.zones, subzone: loaded.subzones, server: loaded.servers, gameVersion: loaded.gameVersions, monsterType: loaded.monsterTypes, questType: loaded.questTypes }[kind];
    return closest(input, collection.written(), limit);
  }
}

/**
 * The reference data embedded in the package. See {@link Dataset}.
 *
 * @example
 * import { data } from "@ix-xs/metamob.api";
 *
 * data.monster("Bouftou")?.level_max;
 * data.server("Draconiros")?.game_version?.name;
 */
export const data: Dataset = new Dataset();

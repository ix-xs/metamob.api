import { MetamobArgumentError } from "../core/errors.js";
import { ListRequest } from "../core/pagination.js";
import type { Context, PageParams } from "../core/resource.js";
import type { RequestOptions } from "../core/rest.js";
import type { GameVersionLike, MonsterTypeLike, QuestTemplateLike, QuestTypeLike, ServerLike } from "../data/dataset.js";
import { METHODS } from "../generated/methods.js";
import type { GameVersion, MonsterType, QuestTemplate, QuestType, QuestTypeRef, Server, TemplateMonster } from "../types.js";

/** The versions of the game. */
export class GameVersions {
  readonly #context: Context;

  /** @internal */
  constructor(context: Context) {
    this.#context = context;
  }

  /**
   * Every version of the game: Dofus (Unity), Dofus Retro (1.29) and Dofus Touch.
   *
   * @example
   * const versions = await metamob.gameVersions.list();
   */
  async list(options?: RequestOptions): Promise<GameVersion[]> {
    return (await this.#context.rest.request<{ data: GameVersion[] }>(METHODS["gameVersions.list"], {}, options)).data;
  }

  /**
   * One version of the game, from its id or its name.
   *
   * @example
   * const touch = await metamob.gameVersions.get("Dofus Touch");
   */
  async get(version: GameVersionLike, options?: RequestOptions): Promise<GameVersion> {
    const id = await this.#context.resolve.gameVersion(version, options);
    return (await this.#context.rest.request<{ data: GameVersion }>(METHODS["gameVersions.get"], { path: { id } }, options)).data;
  }
}

/** The game servers. */
export class Servers {
  readonly #context: Context;

  /** @internal */
  constructor(context: Context) {
    this.#context = context;
  }

  /**
   * Every server, with its community and its version of the game.
   *
   * @example
   * const servers = await metamob.servers.list();
   * const french = servers.filter((server) => server.community === "France");
   */
  async list(options?: RequestOptions): Promise<Server[]> {
    return (await this.#context.rest.request<{ data: Server[] }>(METHODS["servers.list"], {}, options)).data;
  }

  /**
   * One server, from its id or its name.
   *
   * @example
   * const server = await metamob.servers.get("Draconiros");
   */
  async get(server: ServerLike, options?: RequestOptions): Promise<Server> {
    const id = await this.#context.resolve.server(server, options);
    return (await this.#context.rest.request<{ data: Server }>(METHODS["servers.get"], { path: { id } }, options)).data;
  }
}

/** The kinds of monsters. */
export class MonsterTypes {
  readonly #context: Context;

  /** @internal */
  constructor(context: Context) {
    this.#context = context;
  }

  /**
   * The three kinds of monsters: monster (1), boss (2) and archmonster (3).
   *
   * @example
   * const types = await metamob.monsterTypes.list();
   */
  async list(options?: RequestOptions): Promise<MonsterType[]> {
    return (await this.#context.rest.request<{ data: MonsterType[] }>(METHODS["monsterTypes.list"], {}, options)).data;
  }

  /**
   * One kind of monster, from its id or its name in French, English or Spanish.
   *
   * @example
   * const archmonster = await metamob.monsterTypes.get("archimonstre");
   */
  async get(type: MonsterTypeLike, options?: RequestOptions): Promise<MonsterType> {
    const id = await this.#context.resolve.monsterType(type, options);
    return (await this.#context.rest.request<{ data: MonsterType }>(METHODS["monsterTypes.get"], { path: { id } }, options)).data;
  }
}

/** The kinds of quests. */
export class QuestTypes {
  readonly #context: Context;

  /** @internal */
  constructor(context: Context) {
    this.#context = context;
  }

  /**
   * The kinds of quests, each with its image: Ochre (`ocre`) and Grofus
   * (`dokille`). Two quests can trade only when they are of the same kind.
   *
   * @example
   * const types = await metamob.questTypes.list();
   */
  async list(options?: RequestOptions): Promise<QuestType[]> {
    return (await this.#context.rest.request<{ data: QuestType[] }>(METHODS["questTypes.list"], {}, options)).data;
  }

  /**
   * One kind of quest, from its id, its slug or its name.
   *
   * @example
   * const ochre = await metamob.questTypes.get("ocre");
   */
  async get(type: QuestTypeLike, options?: RequestOptions): Promise<QuestType> {
    const id = await this.#context.resolve.questType(type, options);
    return (await this.#context.rest.request<{ data: QuestType }>(METHODS["questTypes.get"], { path: { id } }, options)).data;
  }
}

/** Filters of {@link QuestTemplates.monsters}. */
export interface TemplateMonstersParams extends PageParams {
  /** Only the monsters of this step. */
  step?: number | undefined;
}

/** The template a page of monsters belongs to. */
export interface TemplateHeader {
  id: number;
  quest_type: QuestTypeRef | null;
  game_version: GameVersion | null;
}

/** The quest templates: what each kind of quest asks for in each version of the game. */
export class QuestTemplates {
  readonly #context: Context;

  /** @internal */
  constructor(context: Context) {
    this.#context = context;
  }

  /**
   * Every quest template, with its number of monsters and of steps.
   *
   * @example
   * const templates = await metamob.questTemplates.list();
   */
  async list(options?: RequestOptions): Promise<QuestTemplate[]> {
    return (await this.#context.rest.request<{ data: QuestTemplate[] }>(METHODS["questTemplates.list"], {}, options)).data;
  }

  /**
   * One quest template with its counts, from its id or from the kind of quest
   * and the version of the game. Read from the list, which is cached.
   *
   * @example
   * const template = await metamob.questTemplates.get({ questType: "ocre", gameVersion: "Dofus Touch" });
   * template.monster_count, template.step_count;
   */
  async get(template: QuestTemplateLike, options?: RequestOptions): Promise<QuestTemplate> {
    const id = await this.#context.resolve.questTemplate(template, options);
    const found = (await this.list(options)).find((candidate) => candidate.id === id);
    if (!found) throw new MetamobArgumentError(`There is no quest template #${id}.`, { code: "UNKNOWN_NAME" });
    return found;
  }

  /**
   * The monsters a quest template asks for, each with its step. Await it for
   * one page, or iterate it for all of them.
   *
   * @example
   * const step4 = await metamob.questTemplates.monsters(1, { step: 4 }).all();
   *
   * for await (const monster of metamob.questTemplates.monsters({ questType: "dokille", gameVersion: "Dofus (Unity)" })) {
   *   console.log(monster.step, monster.name.fr);
   * }
   */
  monsters(template: QuestTemplateLike, params: TemplateMonstersParams = {}, options?: RequestOptions): ListRequest<TemplateMonster, { template: TemplateHeader }> {
    const { rest, resolve } = this.#context;
    return new ListRequest(
      rest,
      METHODS["questTemplates.monsters"],
      async () => ({ path: { id: await resolve.questTemplate(template, options) }, query: { step: params.step, limit: params.limit, offset: params.offset } }),
      options,
      (body) => {
        const { monsters, pagination, ...header } = (body as { data: TemplateHeader & { monsters: TemplateMonster[]; pagination: { total: number; limit: number; offset: number } } }).data;
        return { items: monsters ?? [], pagination, extra: { template: header } };
      },
    );
  }
}

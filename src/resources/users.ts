import { ListRequest, type RawPagination, topLevel } from "../core/pagination.js";
import { type Context, type PageParams, searchTerm, text } from "../core/resource.js";
import type { RequestOptions } from "../core/rest.js";
import type { MonsterTypeLike, ServerLike } from "../data/dataset.js";
import { METHODS } from "../generated/methods.js";
import type { PublicQuest, PublicQuestSummary, QuestMonster, UserProfile, UserSummary } from "../types.js";

/** Filters of {@link Users.search}. */
export interface UserSearchParams extends PageParams {
  /** Only users with a quest on this server. */
  server?: ServerLike | undefined;
  /** Only users seen in the last N days. Default 90, at most 365. */
  activeWithinDays?: number | undefined;
}

/** Filters of {@link Users.quest}. */
export interface PublicQuestParams extends PageParams {
  /** Only this kind of monster. */
  type?: MonsterTypeLike | undefined;
  /** `wanted`: what the quest is looking for. `offered`: what it offers. */
  status?: "wanted" | "offered" | undefined;
  /** Only the monsters of this step. */
  step?: number | undefined;
}

/** Other players: their profile and their public quests. */
export class Users {
  readonly #context: Context;

  /** @internal */
  constructor(context: Context) {
    this.#context = context;
  }

  /**
   * Users with public quests whose name matches a search of 3 characters or
   * more. Await it for one page, or iterate it for all of them.
   *
   * @example
   * const page = await metamob.users.search("ix-", { server: "Tylezia", activeWithinDays: 30 });
   * page.items.map((user) => user.username);
   */
  search(query: string, params: UserSearchParams = {}, options?: RequestOptions): ListRequest<UserSummary> {
    const { rest, resolve } = this.#context;
    return new ListRequest(
      rest,
      METHODS["users.search"],
      async () => ({
        query: {
          q: searchTerm(query),
          server_id: params.server === undefined ? undefined : await resolve.server(params.server, options),
          active_within_days: params.activeWithinDays,
          limit: params.limit,
          offset: params.offset,
        },
      }),
      options,
      topLevel<UserSummary>,
    );
  }

  /**
   * The public profile of a user, with their public quests. The username is
   * case-sensitive. A deleted account answers with a `NOT_FOUND` error.
   *
   * @example
   * const profile = await metamob.users.get("Ix-xs");
   * profile.quests.map((quest) => quest.slug);
   */
  async get(username: string, options?: RequestOptions): Promise<UserProfile> {
    const path = { username: text(username, "username") };
    return (await this.#context.rest.request<{ data: UserProfile }>(METHODS["users.get"], { path }, options)).data;
  }

  /**
   * The public quests of a user, with how many monsters each one is looking
   * for and offers. Hidden quests are not listed.
   *
   * @example
   * const quests = await metamob.users.quests("Ix-xs");
   */
  async quests(username: string, options?: RequestOptions): Promise<PublicQuestSummary[]> {
    const path = { username: text(username, "username") };
    return (await this.#context.rest.request<{ data: PublicQuestSummary[] }>(METHODS["users.quests"], { path }, options)).data;
  }

  /**
   * The monsters of a public quest, with what its owner owns, wants and
   * offers. Each page also carries the quest itself as `page.quest`.
   *
   * @example
   * const page = await metamob.users.quest("Ix-xs", "21b0a742", { status: "offered" });
   * page.quest.character_name;
   * page.items.map((monster) => `${monster.offer} x ${monster.name.fr}`);
   *
   * // Everything the quest is looking for.
   * const wanted = await metamob.users.quest("Ix-xs", "21b0a742", { status: "wanted" }).all();
   */
  quest(username: string, slug: string, params: PublicQuestParams = {}, options?: RequestOptions): ListRequest<QuestMonster, { quest: PublicQuest }> {
    const { rest, resolve } = this.#context;
    return new ListRequest(
      rest,
      METHODS["users.quest"],
      async () => ({
        path: { username: text(username, "username"), slug: text(slug, "slug") },
        query: {
          monster_type: params.type === undefined ? undefined : await resolve.monsterType(params.type, options),
          status: params.status,
          step: params.step,
          limit: params.limit,
          offset: params.offset,
        },
      }),
      options,
      (body) => {
        const { monsters, pagination, ...quest } = (body as { data: PublicQuest & { monsters: QuestMonster[]; pagination: RawPagination } }).data;
        return { items: monsters ?? [], pagination, extra: { quest } };
      },
    );
  }
}

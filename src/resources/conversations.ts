import { ListRequest, topLevel } from "../core/pagination.js";
import { type Context, type PageParams, text } from "../core/resource.js";
import type { RequestOptions } from "../core/rest.js";
import { METHODS } from "../generated/methods.js";
import type { Conversation, ConversationItem } from "../types.js";

/** Filters of {@link Conversations.list}. */
export interface ConversationListParams extends PageParams {
  /** `active` (default) or `archived`. */
  status?: "active" | "archived" | undefined;
}

/** Where to start reading a conversation. */
export interface MessagesParams {
  /** Items per page. Default 30, at most 50. */
  limit?: number | undefined;
  /** Start from older items: the `nextBeforeId` of a page you already have. */
  beforeId?: number | undefined;
}

/** The private messages of the account the API key belongs to. */
export class Conversations {
  readonly #context: Context;

  /** @internal */
  constructor(context: Context) {
    this.#context = context;
  }

  /**
   * The conversations of the account, one per correspondent, most recent
   * first. Await it for one page, or iterate it for all of them.
   *
   * A correspondent listed here may have no profile left: a deleted account
   * keeps its conversations for 30 days while `users.get()` answers 404.
   *
   * @example
   * const page = await metamob.conversations.list();
   * const archived = await metamob.conversations.list({ status: "archived" }).all();
   */
  list(params: ConversationListParams = {}, options?: RequestOptions): ListRequest<Conversation> {
    return new ListRequest(this.#context.rest, METHODS["conversations.list"], { query: { status: params.status, limit: params.limit, offset: params.offset } }, options, topLevel<Conversation>);
  }

  /**
   * The messages and trade proposals exchanged with a user, most recent
   * first. Iterating walks back in time, page after page.
   *
   * `item.kind` is `"message"` or `"proposal"`.
   *
   * @example
   * for await (const item of metamob.conversations.messages("Ix-xs")) {
   *   if (item.kind === "message") console.log(`${item.sender}: ${item.content}`);
   *   else console.log(`trade ${item.status}: ${item.monsters_given.length} given`);
   * }
   *
   * // The 10 latest.
   * const latest = await metamob.conversations.messages("Ix-xs").take(10);
   */
  messages(username: string, params: MessagesParams = {}, options?: RequestOptions): ListRequest<ConversationItem> {
    return new ListRequest(
      this.#context.rest,
      METHODS["conversations.messages"],
      async () => ({ path: { username: text(username, "username") }, query: { limit: params.limit, before_id: params.beforeId } }),
      options,
      topLevel<ConversationItem>,
    );
  }
}

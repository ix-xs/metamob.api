import { MetamobArgumentError } from "../core/errors.js";
import { ListRequest, topLevel } from "../core/pagination.js";
import { type Context, type PageParams, text } from "../core/resource.js";
import type { RequestOptions } from "../core/rest.js";
import { METHODS } from "../generated/methods.js";
import type { Conversation, ConversationItem, ConversationMessage, MarkAsReadResult } from "../types.js";

const MESSAGE_LENGTH = 1000;

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
   * @example
   * const page = await metamob.conversations.list();
   * const unread = page.items.filter((conversation) => conversation.unread_count > 0);
   * const archived = await metamob.conversations.list({ status: "archived" }).all();
   */
  list(params: ConversationListParams = {}, options?: RequestOptions): ListRequest<Conversation> {
    return new ListRequest(this.#context.rest, METHODS["conversations.list"], { query: { status: params.status, limit: params.limit, offset: params.offset } }, options, topLevel<Conversation>);
  }

  /**
   * The messages and trade proposals exchanged with a user, most recent
   * first. Iterating walks back in time, page after page.
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

  /**
   * Marks as read every message received from a user, trade proposals
   * included, and answers how many were marked.
   *
   * @example
   * const { marked_count } = await metamob.conversations.markAsRead("Ix-xs");
   */
  async markAsRead(username: string, options?: RequestOptions): Promise<MarkAsReadResult> {
    const path = { username: text(username, "username") };
    return (await this.#context.rest.request<{ data: MarkAsReadResult }>(METHODS["conversations.markAsRead"], { path }, options)).data;
  }

  /**
   * Sends a private message to a user, 1000 characters at most, and answers it
   * as it appears in the conversation.
   *
   * Sending is closed by default: Metamob opens it account by account, on
   * request. Without it, or when one player blocked the other, the API answers
   * `FORBIDDEN`. A message is never retried: after a timeout or a network
   * failure, read the conversation before sending it again.
   *
   * @example
   * await metamob.conversations.send("Ix-xs", "Salut, ton Tofu Maléfique est toujours dispo ?");
   */
  async send(username: string, content: string, options?: RequestOptions): Promise<ConversationMessage> {
    const path = { username: text(username, "username") };
    if (typeof content !== "string" || !content.trim()) throw new MetamobArgumentError("`content` must be a non-empty string.");
    const length = [...content].length;
    if (length > MESSAGE_LENGTH) throw new MetamobArgumentError(`\`content\` is ${length} characters long: a message takes ${MESSAGE_LENGTH} at most.`);
    return (await this.#context.rest.request<{ data: ConversationMessage }>(METHODS["conversations.send"], { path, body: { content } }, options)).data;
  }
}

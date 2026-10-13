import type { MethodSpec, RequestInput, RequestOptions, Rest } from "./rest.js";

/** The `pagination` object of the API, in its two shapes: offset and cursor. */
export interface RawPagination {
  total?: number;
  limit?: number;
  offset?: number;
  has_more?: boolean;
  next_before_id?: number | null;
}

/** What a list method reads out of a response body. */
export interface Extracted<T, E> {
  items: T[];
  pagination?: RawPagination | undefined;
  /** What the response carries next to the items, for example the quest the monsters belong to. */
  extra?: E | undefined;
}

/** Reads a list whose items sit in `data` and whose pagination sits next to it. @internal */
export function topLevel<T>(body: unknown): Extracted<T, never> {
  const { data, pagination } = (body ?? {}) as { data?: T[]; pagination?: RawPagination };
  return { items: data ?? [], pagination };
}

/**
 * One page of results.
 *
 * @typeParam T - Item type.
 */
export class Page<T> implements Iterable<T> {
  /** Items of this page. */
  readonly items: T[];
  /**
   * Size of the whole result set, with the filters applied. Undefined for
   * the messages of a conversation, which the API walks with a cursor.
   */
  readonly total: number | undefined;
  /** Page size the API used. */
  readonly limit: number | undefined;
  /** Position of the first item of this page in the whole result set. */
  readonly offset: number | undefined;
  /**
   * For the messages of a conversation: the cursor of the next, older page.
   * Keep it to resume later with `{ beforeId }`. Undefined on the last page.
   */
  readonly nextBeforeId: number | undefined;
  /** The response body as the API sent it. */
  readonly raw: unknown;

  readonly #next: (() => Promise<Page<T>>) | undefined;

  /** @internal */
  constructor(raw: unknown, items: T[], pagination: RawPagination | undefined, next?: () => Promise<Page<T>>) {
    this.raw = raw;
    this.items = items;
    this.total = pagination?.total;
    this.limit = pagination?.limit;
    this.offset = pagination?.offset;
    this.nextBeforeId = pagination?.has_more ? (pagination.next_before_id ?? undefined) : undefined;
    this.#next = next;
  }

  /** Whether another page follows. */
  get hasNext(): boolean {
    return this.#next !== undefined;
  }

  /** Fetches the next page, or resolves to `null` on the last one. */
  async next(): Promise<this | null> {
    return this.#next ? (this.#next() as Promise<this>) : null;
  }

  /** Iterates the items of this page. */
  [Symbol.iterator](): IterableIterator<T> {
    return this.items[Symbol.iterator]();
  }
}

/** Options of {@link ListRequest.all} and {@link ListRequest.pages}. */
export interface CollectOptions {
  /**
   * Stop once this many items were fetched. Without it, every page is
   * fetched. `pages()` yields whole pages, so the last one can go past the limit.
   */
  limit?: number | undefined;
}

/**
 * What every paginated method returns. It is lazy: nothing is sent until you
 * await it or iterate it.
 *
 * - `await request` resolves to the first {@link Page}.
 * - `for await (const item of request)` walks every item of every page.
 * - `request.all()` collects the items into an array, `request.take(n)` the first `n`.
 *
 * When walking pages without an explicit `limit`, the largest page the
 * endpoint accepts is used, which costs the fewest requests.
 *
 * @typeParam T - Item type.
 * @typeParam E - What each page carries next to its items.
 *
 * @example
 * const page = await metamob.monsters.list({ type: "archimonstre" });
 * page.items, page.total;
 *
 * for await (const monster of metamob.monsters.list({ type: "archimonstre" })) {
 *   console.log(monster.name.fr);
 * }
 *
 * const firstTen = await metamob.monsters.list({ query: "tofu" }).take(10);
 */
export class ListRequest<T, E extends object = {}> implements PromiseLike<Page<T> & E>, AsyncIterable<T> {
  readonly #rest: Rest;
  readonly #spec: MethodSpec;
  readonly #source: RequestInput | (() => Promise<RequestInput>);
  readonly #options: RequestOptions | undefined;
  readonly #extract: (body: unknown) => Extracted<T, E>;
  #resolved: Promise<RequestInput> | undefined;

  /** @internal */
  constructor(rest: Rest, spec: MethodSpec, input: RequestInput | (() => Promise<RequestInput>), options: RequestOptions | undefined, extract: (body: unknown) => Extracted<T, E>) {
    this.#rest = rest;
    this.#spec = spec;
    this.#source = input;
    this.#options = options;
    this.#extract = extract;
  }

  /** The request, once anything it depends on (a name to resolve, for instance) is known. */
  #input(): Promise<RequestInput> {
    this.#resolved ??= typeof this.#source === "function" ? this.#source() : Promise.resolve(this.#source);
    return this.#resolved;
  }

  async #fetch(input: RequestInput): Promise<Page<T> & E> {
    const raw = await this.#rest.request<unknown>(this.#spec, input, this.#options);
    const { items, pagination, extra } = this.#extract(raw);
    let next: (() => Promise<Page<T>>) | undefined;
    if (items.length && pagination) {
      if (this.#spec.paged?.cursor) {
        const cursor = pagination.next_before_id;
        if (pagination.has_more && cursor != null) next = () => this.#fetch({ ...input, query: { ...input.query, before_id: cursor } });
      } else if (pagination.total !== undefined) {
        const offset = (pagination.offset ?? 0) + items.length;
        if (offset < pagination.total) next = () => this.#fetch({ ...input, query: { ...input.query, offset } });
      }
    }
    const page = new Page<T>(raw, items, pagination, next);
    return (extra ? Object.assign(page, extra) : page) as Page<T> & E;
  }

  /** Page size to use while walking: the one given by the caller, or the largest allowed. */
  #walk(input: RequestInput, limit: number | undefined): RequestInput {
    const max = this.#spec.paged?.max;
    if (!max || input.query?.limit !== undefined) return input;
    return { ...input, query: { ...input.query, limit: Math.max(1, Math.min(max, limit ?? max)) } };
  }

  /** Fetches the first page. */
  async page(): Promise<Page<T> & E> {
    return this.#fetch(await this.#input());
  }

  /** Walks the pages one by one. */
  async *pages(options: CollectOptions = {}): AsyncGenerator<Page<T> & E, void, undefined> {
    const limit = options.limit ?? Number.POSITIVE_INFINITY;
    if (limit <= 0) return;
    let seen = 0;
    let page: (Page<T> & E) | null = await this.#fetch(this.#walk(await this.#input(), options.limit));
    while (page) {
      yield page;
      seen += page.items.length;
      // The page that reaches the limit is the last one fetched.
      if (seen >= limit) return;
      page = await page.next();
    }
  }

  /** Collects items across pages into an array. */
  async all(options: CollectOptions = {}): Promise<T[]> {
    const limit = options.limit ?? Number.POSITIVE_INFINITY;
    const out: T[] = [];
    if (limit <= 0) return out;
    for await (const page of this.pages(options)) {
      for (const item of page.items) {
        out.push(item);
        if (out.length >= limit) return out;
      }
    }
    return out;
  }

  /** The first `limit` items, across as many pages as it takes. */
  take(limit: number): Promise<T[]> {
    return this.all({ limit });
  }

  /** Resolves to the first item, or `undefined` when there is none. Asks the API for a single item. */
  async first(): Promise<T | undefined> {
    const input = await this.#input();
    const sized = this.#spec.paged && input.query?.limit === undefined ? { ...input, query: { ...input.query, limit: 1 } } : input;
    return (await this.#fetch(sized)).items[0];
  }

  /**
   * How many items the list holds with its filters, without fetching them:
   * one request for a single item, then the total the API reports.
   * Undefined for the messages of a conversation.
   */
  async count(): Promise<number | undefined> {
    const input = await this.#input();
    return (await this.#fetch({ ...input, query: { ...input.query, limit: 1, offset: undefined } })).total;
  }

  async *[Symbol.asyncIterator](): AsyncGenerator<T, void, undefined> {
    for await (const page of this.pages()) yield* page.items;
  }

  then<A = Page<T> & E, B = never>(onfulfilled?: ((page: Page<T> & E) => A | PromiseLike<A>) | null, onrejected?: ((reason: unknown) => B | PromiseLike<B>) | null): Promise<A | B> {
    return this.page().then(onfulfilled, onrejected);
  }

  catch<B = never>(onrejected?: ((reason: unknown) => B | PromiseLike<B>) | null): Promise<(Page<T> & E) | B> {
    return this.page().catch(onrejected);
  }

  finally(onfinally?: (() => void) | null): Promise<Page<T> & E> {
    return this.page().finally(onfinally);
  }
}

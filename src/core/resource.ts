import { MetamobArgumentError } from "./errors.js";
import type { Resolver } from "./resolve.js";
import type { Rest } from "./rest.js";

/** @internal */
export interface Context {
  readonly rest: Rest;
  readonly resolve: Resolver;
}

/** Page size and starting point of a paginated list. */
export interface PageParams {
  /**
   * Items per page. Left out, a single page uses the API's default and a walk
   * (`for await`, `.all()`) uses the largest page the endpoint accepts.
   */
  limit?: number | undefined;
  /** Items to skip before the first one. Default 0. */
  offset?: number | undefined;
}

export function text(value: unknown, name: string): string {
  if (typeof value !== "string" || !value.trim()) throw new MetamobArgumentError(`\`${name}\` must be a non-empty string.`);
  return value.trim();
}

export function searchTerm(value: unknown, name = "query"): string {
  const term = text(value, name);
  if (term.length < 3) throw new MetamobArgumentError(`\`${name}\` must be at least 3 characters long: the API does not search for less.`);
  return term;
}

export function count(value: unknown, name: string): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0) throw new MetamobArgumentError(`\`${name}\` must be a whole number, 0 or more.`);
  return value;
}

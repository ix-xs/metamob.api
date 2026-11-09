/** The `code` of every error this library throws. */
export type MetamobErrorCode =
  | "API_ERROR"
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "SERVER_ERROR"
  | "TIMEOUT"
  | "NETWORK"
  | "ABORTED"
  | "PARSE_ERROR"
  | "MISSING_API_KEY"
  | "INVALID_ARGUMENT"
  | "UNKNOWN_NAME";

/** Base class of everything thrown by this library. */
export class MetamobError extends Error {
  /** Stable code, safe to switch on. */
  readonly code: MetamobErrorCode;

  constructor(code: MetamobErrorCode, message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "MetamobError";
    this.code = code;
  }
}

export interface ApiErrorInit {
  status: number;
  message: string;
  method: string;
  url: string;
  messages?: Record<string, string> | undefined;
  retryAfter?: number | undefined;
  body?: unknown;
}

/**
 * The API answered with an error status.
 *
 * @example
 * try {
 *   await metamob.users.get("nobody");
 * } catch (error) {
 *   if (error instanceof MetamobApiError && error.isNotFound) {
 *     // no such user, or their account was deleted
 *   }
 * }
 */
export class MetamobApiError extends MetamobError {
  /** HTTP status code. */
  readonly status: number;
  /** Method that failed, for example `users.get`. */
  readonly method: string;
  /** Request URL, without the API key. */
  readonly url: string;
  /** What the API said, keyed by field. A general error sits under `error`. */
  readonly messages: Record<string, string>;
  /** Seconds to wait before retrying, when the API said so. */
  readonly retryAfter: number | undefined;
  /** Parsed response body, when there was one. */
  readonly body: unknown;

  constructor(init: ApiErrorInit) {
    super(codeFor(init.status), `${init.method}: ${init.message}`);
    this.name = "MetamobApiError";
    this.status = init.status;
    this.method = init.method;
    this.url = init.url;
    this.messages = init.messages ?? {};
    this.retryAfter = init.retryAfter;
    this.body = init.body;
  }

  /** The resource does not exist, or is not yours to see. */
  get isNotFound(): boolean {
    return this.code === "NOT_FOUND";
  }

  /** Too many requests with this key. Retry after `retryAfter` seconds. */
  get isRateLimited(): boolean {
    return this.code === "RATE_LIMITED";
  }

  /** The API key is missing, wrong, revoked, or its account was deleted. */
  get isUnauthorized(): boolean {
    return this.code === "UNAUTHORIZED";
  }
}

function codeFor(status: number): MetamobErrorCode {
  if (status === 429) return "RATE_LIMITED";
  if (status === 400 || status === 422) return "BAD_REQUEST";
  if (status === 401) return "UNAUTHORIZED";
  if (status === 403) return "FORBIDDEN";
  if (status === 404) return "NOT_FOUND";
  if (status === 409) return "CONFLICT";
  if (status >= 500) return "SERVER_ERROR";
  return "API_ERROR";
}

/** The request never produced a usable response: timeout, network failure, abort or unreadable body. */
export class MetamobRequestError extends MetamobError {
  /** Method that failed, for example `monsters.list`. */
  readonly method: string;

  constructor(code: "TIMEOUT" | "NETWORK" | "ABORTED" | "PARSE_ERROR", method: string, message: string, options?: { cause?: unknown }) {
    super(code, `${method}: ${message}`, options);
    this.name = "MetamobRequestError";
    this.method = method;
  }
}

/**
 * Thrown before the call it is about is sent: an invalid argument, a missing
 * API key, or a name that matches no monster, zone or server.
 */
export class MetamobArgumentError extends MetamobError {
  /** For an unknown name (`code === "UNKNOWN_NAME"`), the closest existing names, best first. */
  readonly suggestions: readonly string[];

  constructor(message: string, options?: { code?: "INVALID_ARGUMENT" | "UNKNOWN_NAME" | "MISSING_API_KEY"; suggestions?: readonly string[] }) {
    super(options?.code ?? "INVALID_ARGUMENT", message);
    this.name = "MetamobArgumentError";
    this.suggestions = options?.suggestions ?? [];
  }
}

/**
 * Type guard for errors thrown by this library, optionally narrowed to a code.
 *
 * @example
 * if (isMetamobError(error, "NOT_FOUND")) return reply("No such player.");
 */
export function isMetamobError(error: unknown, code?: MetamobErrorCode): error is MetamobError {
  return error instanceof MetamobError && (code === undefined || error.code === code);
}

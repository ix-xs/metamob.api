/** One endpoint of the API, as the library exposes it. See api.config.mjs. */
export interface MethodConfig {
  id: string;
  verb: "GET" | "PATCH" | "POST";
  path: string;
  scope: "public" | "account";
  call: string;
  summary: string;
  guide: string;
  paged?: { max: number; cursor?: boolean };
  /** A write that creates something: sending it twice would create it twice, so it is never retried. */
  once?: boolean;
}

export declare const methods: MethodConfig[];

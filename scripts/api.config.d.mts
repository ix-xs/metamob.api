/** One endpoint of the API. See api.config.mjs. */
export interface MethodConfig {
  id: string;
  verb: "GET" | "PATCH" | "POST";
  path: string;
  scope: "public" | "account";
  call: string;
  summary: string;
  guide: string;
  paged?: { max: number; cursor?: boolean };
  /** A write that creates something, never retried. */
  once?: boolean;
}

export declare const methods: MethodConfig[];

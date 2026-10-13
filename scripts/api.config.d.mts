/** One endpoint of the API, as the library exposes it. See api.config.mjs. */
export interface MethodConfig {
  id: string;
  verb: "GET" | "PATCH";
  path: string;
  scope: "public" | "account";
  call: string;
  summary: string;
  guide: string;
  paged?: { max: number; cursor?: boolean };
}

export declare const methods: MethodConfig[];

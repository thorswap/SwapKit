import type { Options } from "ky";
import ky from "ky";
import type { ApiV1Error } from "../types/errors/apiV1.ts";

let kyClient: typeof ky;
let kyClientWithErrors: typeof ky;

export const defaultRequestHeaders =
  typeof window !== "undefined"
    ? ({} as Record<string, string>)
    : { referrer: "https://sk.thorswap.net", referer: "https://sk.thorswap.net" };

export function setRequestClientConfig({ apiKey, ...config }: Options & { apiKey?: string }) {
  kyClient = ky.create({
    ...config,
    headers: { ...defaultRequestHeaders, ...config.headers, "x-api-key": apiKey },
  });
}

function isApiV1Error(error: unknown): error is ApiV1Error {
  return (
    (error as ApiV1Error).status !== undefined &&
    (error as ApiV1Error).type !== undefined &&
    (error as ApiV1Error).code !== undefined &&
    (error as ApiV1Error).module !== undefined &&
    (error as ApiV1Error).complete !== undefined &&
    (error as ApiV1Error).identifier !== undefined &&
    (error as ApiV1Error).message !== undefined
  );
}

function getKyClient() {
  if (kyClient) return kyClient;
  kyClient = ky.create({ headers: defaultRequestHeaders });
  return kyClient;
}

function getKyClientWithErrors() {
  if (kyClientWithErrors) return kyClientWithErrors;
  kyClientWithErrors = ky.create({
    headers: defaultRequestHeaders,
    hooks: {
      afterResponse: [
        async (_request, _options, response) => {
          const body = await response.json();

          if (isApiV1Error(body)) {
            return new Response(JSON.stringify(body), { status: 200 });
          }

          return new Response(body, { status: 200 });
        },
      ],
    },
  });
  return kyClientWithErrors;
}

export const RequestClient = {
  get: <T>(url: string | URL | Request, options?: Options) =>
    getKyClient().get(url, options).json<T>(),
  post: <T>(url: string | URL | Request, options?: Options) =>
    getKyClient().post(url, options).json<T>(),
};

/**
 * This client returns known errors as JSON objects without throwing an error.
 * This means the HTTP code will be 200, and the response will be the error object.
 */
export const RequestClientWithErrors = {
  get: <T>(url: string | URL | Request, options?: Options) =>
    getKyClientWithErrors().get(url, options).json<T>(),
  post: <T>(url: string | URL | Request, options?: Options) =>
    getKyClientWithErrors().post(url, options).json<T>(),
};

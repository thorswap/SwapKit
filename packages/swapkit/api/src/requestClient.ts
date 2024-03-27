import type { Options } from "ky";
import ky from "ky";

let kyClient: typeof ky;

export const defaultRequestHeaders =
  typeof window !== "undefined"
    ? ({} as Record<string, string>)
    : { referrer: "https://sk.thorswap.net", referer: "https://sk.thorswap.net" };

const getKyClient = () => {
  if (kyClient) return kyClient;

  kyClient = ky.create({ headers: defaultRequestHeaders });

  return kyClient;
};

export const setRequestClientConfig = ({ apiKey, ...config }: Options & { apiKey?: string }) => {
  kyClient = ky.create({
    ...config,
    headers: { ...defaultRequestHeaders, ...config.headers, "x-api-key": apiKey },
  });
};

export const RequestClient = {
  get: <T>(url: string | URL | Request, options?: Options) =>
    getKyClient().get(url, options).json<T>(),
  post: <T>(url: string | URL | Request, options?: Options) =>
    getKyClient().post(url, options).json<T>(),
};

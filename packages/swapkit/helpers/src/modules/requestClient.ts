import type { KyInstance, Options } from "ky";
import ky from "ky";

let kyClientConfig: Options & { apiKey?: string } = {};

export const defaultRequestHeaders =
  typeof window !== "undefined"
    ? ({} as Record<string, string>)
    : { referrer: "https://sk.thorswap.net", referer: "https://sk.thorswap.net" };

export function setRequestClientConfig({ apiKey, ...config }: Options & { apiKey?: string }) {
  kyClientConfig = { ...config, apiKey };
}

function getKyClient() {
  const { apiKey, ...config } = kyClientConfig;
  return ky.create({
    ...config,
    headers: { ...defaultRequestHeaders, ...config.headers, "x-api-key": apiKey },
  });
}

const getTypedBaseRequestClient = (ky: KyInstance) => ({
  get: async <T>(url: string | URL | Request, options?: Options) =>
    (await ky.get(url, options)).json<T>(),
  post: async <T>(url: string | URL | Request, options?: Options) =>
    (await ky.post(url, options)).json<T>(),
});

export const RequestClient = {
  ...getTypedBaseRequestClient(getKyClient()),
  extend: (options: Options) => {
    const extendedClient = getKyClient().extend(options);
    return {
      ...getTypedBaseRequestClient(extendedClient),
      extend: RequestClient.extend,
    };
  },
};

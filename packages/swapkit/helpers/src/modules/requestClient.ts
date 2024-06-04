import type { KyInstance, Options } from "ky";
import ky from "ky";

let kyClient: typeof ky;

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

function getKyClient() {
  if (kyClient) return kyClient;
  kyClient = ky.create({ headers: defaultRequestHeaders });
  return kyClient;
}

const getTypedBaseRequestClient = (ky: KyInstance) => ({
  get: <T>(url: string | URL | Request, options?: Options) => ky.get(url, options).json<T>(),
  post: <T>(url: string | URL | Request, options?: Options) => ky.post(url, options).json<T>(),
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

type Options = {
  headers?: Record<string, string>;
  apiKey?: string;
  method?: "GET" | "POST";
  onError?: (error: NotWorth) => NotWorth;
  responseHandler?: (response: NotWorth) => NotWorth;
  [key: string]: NotWorth;
};

let clientConfig: Options = {};

export const defaultRequestHeaders =
  typeof window !== "undefined"
    ? ({} as Record<string, string>)
    : { referrer: "https://sk.thorswap.net", referer: "https://sk.thorswap.net" };

export function setRequestClientConfig({ apiKey, ...config }: Options) {
  clientConfig = { ...config, apiKey };
}

async function fetchWithConfig(url: string, options: Options = {}) {
  const { apiKey, ...config } = clientConfig;
  const headers = { ...defaultRequestHeaders, ...config.headers, ...options.headers };

  if (apiKey) headers["x-api-key"] = apiKey;

  try {
    const response = await fetch(url, { ...config, ...options, headers });
    const body = await response.json();

    if (options.responseHandler) return options.responseHandler(body);

    return body;
  } catch (error) {
    if (options.onError) return options.onError(error);

    console.error(error);
  }
}

export const RequestClient = {
  get: async <T>(url: string, options?: Options): Promise<T> =>
    fetchWithConfig(url, { ...options, method: "GET" }),
  post: async <T>(url: string, options?: Options): Promise<T> =>
    fetchWithConfig(url, { ...options, method: "POST" }),
  extend: (options: Options) => {
    const extendedConfig = { ...clientConfig, ...options };
    return {
      get: async <T>(url: string, options?: Options): Promise<T> =>
        fetchWithConfig(url, { ...extendedConfig, ...options, method: "GET" }),
      post: async <T>(url: string, options?: Options): Promise<T> =>
        fetchWithConfig(url, { ...extendedConfig, ...options, method: "POST" }),
      extend: (newOptions: Options) => RequestClient.extend({ ...extendedConfig, ...newOptions }),
    };
  },
};

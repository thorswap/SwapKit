import { createSwapKit } from "@swapkit/sdk";

export type SwapKitClient = ReturnType<typeof createSwapKit>;

const clientCache = new Map<string, SwapKitClient>();

export const getSwapKitClient = (
  params: {
    ethplorerApiKey?: string;
    covalentApiKey?: string;
    blockchairApiKey?: string;
    walletConnectProjectId?: string;
    stagenet?: boolean;
    brokerEndpoint?: string;
  } = {},
) => {
  const key = JSON.stringify(params);

  if (clientCache.has(key)) {
    return clientCache.get(key);
  }

  const client = createSwapKit({
    stagenet: params.stagenet,
    config: {
      ...params,
      keepkeyConfig: {
        apiKey: localStorage.getItem("keepkeyApiKey") || "1234",
        pairingInfo: {
          name: "swapKit-demo-app",
          imageUrl:
            "https://repository-images.githubusercontent.com/587472295/feec8a61-39b2-4615-b293-145e97f49b5a",
          basePath: "http://localhost:1646/spec/swagger.json",
          url: "http://localhost:1646",
        },
      },
    },
  });

  clientCache.set(key, client);

  return client;
};

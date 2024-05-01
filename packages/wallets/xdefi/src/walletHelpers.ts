import {
  type AssetValue,
  Chain,
  type ChainId,
  ChainToChainId,
  EVMChains,
  type FeeOption,
  RPCUrl,
  erc20ABI,
} from "@swapkit/helpers";
import type { TransferParams } from "@swapkit/toolbox-cosmos";
import type {
  ApproveParams,
  BrowserProvider,
  CallParams,
  EVMTxParams,
  Eip1193Provider,
} from "@swapkit/toolbox-evm";

type TransactionMethod = "transfer" | "deposit";

type TransactionParams = {
  asset: string | { chain: string; symbol: string; ticker: string };
  amount: number | string | { amount: number; decimals?: number };
  decimal?: number;
  recipient: string;
  memo?: string;
};

export type WalletTxParams = {
  feeOptionKey?: FeeOption;
  from?: string;
  memo?: string;
  recipient: string;
  assetValue: AssetValue;
  gasLimit?: string | bigint | undefined;
};

function getXDEFIProvider(chain: Chain) {
  switch (chain) {
    case Chain.Ethereum:
    case Chain.Avalanche:
    case Chain.BinanceSmartChain:
    case Chain.Arbitrum:
    case Chain.Optimism:
    case Chain.Polygon:
      return window.xfi?.ethereum;
    case Chain.Binance:
      return window.xfi?.binance;
    case Chain.Bitcoin:
      return window.xfi?.bitcoin;
    case Chain.BitcoinCash:
      return window.xfi?.bitcoincash;
    case Chain.Dogecoin:
      return window.xfi?.dogecoin;
    case Chain.Litecoin:
      return window.xfi?.litecoin;
    case Chain.THORChain:
      return window.xfi?.thorchain;
    case Chain.Maya:
      return window.xfi?.mayachain;
    case Chain.Cosmos:
    case Chain.Kujira:
      // @ts-ignore
      return window.xfi?.keplr;
    default:
      return undefined;
  }
}

async function transaction({
  method,
  params,
  chain,
}: {
  method: TransactionMethod;
  params: TransactionParams[];
  chain: Chain;
}): Promise<string> {
  const client =
    method === "deposit"
      ? chain === Chain.Maya
        ? window.xfi?.mayachain
        : window.xfi?.thorchain
      : getXDEFIProvider(chain);

  return new Promise<string>((resolve, reject) => {
    if (client && "request" in client) {
      // @ts-ignore
      client.request({ method, params }, (err: string, tx: string) => {
        err ? reject(err) : resolve(tx);
      });
    }
  });
}

export async function getXDEFIAddress(chain: Chain) {
  const eipProvider = getXDEFIProvider(chain) as Eip1193Provider;
  if (!eipProvider) throw new Error(`${chain}: XDEFI provider is not defined`);

  if ([Chain.Cosmos, Chain.Kujira].includes(chain)) {
    const provider = getXDEFIProvider(Chain.Cosmos);
    if (!provider || "request" in provider) {
      throw new Error(`${chain}: XDEFI provider is not defined`);
    }

    // Enabling before using the Keplr is recommended.
    // This method will ask the user whether to allow access if they haven't visited this website.
    // Also, it will request that the user unlock the wallet if the wallet is locked.
    const chainId = ChainToChainId[chain];
    await provider.enable(chainId);

    const offlineSigner = provider.getOfflineSigner(chainId);

    const [item] = await offlineSigner.getAccounts();

    return item?.address;
  }

  // @ts-expect-error
  if (EVMChains.includes(chain)) {
    const response = await eipProvider.request({
      method: "eth_requestAccounts",
      params: [],
    });

    return response[0];
  }

  return new Promise((resolve, reject) =>
    eipProvider.request(
      { method: "request_accounts", params: [] },
      // @ts-expect-error
      (error: Todo, response: string[]) => (error ? reject(error) : resolve(response[0])),
    ),
  );
}

export async function walletTransfer(
  { assetValue, recipient, memo, gasLimit }: WalletTxParams & { assetValue: AssetValue },
  method: TransactionMethod = "transfer",
) {
  if (!assetValue) throw new Error("Asset is not defined");

  /**
   * EVM requires amount to be hex string
   * UTXO/Cosmos requires amount to be number
   */

  const from = await getXDEFIAddress(assetValue.chain);
  const params = [
    {
      amount: {
        amount: assetValue.getBaseValue("number"),
        decimals: assetValue.decimal,
      },
      asset: {
        chain: assetValue.chain,
        symbol: assetValue.symbol.toUpperCase(),
        ticker: assetValue.symbol.toUpperCase(),
      },
      memo,
      from,
      recipient,
      gasLimit,
    },
  ];

  return transaction({ method, params, chain: assetValue.chain });
}

export function cosmosTransfer({
  chainId,
  rpcUrl,
}: {
  chainId: ChainId.Cosmos | ChainId.Kujira;
  rpcUrl?: string;
}) {
  return async ({ from, recipient, assetValue, memo }: TransferParams) => {
    const { createSigningStargateClient } = await import("@swapkit/toolbox-cosmos");
    // @ts-ignore
    const offlineSigner = window.xfi?.keplr?.getOfflineSignerOnlyAmino(chainId);
    const cosmJS = await createSigningStargateClient(rpcUrl || RPCUrl.Cosmos, offlineSigner);

    const coins = [
      {
        denom: assetValue?.symbol === "MUON" ? "umuon" : "uatom",
        amount: assetValue.getBaseValue("string"),
      },
    ];

    const { transactionHash } = await cosmJS.sendTokens(from, recipient, coins, 2, memo);
    return transactionHash;
  };
}

export function getXdefiMethods(provider: BrowserProvider) {
  return {
    call: async <T>({
      contractAddress,
      abi,
      funcName,
      funcParams = [],
      txOverrides,
    }: CallParams): Promise<T> => {
      const contractProvider = provider;
      if (!contractAddress) throw new Error("contractAddress must be provided");
      const { createContract, createContractTxObject, isStateChangingCall, toHexString } =
        await import("@swapkit/toolbox-evm");

      const isStateChanging = isStateChangingCall(abi, funcName);

      if (isStateChanging) {
        const { value, from, to, data } = await createContractTxObject(contractProvider, {
          contractAddress,
          abi,
          funcName,
          funcParams,
          txOverrides,
        });

        return provider.send("eth_sendTransaction", [
          {
            value: toHexString(BigInt(value || 0)),
            from,
            to,
            data: data || "0x",
          } as Todo,
        ]);
      }
      const contract = createContract(contractAddress, abi, contractProvider);

      const result = await contract[funcName]?.(...funcParams);

      return typeof result?.hash === "string" ? result?.hash : result;
    },
    approve: async ({ assetAddress, spenderAddress, amount, from }: ApproveParams) => {
      const { MAX_APPROVAL, createContractTxObject, toHexString } = await import(
        "@swapkit/toolbox-evm"
      );
      const funcParams = [spenderAddress, BigInt(amount || MAX_APPROVAL)];
      const txOverrides = { from };

      const functionCallParams = {
        contractAddress: assetAddress,
        abi: erc20ABI,
        funcName: "approve",
        funcParams,
        txOverrides,
      };

      const { value, to, data } = await createContractTxObject(provider, functionCallParams);

      return provider.send("eth_sendTransaction", [
        {
          value: toHexString(BigInt(value || 0)),
          from,
          to,
          data: data || "0x",
        } as Todo,
      ]);
    },
    sendTransaction: async (tx: EVMTxParams) => {
      const { from, to, data, value } = tx;
      if (!to) throw new Error("No to address provided");

      const { toHexString } = await import("@swapkit/toolbox-evm");

      return provider.send("eth_sendTransaction", [
        {
          value: toHexString(BigInt(value || 0)),
          from,
          to,
          data: data || "0x",
        } as Todo,
      ]);
    },
  };
}

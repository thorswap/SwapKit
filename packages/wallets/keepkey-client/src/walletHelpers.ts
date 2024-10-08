import type { Keplr } from "@keplr-wallet/types";
import {
  type AssetValue,
  Chain,
  type ChainId,
  type EVMChain,
  EVMChains,
  type FeeOption,
  RPCUrl,
  SwapKitError,
  WalletOption,
  erc20ABI,
} from "@swapkit/helpers";
import { type TransferParams, getDenom } from "@swapkit/toolbox-cosmos";
import type {
  ApproveParams,
  BrowserProvider,
  CallParams,
  EVMTxParams,
  Eip1193Provider,
} from "@swapkit/toolbox-evm";
import type { SolanaProvider } from "@swapkit/toolbox-solana";

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

export const getProviderNameFromChain = (chain: Chain): string => {
  switch (chain) {
    case Chain.Bitcoin:
      return "bitcoin";
    case Chain.BitcoinCash:
      return "bitcoincash";
    case Chain.Dash:
      return "dash";
    case Chain.Dogecoin:
      return "dogecoin";
    case Chain.Litecoin:
      return "litecoin";
    default:
      throw new Error("Unsupported chain");
  }
};

export function getKEEPKEYProvider<T extends Chain>(
  chain: T,
): T extends Chain.Solana
  ? SolanaProvider
  : T extends Chain.Cosmos
    ? Keplr
    : T extends EVMChain
      ? Eip1193Provider
      : undefined {
  console.log("window: ", window);
  console.log("window: ", window?.ethereum);
  if (!window.keepkey) throw new SwapKitError("wallet_KEEPKEY_not_found");

  switch (chain) {
    case Chain.Ethereum:
    case Chain.Base:
    case Chain.Avalanche:
    case Chain.BinanceSmartChain:
    case Chain.Arbitrum:
    case Chain.Optimism:
    case Chain.Polygon:
      // @ts-expect-error
      return window.keepkey.ethereum;

    // case Chain.Osmosis:
    case Chain.Cosmos:
      // case Chain.Kujira:
      // @ts-expect-error
      return window.keepkey.keplr;

    case Chain.Bitcoin:
      // @ts-expect-error
      return window.keepkey.bitcoin;
    case Chain.BitcoinCash:
      // @ts-expect-error
      return window.keepkey.bitcoincash;
    case Chain.Dogecoin:
      // @ts-expect-error
      return window.keepkey.dogecoin;
    case Chain.Litecoin:
      // @ts-expect-error
      return window.keepkey.litecoin;
    case Chain.Dash:
      // @ts-expect-error
      return window.keepkey.dash;
    case Chain.THORChain:
      // @ts-expect-error
      return window.keepkey.thorchain;
    case Chain.Maya:
      // @ts-expect-error
      return window.keepkey.mayachain;
    // case Chain.Solana:
    //   // @ts-expect-error
    //   return window.keepkey.solana;

    default:
      // @ts-expect-error
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
  const client = getKEEPKEYProvider(chain);

  return new Promise<string>((resolve, reject) => {
    if (client && "request" in client) {
      // @ts-ignore
      client.request({ method, params }, (err: string, tx: string) => {
        err ? reject(err) : resolve(tx);
      });
    }
  });
}

export async function getKEEPKEYAddress(chain: Chain) {
  console.log("getKEEPKEYAddress: ", chain);
  const eipProvider = getKEEPKEYProvider(chain) as Eip1193Provider;
  if (!eipProvider) {
    throw new SwapKitError({
      errorKey: "wallet_provider_not_found",
      info: { wallet: WalletOption.KEEPKEY, chain },
    });
  }

  let method = "request_accounts";
  if (EVMChains.includes(chain as EVMChain)) {
    method = "eth_requestAccounts";
  }

  const [response] = await eipProvider.request({ method, params: [] });

  return response;
}

export async function walletTransfer(
  { assetValue, recipient, memo, gasLimit }: WalletTxParams & { assetValue: AssetValue },
  method: TransactionMethod = "transfer",
) {
  if (!assetValue) {
    throw new SwapKitError("wallet_KEEPKEY_asset_not_defined");
  }

  /**
   * EVM requires amount to be hex string
   * UTXO/Cosmos requires amount to be number
   */
  // const chainId = ChainToChainId[chain];
  const from = await getKEEPKEYAddress(assetValue.chain);
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
    const offlineSigner = window.keepkey?.cosmos?.getOfflineSignerOnlyAmino(chainId);
    const cosmJS = await createSigningStargateClient(rpcUrl || RPCUrl.Cosmos, offlineSigner);

    const coins = [
      {
        denom: getDenom(assetValue.symbol).toLowerCase(),
        amount: assetValue.getBaseValue("string"),
      },
    ];

    try {
      const { transactionHash } = await cosmJS.sendTokens(from, recipient, coins, 2, memo);
      return transactionHash;
    } catch (error) {
      throw new SwapKitError("core_transaction_failed", { error });
    }
  };
}

export function getKEEPKEYMethods(provider: BrowserProvider) {
  return {
    call: async <T>({
      contractAddress,
      abi,
      funcName,
      funcParams = [],
      txOverrides,
    }: CallParams): Promise<T> => {
      const contractProvider = provider;
      if (!contractAddress) {
        throw new SwapKitError("wallet_KEEPKEY_contract_address_not_provided");
      }
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
      if (!to) {
        throw new SwapKitError("wallet_KEEPKEY_send_transaction_no_address");
      }

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

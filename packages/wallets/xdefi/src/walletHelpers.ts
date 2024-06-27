import type { Keplr } from "@keplr-wallet/types";
import {
  type AssetValue,
  Chain,
  type ChainId,
  ChainToChainId,
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

export function getXDEFIProvider<T extends Chain>(
  chain: T,
): T extends Chain.Solana
  ? SolanaProvider
  : T extends Chain.Cosmos | Chain.Kujira
    ? Keplr
    : T extends EVMChain
      ? Eip1193Provider
      : undefined {
  if (!window.xfi) throw new SwapKitError("wallet_xdefi_not_found");

  switch (chain) {
    case Chain.Ethereum:
    case Chain.Avalanche:
    case Chain.BinanceSmartChain:
    case Chain.Arbitrum:
    case Chain.Optimism:
    case Chain.Polygon:
      // @ts-expect-error
      return window.xfi.ethereum;

    case Chain.Cosmos:
    case Chain.Kujira:
      // @ts-expect-error
      return window.xfi.keplr;

    case Chain.Binance:
      // @ts-expect-error
      return window.xfi.binance;
    case Chain.Bitcoin:
      // @ts-expect-error
      return window.xfi.bitcoin;
    case Chain.BitcoinCash:
      // @ts-expect-error
      return window.xfi.bitcoincash;
    case Chain.Dogecoin:
      // @ts-expect-error
      return window.xfi.dogecoin;
    case Chain.Litecoin:
      // @ts-expect-error
      return window.xfi.litecoin;
    case Chain.THORChain:
      // @ts-expect-error
      return window.xfi.thorchain;
    case Chain.Maya:
      // @ts-expect-error
      return window.xfi.mayachain;
    case Chain.Solana:
      // @ts-expect-error
      return window.xfi.solana;

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
  const client = getXDEFIProvider(chain);

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
  if (!eipProvider) {
    throw new SwapKitError({
      errorKey: "wallet_provider_not_found",
      info: { wallet: WalletOption.XDEFI, chain },
    });
  }

  if ([Chain.Cosmos, Chain.Kujira].includes(chain)) {
    const provider = getXDEFIProvider(Chain.Cosmos);
    if (!provider || "request" in provider) {
      throw new SwapKitError({
        errorKey: "wallet_provider_not_found",
        info: { wallet: WalletOption.XDEFI, chain },
      });
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

  if (EVMChains.includes(chain as EVMChain)) {
    const [response] = await eipProvider.request({ method: "eth_requestAccounts", params: [] });

    return response;
  }

  if (chain === Chain.Solana) {
    const provider = getXDEFIProvider(Chain.Solana);

    const accounts = await provider.connect();
    return accounts.publicKey.toString();
  }

  return new Promise((resolve, reject) =>
    eipProvider.request(
      { method: "request_accounts", params: [] },
      // @ts-expect-error
      (error: Todo, [response]: string[]) => (error ? reject(error) : resolve(response)),
    ),
  );
}

export async function walletTransfer(
  { assetValue, recipient, memo, gasLimit }: WalletTxParams & { assetValue: AssetValue },
  method: TransactionMethod = "transfer",
) {
  if (!assetValue) {
    throw new SwapKitError("wallet_xdefi_asset_not_defined");
  }

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
        denom: getDenom(`u${assetValue.symbol}`).toLowerCase(),
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
      if (!contractAddress) {
        throw new SwapKitError("wallet_xdefi_contract_address_not_provided");
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
        throw new SwapKitError("wallet_xdefi_send_transaction_no_address");
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

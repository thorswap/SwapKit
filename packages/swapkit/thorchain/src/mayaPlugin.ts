import {
  type EvmTransactionDetails,
  type QuoteRouteV2,
  SwapKitApi,
  type SwapWithRouteParams,
} from "@swapkit/api";
import {
  ApproveMode,
  type ApproveReturnType,
  AssetValue,
  type BaseWallet,
  Chain,
  type EVMChain,
  type ErrorKeys,
  SwapKitError,
  type SwapParams,
  TCAvalancheDepositABI,
  TCEthereumVaultAbi,
} from "@swapkit/helpers";
import type { CosmosWallets, ThorchainWallets } from "@swapkit/toolbox-cosmos";
import type { EVMWallets } from "@swapkit/toolbox-evm";
import type { SubstrateWallets } from "@swapkit/toolbox-substrate";
import type { UTXOWallets } from "@swapkit/toolbox-utxo";
import type { CoreTxParams } from "./plugin";

type Wallet = BaseWallet<
  EVMWallets & CosmosWallets & ThorchainWallets & UTXOWallets & SubstrateWallets
>;

const validateAddressType = ({
  chain,
  address,
}: {
  chain: Chain;
  address?: string;
}) => {
  if (!address) return false;

  switch (chain) {
    case Chain.Bitcoin:
      // filter out taproot addresses
      return !address.startsWith("bc1p");
    default:
      return true;
  }
};

const getAddress = (wallet: Wallet, chain: Chain) => wallet[chain]?.address || "";

const prepareTxParams = (
  wallets: Wallet,
  { assetValue, ...restTxParams }: CoreTxParams & { router?: string },
) => ({
  ...restTxParams,
  memo: restTxParams.memo || "",
  from: getAddress(wallets, assetValue.chain),
  assetValue,
});

const plugin = ({ wallets, stagenet = false }: { wallets: Wallet; stagenet?: boolean }) => {
  /**
   * @Private
   * Wallet interaction helpers
   */
  async function approve<T extends ApproveMode>({
    assetValue,
    type = "checkOnly" as T,
    contractAddress,
  }: {
    type: T;
    assetValue: AssetValue;
    contractAddress?: string;
  }) {
    const { address, chain, isGasAsset, isSynthetic } = assetValue;
    const isEVMChain = [Chain.Ethereum, Chain.Arbitrum].includes(chain);
    const isNativeEVM = isEVMChain && isGasAsset;

    if (isNativeEVM || !isEVMChain || isSynthetic) {
      return Promise.resolve(type === "checkOnly" ? true : "approved") as ApproveReturnType<T>;
    }

    const walletMethods = wallets[chain as Chain.Ethereum | Chain.Arbitrum];

    const walletAction = type === "checkOnly" ? walletMethods?.isApproved : walletMethods?.approve;
    if (!walletAction) {
      throw new SwapKitError("core_wallet_connection_not_found");
    }

    const from = walletMethods?.address;

    if (!(address && from)) {
      throw new SwapKitError("core_approve_asset_address_or_from_not_found");
    }

    const spenderAddress =
      contractAddress || ((await getInboundDataByChain(chain)).router as string);

    return walletAction({
      amount: assetValue.getBaseValue("bigint"),
      assetAddress: address,
      from,
      spenderAddress,
    });
  }

  async function swap(swapParams: SwapParams<"mayaprotocol"> | SwapWithRouteParams) {
    if (!("route" in swapParams)) throw new SwapKitError("core_swap_invalid_params");

    const route = swapParams.route as QuoteRouteV2;
    const { feeOptionKey } = swapParams;

    const { memo, expiration, targetAddress, evmTransactionDetails } = route;

    const assetValue = await AssetValue.fromString(route.sellAsset, route.sellAmount);
    const evmChain = assetValue.chain;

    if (!assetValue) {
      throw new SwapKitError("core_swap_asset_not_recognized");
    }

    const { address: recipient } = await getInboundDataByChain(evmChain);

    return deposit({
      expiration: Number(expiration),
      assetValue,
      memo,
      feeOptionKey,
      router: targetAddress,
      recipient,
      evmTransactionDetails,
    });
  }

  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: TODO refactor
  async function deposit({
    assetValue,
    recipient,
    router,
    ...rest
  }: CoreTxParams & { router?: string; evmTransactionDetails?: EvmTransactionDetails }) {
    const { chain, symbol, ticker } = assetValue;

    const walletInstance = wallets[chain];
    if (!walletInstance) {
      throw new SwapKitError("core_wallet_connection_not_found");
    }

    const isAddressValidated = validateAddressType({ address: walletInstance?.address, chain });
    if (!isAddressValidated) {
      throw new SwapKitError("core_transaction_invalid_sender_address");
    }

    const params = prepareTxParams(wallets, { assetValue, recipient, router, ...rest });

    try {
      switch (chain) {
        case Chain.Maya: {
          const wallet = wallets[chain];
          const tx = await (recipient === "" ? wallet.deposit(params) : wallet.transfer(params));
          return tx;
        }

        case Chain.Arbitrum:
        case Chain.Ethereum: {
          const wallet = wallets[chain];
          const { getChecksumAddressFromAsset } = await import("@swapkit/toolbox-evm");

          const abi = chain === Chain.Arbitrum ? TCAvalancheDepositABI : TCEthereumVaultAbi;

          const tx = await wallet.call({
            abi,
            contractAddress:
              router || ((await getInboundDataByChain(chain as EVMChain)).router as string),
            funcName: "depositWithExpiry",
            funcParams: [
              recipient,
              getChecksumAddressFromAsset({ chain, symbol, ticker }, chain),
              assetValue.getBaseValue("string"),
              params.memo,
              rest.expiration ||
                Number.parseInt(`${(new Date().getTime() + 15 * 60 * 1000) / 1000}`),
            ],
            txOverrides: {
              from: params.from,
              value: assetValue.isGasAsset ? assetValue.getBaseValue("bigint") : undefined,
            },
          });

          return tx as string;
        }

        default: {
          if (walletInstance) {
            return walletInstance.transfer(params) as Promise<string>;
          }

          throw new SwapKitError("core_wallet_connection_not_found");
        }
      }
    } catch (error) {
      const errorMessage =
        // @ts-expect-error Fine to use error as string
        typeof error === "string" ? error.toLowerCase() : error?.message.toLowerCase();
      const isInsufficientFunds = errorMessage?.includes("insufficient funds");
      const isGas = errorMessage?.includes("gas");
      const isServer = errorMessage?.includes("server");
      const isUserRejected = errorMessage?.includes("user rejected");
      const errorKey: ErrorKeys = isInsufficientFunds
        ? "core_transaction_deposit_insufficient_funds_error"
        : isGas
          ? "core_transaction_deposit_gas_error"
          : isServer
            ? "core_transaction_deposit_server_error"
            : isUserRejected
              ? "core_transaction_user_rejected"
              : "core_transaction_deposit_error";

      throw new SwapKitError(errorKey, error);
    }
  }

  async function getInboundDataByChain(chain: Chain) {
    switch (chain) {
      case Chain.Maya:
        return { gas_rate: "0", router: "", address: "", halted: false, chain };

      default: {
        const inboundData = await SwapKitApi.getInboundAddresses({ stagenet, type: "mayachain" });
        const chainAddressData = inboundData.find((item) => item.chain === chain);

        if (!chainAddressData) throw new SwapKitError("core_inbound_data_not_found");
        if (chainAddressData?.halted) throw new SwapKitError("core_chain_halted");

        return chainAddressData;
      }
    }
  }

  function approveAssetValue(assetValue: AssetValue, contractAddress?: string) {
    return approve({ assetValue, contractAddress, type: ApproveMode.Approve });
  }

  function isAssetValueApproved(assetValue: AssetValue, contractAddress?: string) {
    return approve({ assetValue, contractAddress, type: ApproveMode.CheckOnly });
  }

  return {
    swap,
    deposit,
    getInboundDataByChain,
    approveAssetValue,
    isAssetValueApproved,
  };
};

export const MayachainPlugin = { mayachain: { plugin } } as const;

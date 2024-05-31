import { SwapKitApi } from "@swapkit/api";
import {
  ApproveMode,
  AssetValue,
  Chain,
  type CosmosChain,
  type EVMChain,
  type ErrorKeys,
  MayaArbitrumVaultAbi,
  MayaEthereumVaultAbi,
  MemoType,
  ProviderName,
  type QuoteResponseRoute,
  SwapKitError,
  type SwapParams,
  type ThornameRegisterParam,
  type UTXOChain,
  getMemoFor,
} from "@swapkit/helpers";
import {
  type ChainWallets,
  getInboundDataFunction,
  getWallet,
  prepareTxParams,
  sharedApprove,
  validateAddressType,
} from "./shared";
import type { ApproveParams, CoreTxParams, SwapWithRouteParams } from "./types";

type SupportedChain = EVMChain | CosmosChain | UTXOChain;

const plugin = ({ wallets, stagenet = false }: { wallets: ChainWallets; stagenet?: boolean }) => {
  const getInboundDataByChain = getInboundDataFunction({ stagenet, type: "mayachain" });

  /**
   * @Private
   * Wallet interaction helpers
   */
  async function approve<T extends ApproveMode>({
    assetValue,
    type = "checkOnly" as T,
  }: { type: T; assetValue: AssetValue }) {
    const router = (await getInboundDataByChain(assetValue.chain)).router as string;

    return sharedApprove({
      assetValue,
      type,
      router,
      wallets,
    });
  }

  async function swap(swapParams: SwapParams<"mayaprotocol"> | SwapWithRouteParams) {
    if (!("route" in swapParams)) throw new SwapKitError("core_swap_invalid_params");

    const route = swapParams.route as QuoteResponseRoute;
    const { feeOptionKey } = swapParams;

    const { memo, expiration, targetAddress } = route;

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
    });
  }

  async function depositToProtocol({ memo, assetValue }: { assetValue: AssetValue; memo: string }) {
    const mimir = await SwapKitApi.getMimirInfo({ stagenet, type: "mayachain" });

    // check if trading is halted or not
    if (mimir.HALTCHAINGLOBAL >= 1 || mimir.HALTTHORCHAIN >= 1) {
      throw new SwapKitError("core_chain_halted");
    }

    return deposit({ assetValue, recipient: "", memo });
  }

  function registerMayaname({
    assetValue,
    ...param
  }: ThornameRegisterParam & { assetValue: AssetValue }) {
    return depositToProtocol({ assetValue, memo: getMemoFor(MemoType.THORNAME_REGISTER, param) });
  }

  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: TODO refactor
  async function deposit({
    assetValue,
    recipient,
    router,
    ...rest
  }: CoreTxParams & { router?: string }) {
    const { chain, symbol, ticker } = assetValue;

    const walletInstance = getWallet(wallets, chain as SupportedChain);
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
          const { getChecksumAddressFromAsset } = await import("@swapkit/toolbox-evm");
          const wallet = getWallet(wallets, chain);

          const abi = chain === Chain.Arbitrum ? MayaArbitrumVaultAbi : MayaEthereumVaultAbi;
          const funcParams = [
            recipient,
            getChecksumAddressFromAsset({ chain, symbol, ticker }, chain),
            assetValue.getBaseValue("string"),
            params.memo,
            rest.expiration || Number.parseInt(`${(new Date().getTime() + 15 * 60 * 1000) / 1000}`),
          ];
          const txOverrides = {
            from: params.from,
            value: assetValue.isGasAsset ? assetValue.getBaseValue("bigint") : undefined,
          };

          const tx = await wallet.call<string>({
            abi,
            funcName: "depositWithExpiry",
            funcParams,
            txOverrides,
            contractAddress:
              router || ((await getInboundDataByChain(chain as EVMChain)).router as string),
          });

          return tx;
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

  function approveAssetValue(params: ApproveParams) {
    return approve({ ...params, type: ApproveMode.Approve });
  }

  function isAssetValueApproved(params: ApproveParams) {
    return approve({ ...params, type: ApproveMode.CheckOnly });
  }

  return {
    swap,
    deposit,
    registerMayaname,
    getInboundDataByChain,
    approveAssetValue,
    isAssetValueApproved,
    supportedSwapkitProviders: [ProviderName.MAYACHAIN],
  };
};

export const MayachainPlugin = { mayachain: { plugin } } as const;

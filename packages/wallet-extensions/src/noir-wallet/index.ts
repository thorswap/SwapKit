import { AssetValue, Chain, type GenericTransferParams, SwapKitError, WalletOption } from "@swapkit/helpers";
import { createWallet, getWalletSupportedChains } from "@swapkit/wallet-core";
import type { NoirWalletZcashProvider } from "../types";

export function getNoirWalletZcashProvider(): NoirWalletZcashProvider {
  const provider = window.noirwallet?.zcash;

  if (!provider) {
    throw new SwapKitError("wallet_noir_wallet_not_found");
  }

  return provider;
}

export const noirWallet = createWallet({
  connect: ({ addChain, walletType }) =>
    async function connectNoirWallet(_chains?: Chain[]) {
      const provider = getNoirWalletZcashProvider();

      // Opens the extension's connect-approval popup and returns the primary
      // account's addresses.
      const account = await provider.request({ method: "zcash_requestAccounts" });

      if (!account?.transparent) {
        throw new SwapKitError("wallet_noir_wallet_connection_failed");
      }

      const { getUtxoToolbox } = await import("@swapkit/toolboxes/utxo");
      const toolbox = await getUtxoToolbox(Chain.Zcash);

      addChain({
        ...toolbox,
        address: account.transparent,
        chain: Chain.Zcash,
        /**
         * Noir Wallet spends from the shielded pool, so the spendable balance
         * comes from the wallet itself rather than the transparent address'
         * UTXO set.
         */
        getBalance: async () => {
          const balance = await provider.request({ method: "zcash_getBalance" });
          const value = balance?.available ?? balance?.spendable ?? balance?.total ?? "0";

          return [AssetValue.from({ chain: Chain.Zcash, value })];
        },
        signMessage: async (message: string) => {
          const { signature } = await provider.request({ method: "zcash_signMessage", params: [message, {}] });

          return signature;
        },
        /**
         * Transaction building, fee selection and signing happen inside the
         * extension. Memos are supported for shielded recipients (zs/u1);
         * the extension rejects memos to transparent addresses (t1/t3),
         * which means OP_RETURN-based routes (Maya/THORChain) will fail at
         * the wallet level while deposit-address routes (NEAR Intents) work.
         */
        transfer: ({ recipient, assetValue, memo }: GenericTransferParams) => {
          if (!(recipient && assetValue)) {
            throw new SwapKitError("wallet_missing_params", { params: { assetValue, recipient } });
          }

          return provider.request({
            method: "zcash_sendTransaction",
            params: [{ amount: assetValue.getValue("string"), to: recipient, ...(memo && { memo }) }],
          });
        },
        walletType,
      });

      return true;
    },
  name: "connectNoirWallet",
  supportedChains: [Chain.Zcash],
  walletType: WalletOption.NOIR_WALLET,
});

export const NOIR_WALLET_SUPPORTED_CHAINS = getWalletSupportedChains(noirWallet);

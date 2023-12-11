import type { Keplr } from '@keplr-wallet/types';
import type { AssetValue } from '@swapkit/helpers';
import type { ConnectWalletParams, WalletTxParams } from '@swapkit/types';
import { Chain, ChainToChainId, RPCUrl, WalletOption } from '@swapkit/types';

declare global {
  interface Window {
    keplr: Keplr;
  }
}

const connectKeplr =
  ({ addChain, rpcUrls }: ConnectWalletParams) =>
  async (chain: Chain.Cosmos | Chain.Kujira) => {
    const keplrClient = window.keplr;
    const chainId = ChainToChainId[chain];
    keplrClient?.enable(chainId);
    const offlineSigner = keplrClient?.getOfflineSignerOnlyAmino(chainId);
    if (!offlineSigner) throw new Error('Could not load offlineSigner');
    const { getDenom, createSigningStargateClient, KujiraToolbox, GaiaToolbox } = await import(
      '@swapkit/toolbox-cosmos'
    );

    const cosmJS = await createSigningStargateClient(
      rpcUrls[chain] || RPCUrl.Cosmos,
      offlineSigner,
    );

    const [{ address }] = await offlineSigner.getAccounts();
    const transfer = async ({
      assetValue,
      recipient,
      memo,
    }: WalletTxParams & { assetValue: AssetValue }) => {
      const coins = [
        { denom: getDenom(assetValue.symbol), amount: assetValue.getBaseValue('string') },
      ];

      const { transactionHash } = await cosmJS.sendTokens(address, recipient, coins, 1.6, memo);
      return transactionHash;
    };

    const toolbox = chain === Chain.Kujira ? KujiraToolbox() : GaiaToolbox();

    addChain({
      chain,
      walletMethods: { ...toolbox, transfer, getAddress: () => address },
      wallet: { address, balance: [], walletType: WalletOption.KEPLR },
    });
  };

export const keplrWallet = {
  connectMethodName: 'connectKeplr' as const,
  connect: connectKeplr,
};

import type { Keplr } from '@keplr-wallet/types';
import type { AssetValue } from '@swapkit/helpers';
import type { ConnectWalletParams, WalletTxParams } from '@swapkit/types';
import { Chain, ChainToChainId, WalletOption } from '@swapkit/types';

const connectKeplr =
  ({ addChain, rpcUrls }: ConnectWalletParams) =>
  async (chain: Chain.Cosmos | Chain.Kujira) => {
    const keplrClient = (window as any).keplr as Keplr;
    const chainId = ChainToChainId[chain];
    keplrClient?.enable(chainId);
    const offlineSigner = keplrClient?.getOfflineSignerOnlyAmino(chainId);
    if (!offlineSigner) throw new Error('Could not load offlineSigner');
    const { getDenom, KujiraToolbox, GaiaToolbox, createCosmJS } = await import(
      '@swapkit/toolbox-cosmos'
    );

    const cosmJS = await createCosmJS({ offlineSigner, rpcUrl: rpcUrls[chain] });

    const [{ address }] = await offlineSigner.getAccounts();
    const transfer = async ({
      assetValue,
      recipient,
      memo,
    }: WalletTxParams & { assetValue: AssetValue }) => {
      const coins = [{ denom: getDenom(assetValue.symbol), amount: assetValue.baseValue }];

      const { transactionHash } = await cosmJS.sendTokens(address, recipient, coins, 1.6, memo);
      return transactionHash;
    };

    const toolbox = chain === Chain.Kujira ? KujiraToolbox() : GaiaToolbox();

    addChain({
      chain,
      walletMethods: { ...toolbox, transfer, getAddress: () => address },
      wallet: { address, balance: [], walletType: WalletOption.KEPLR },
    });

    return true;
  };

export const keplrWallet = {
  connectMethodName: 'connectKeplr' as const,
  connect: connectKeplr,
};

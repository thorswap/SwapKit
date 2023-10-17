import type { Keplr } from '@keplr-wallet/types';
import type { AssetValue } from '@swapkit/helpers';
import type { ConnectWalletParams, WalletTxParams } from '@swapkit/types';
import { Chain, ChainId, WalletOption } from '@swapkit/types';

const connectKeplr =
  ({ addChain, rpcUrls }: ConnectWalletParams) =>
  async (client?: Keplr) => {
    const keplrClient = (client || (window as any).keplr) as Keplr | undefined;
    keplrClient?.enable(ChainId.Cosmos);
    const offlineSigner = keplrClient?.getOfflineSignerOnlyAmino(ChainId.Cosmos);
    if (!offlineSigner) throw new Error('Could not load offlineSigner');
    const { GaiaToolbox, createCosmJS } = await import('@swapkit/toolbox-cosmos');

    const cosmJS = await createCosmJS({ offlineSigner, rpcUrl: rpcUrls[Chain.Cosmos] });

    const [{ address }] = await offlineSigner.getAccounts();
    const transfer = async ({
      assetValue,
      recipient,
      memo,
    }: WalletTxParams & { assetValue: AssetValue }) => {
      const coins = [
        {
          denom: assetValue?.symbol === 'MUON' ? 'umuon' : 'uatom',
          amount: assetValue.baseValue,
        },
      ];

      const { transactionHash } = await cosmJS.sendTokens(address, recipient, coins, 1.6, memo);
      return transactionHash;
    };

    addChain({
      chain: Chain.Cosmos,
      walletMethods: { ...GaiaToolbox(), getAddress: () => address, transfer },
      wallet: { address, balance: [], walletType: WalletOption.KEPLR },
    });

    return true;
  };

export const keplrWallet = {
  connectMethodName: 'connectKeplr' as const,
  connect: connectKeplr,
};

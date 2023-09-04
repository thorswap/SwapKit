import type { Keplr } from '@keplr-wallet/types';
import type { ConnectWalletParams, WalletTxParams } from '@thorswap-lib/types';
import { Chain, ChainId, WalletOption } from '@thorswap-lib/types';

const connectKeplr =
  ({ addChain, rpcUrls }: ConnectWalletParams) =>
  async (client?: Keplr) => {
    const keplrClient = (client || (window as any).keplr) as Keplr | undefined;
    keplrClient?.enable(ChainId.Cosmos);
    const offlineSigner = keplrClient?.getOfflineSignerOnlyAmino(ChainId.Cosmos);
    if (!offlineSigner) throw new Error('Could not load offlineSigner');
    const { GaiaToolbox, createCosmJS } = await import('@thorswap-lib/toolbox-cosmos');

    const cosmJS = await createCosmJS({ offlineSigner, rpcUrl: rpcUrls[Chain.Cosmos] });

    const [{ address }] = await offlineSigner.getAccounts();
    const transfer = async ({ asset, recipient, memo, amount }: WalletTxParams) => {
      const coins = [
        { denom: asset?.symbol === 'MUON' ? 'umuon' : 'uatom', amount: amount.amount().toString() },
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

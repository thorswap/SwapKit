import { GasPrice, SigningStargateClient } from '@cosmjs/stargate';
import { GaiaToolbox } from '@thorswap-lib/toolbox-cosmos';
import {
  Chain,
  ChainId,
  ConnectWalletParams,
  RPCUrl,
  WalletOption,
  WalletTxParams,
} from '@thorswap-lib/types';

import { WalletStatus } from './types.js';

const connectKeplr =
  ({ addChain, rpcUrls }: ConnectWalletParams) =>
  async (client?: any) => {
    const keplrClient = client || window.keplr;
    keplrClient?.enable(ChainId.Cosmos);
    const offlineSigner = keplrClient?.getOfflineSignerOnlyAmino(ChainId.Cosmos);
    if (!offlineSigner) throw new Error('Could not load offlineSigner');

    const [{ address }] = await offlineSigner.getAccounts();
    const cosmJS = await SigningStargateClient.connectWithSigner(
      rpcUrls[Chain.Cosmos] || RPCUrl.Cosmos,
      offlineSigner,
      { gasPrice: GasPrice.fromString('0.0003uatom') },
    );

    const getAddress = () => address;
    const transfer = async ({ asset, recipient, memo, amount }: WalletTxParams) => {
      const coins = [
        { denom: asset?.symbol === 'MUON' ? 'umuon' : 'uatom', amount: amount.amount().toString() },
      ];

      const { transactionHash } = await cosmJS.sendTokens(address, recipient, coins, 'auto', memo);
      return transactionHash;
    };

    const toolbox = GaiaToolbox();

    addChain({
      chain: Chain.Cosmos,
      walletMethods: { ...toolbox, getAddress, transfer },
      wallet: { address, balance: [], walletType: WalletOption.KEPLR },
    });

    return true;
  };

export const keplrWallet = {
  connectMethodName: 'connectKeplr' as const,
  connect: connectKeplr,
  isDetected: () => (window?.keplr ? WalletStatus.Detected : WalletStatus.NotInstalled),
};

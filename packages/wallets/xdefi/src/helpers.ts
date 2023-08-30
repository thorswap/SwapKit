import {
  BinanceToolbox,
  DEFAULT_GAS_VALUE,
  GaiaToolbox,
  ThorchainToolbox,
} from '@thorswap-lib/toolbox-cosmos';
import { getWeb3WalletMethods } from '@thorswap-lib/toolbox-evm';
import { BCHToolbox, BTCToolbox, DOGEToolbox, LTCToolbox } from '@thorswap-lib/toolbox-utxo';
import { Chain, WalletTxParams } from '@thorswap-lib/types';

import { cosmosTransfer, walletTransfer } from './walletHelpers.js';

export type XDEFIConfig = {
  covalentApiKey?: string;
  ethplorerApiKey?: string;
  utxoApiKey?: string;
};

// TODO: Fix type inference: swapkit-entities, bitcoinjs-lib, ecpair
export const getWalletMethodsForChain = async ({
  chain,
  ethplorerApiKey,
  covalentApiKey,
  utxoApiKey,
  rpcUrl,
  api,
}: { rpcUrl?: string; api?: any; chain: Chain } & XDEFIConfig): Promise<any> => {
  switch (chain) {
    case Chain.THORChain: {
      return {
        ...ThorchainToolbox({ stagenet: false }),
        deposit: (tx: WalletTxParams) => walletTransfer({ ...tx, recipient: '' }, 'deposit'),
        transfer: (tx: WalletTxParams) =>
          walletTransfer({ ...tx, gasLimit: DEFAULT_GAS_VALUE }, 'transfer'),
      };
    }

    case Chain.Ethereum:
    case Chain.BinanceSmartChain:
    case Chain.Avalanche:
      return await getWeb3WalletMethods({
        chain,
        ethplorerApiKey,
        covalentApiKey,
        ethereumWindowProvider: window.xfi?.ethereum,
      });

    case Chain.Cosmos:
      return { ...GaiaToolbox({ server: api }), transfer: cosmosTransfer(rpcUrl) };

    case Chain.Binance:
      return { ...BinanceToolbox(), transfer: walletTransfer };

    case Chain.Bitcoin:
    case Chain.BitcoinCash:
    case Chain.Dogecoin:
    case Chain.Litecoin: {
      const params = { rpcUrl, utxoApiKey, apiClient: api };
      const toolbox =
        chain === Chain.Bitcoin
          ? BTCToolbox(params)
          : chain === Chain.BitcoinCash
          ? BCHToolbox(params)
          : chain === Chain.Dogecoin
          ? DOGEToolbox(params)
          : LTCToolbox(params);

      return { ...toolbox, transfer: walletTransfer };
    }

    default:
      return null;
  }
};

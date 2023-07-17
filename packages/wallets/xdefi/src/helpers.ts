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
export const getWalletMethodsForChain = ({
  chain,
  ethplorerApiKey,
  covalentApiKey,
  utxoApiKey,
  rpcUrl,
  api,
}: { rpcUrl?: string; api?: any; chain: Chain } & XDEFIConfig): any => {
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
      return getWeb3WalletMethods({
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
      return { ...BTCToolbox(utxoApiKey, rpcUrl), transfer: walletTransfer };
    case Chain.BitcoinCash:
      return { ...BCHToolbox(utxoApiKey, rpcUrl), transfer: walletTransfer };
    case Chain.Dogecoin:
      return { ...DOGEToolbox(utxoApiKey, rpcUrl), transfer: walletTransfer };
    case Chain.Litecoin:
      return { ...LTCToolbox(utxoApiKey, rpcUrl), transfer: walletTransfer };

    default:
      return null;
  }
};

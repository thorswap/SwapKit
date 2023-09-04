import type { WalletTxParams } from '@thorswap-lib/types';
import { Chain } from '@thorswap-lib/types';

import { cosmosTransfer, walletTransfer } from './walletHelpers.ts';

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
      const { DEFAULT_GAS_VALUE, ThorchainToolbox } = await import('@thorswap-lib/toolbox-cosmos');

      return {
        ...ThorchainToolbox({ stagenet: false }),
        deposit: (tx: WalletTxParams) => walletTransfer({ ...tx, recipient: '' }, 'deposit'),
        transfer: (tx: WalletTxParams) =>
          walletTransfer({ ...tx, gasLimit: DEFAULT_GAS_VALUE }, 'transfer'),
      };
    }

    case Chain.Cosmos: {
      const { GaiaToolbox } = await import('@thorswap-lib/toolbox-cosmos');
      return { ...GaiaToolbox({ server: api }), transfer: cosmosTransfer(rpcUrl) };
    }

    case Chain.Binance: {
      const { BinanceToolbox } = await import('@thorswap-lib/toolbox-cosmos');
      return { ...BinanceToolbox(), transfer: walletTransfer };
    }

    case Chain.Ethereum:
    case Chain.BinanceSmartChain:
    case Chain.Avalanche: {
      const { getWeb3WalletMethods } = await import('@thorswap-lib/toolbox-evm');

      return await getWeb3WalletMethods({
        chain,
        ethplorerApiKey,
        covalentApiKey,
        ethereumWindowProvider: window.xfi?.ethereum,
      });
    }

    case Chain.Bitcoin:
    case Chain.BitcoinCash:
    case Chain.Dogecoin:
    case Chain.Litecoin: {
      const { BCHToolbox, BTCToolbox, DOGEToolbox, LTCToolbox } = await import(
        '@thorswap-lib/toolbox-utxo'
      );
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

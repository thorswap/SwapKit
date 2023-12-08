import type { DerivationPathArray } from '@coinmasters/types';
import { Chain } from '@coinmasters/types';

import { AvalancheLedger } from '../clients/avalanche.ts';
import { BinanceLedger } from '../clients/binance/index.ts';
import { BSCLedger } from '../clients/binancesmartchain.ts';
import { BitcoinLedger } from '../clients/bitcoin.ts';
import { BitcoinCashLedger } from '../clients/bitcoincash.ts';
import { CosmosLedger } from '../clients/cosmos.ts';
import { DogecoinLedger } from '../clients/dogecoin.ts';
import { EthereumLedger } from '../clients/ethereum.ts';
import { LitecoinLedger } from '../clients/litecoin.ts';
import { THORChainLedger } from '../clients/thorchain/index.ts';

import type { LEDGER_SUPPORTED_CHAINS } from './ledgerSupportedChains.ts';

export const getLedgerClient = async ({
  chain,
  paths,
}: {
  chain: (typeof LEDGER_SUPPORTED_CHAINS)[number];
  paths: any;
}) => {
  switch (chain) {
    case Chain.THORChain:
      return new THORChainLedger(paths);
    case Chain.Binance:
      return new BinanceLedger(paths);
    case Chain.Cosmos:
      return new CosmosLedger(paths);
    case Chain.Bitcoin:
      return new BitcoinLedger(paths);
    case Chain.BitcoinCash:
      return new BitcoinCashLedger(paths);
    case Chain.Dogecoin:
      return new DogecoinLedger(paths);
    case Chain.Litecoin:
      return new LitecoinLedger(paths);
    case Chain.Ethereum:
    case Chain.BinanceSmartChain:
    case Chain.Avalanche: {
      const { getProvider } = await import('@coinmasters/toolbox-evm');
      const params = { provider: getProvider(chain), derivationPath };

      switch (chain) {
        case Chain.BinanceSmartChain:
          return new BSCLedger(params);
        case Chain.Avalanche:
          return new AvalancheLedger(params);
        default:
          return new EthereumLedger(params);
      }
    }
  }
};

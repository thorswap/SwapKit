import { getProvider } from '@thorswap-lib/toolbox-evm';
import { Chain, DerivationPathArray } from '@thorswap-lib/types';

import { AvalancheLedger } from '../clients/avalanche.js';
import { BinanceLedger } from '../clients/binance/index.js';
import { BitcoinLedger } from '../clients/bitcoin.js';
import { BitcoinCashLedger } from '../clients/bitcoincash.js';
import { CosmosLedger } from '../clients/cosmos.js';
import { DogecoinLedger } from '../clients/dogecoin.js';
import { EthereumLedger } from '../clients/ethereum.js';
import { LitecoinLedger } from '../clients/litecoin.js';
import { THORChainLedger } from '../clients/thorchain/index.js';

import { LEDGER_SUPPORTED_CHAINS } from './ledgerSupportedChains.js';

export const getLedgerClient = ({
  chain,
  derivationPath,
}: {
  chain: (typeof LEDGER_SUPPORTED_CHAINS)[number];
  derivationPath?: DerivationPathArray;
}) => {
  switch (chain) {
    case Chain.THORChain:
      return new THORChainLedger(derivationPath);
    case Chain.Binance:
      return new BinanceLedger(derivationPath);
    case Chain.Cosmos:
      return new CosmosLedger(derivationPath);
    case Chain.Bitcoin:
      return new BitcoinLedger(derivationPath);
    case Chain.BitcoinCash:
      return new BitcoinCashLedger(derivationPath);
    case Chain.Doge:
      return new DogecoinLedger(derivationPath);
    case Chain.Litecoin:
      return new LitecoinLedger(derivationPath);
    case Chain.Ethereum:
      return new EthereumLedger({
        provider: getProvider(Chain.Ethereum),
        derivationPath,
      });
    case Chain.Avalanche: {
      return new AvalancheLedger({
        provider: getProvider(Chain.Avalanche),
        derivationPath,
      });
    }
  }
};

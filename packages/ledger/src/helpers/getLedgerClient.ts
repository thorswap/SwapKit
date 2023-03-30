import { getProvider } from '@thorswap-lib/toolbox-evm';
import { Chain, DerivationPath, DerivationPathArray } from '@thorswap-lib/types';

import { AvalancheLedger } from '../clients/avalanche.js';
import { BinanceLedger } from '../clients/binance.js';
import { BitcoinLedger } from '../clients/bitcoin.js';
import { BitcoinCashLedger } from '../clients/bitcoincash.js';
import { CosmosLedger } from '../clients/cosmos.js';
import { DogecoinLedger } from '../clients/dogecoin.js';
import { EthereumLedger } from '../clients/ethereum.js';
import { LitecoinLedger } from '../clients/litecoin.js';
import { THORChainLedger } from '../clients/thorchain/index.js';
import { LEDGER_SUPPORTED_CHAINS } from '../constants.js';

export const getLedgerClient = ({
  chain,
  derivationPath,
}: {
  chain: (typeof LEDGER_SUPPORTED_CHAINS)[number];
  derivationPath?: DerivationPathArray | DerivationPath;
}) => {
  switch (chain) {
    case Chain.THORChain:
      return new THORChainLedger(derivationPath as DerivationPathArray);
    case Chain.Binance:
      return new BinanceLedger(derivationPath as DerivationPathArray);
    case Chain.Cosmos:
      return new CosmosLedger(derivationPath as DerivationPath);
    case Chain.Bitcoin:
      return new BitcoinLedger(derivationPath as DerivationPathArray);
    case Chain.BitcoinCash:
      return new BitcoinCashLedger(derivationPath as DerivationPathArray);
    case Chain.Doge:
      return new DogecoinLedger(derivationPath as DerivationPathArray);
    case Chain.Litecoin:
      return new LitecoinLedger(derivationPath as DerivationPathArray);
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

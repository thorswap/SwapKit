import type { DerivationPathArray } from '@thorswap-lib/types';
import { Chain } from '@thorswap-lib/types';

import { AvalancheLedger } from '../clients/avalanche.ts';
import { BinanceLedger } from '../clients/binance/index.ts';
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
    case Chain.Dogecoin:
      return new DogecoinLedger(derivationPath);
    case Chain.Litecoin:
      return new LitecoinLedger(derivationPath);
    case Chain.Ethereum:
    case Chain.Avalanche: {
      const { getProvider } = await import('@thorswap-lib/toolbox-evm');
      const params = { provider: getProvider(chain), derivationPath };

      return chain === Chain.Avalanche ? new AvalancheLedger(params) : new EthereumLedger(params);
    }
  }
};

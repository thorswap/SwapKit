import type { OfflineDirectSigner } from '@cosmjs/proto-signing';
import type { Account } from '@cosmjs/stargate';
import { baseAmount } from '@thorswap-lib/helpers';
import type { Balance, Fees } from '@thorswap-lib/types';
import { ApiUrl, BaseDecimal, ChainId, DerivationPath, FeeOption } from '@thorswap-lib/types';

import { CosmosClient } from '../cosmosClient.ts';
import type { GaiaToolboxType } from '../index.ts';
import type { TransferParams } from '../types.ts';
import { getAsset } from '../util.ts';

import { BaseCosmosToolbox, getFeeRateFromThorswap } from './BaseCosmosToolbox.ts';

export const GaiaToolbox = ({ server }: { server?: string } = {}): GaiaToolboxType => {
  const client = new CosmosClient({
    server: server || ApiUrl.Cosmos,
    chainId: ChainId.Cosmos,
  });

  const baseToolbox: {
    validateAddress: (address: string) => Promise<boolean>;
    getAddressFromMnemonic: (phrase: string) => Promise<string>;
    getAccount: (address: string) => Promise<Account | null>;
    getBalance: (address: string) => Promise<Balance[]>;
    transfer: (params: TransferParams) => Promise<string>;
    getSigner: (phrase: string) => Promise<OfflineDirectSigner>;
    getSignerFromPrivateKey: (privateKey: Uint8Array) => Promise<OfflineDirectSigner>;
    getPubKeyFromMnemonic: (phrase: string) => Promise<string>;
  } = BaseCosmosToolbox({
    decimal: BaseDecimal.GAIA,
    derivationPath: DerivationPath.GAIA,
    getAsset,
    client,
  });

  const getFees = async (): Promise<Fees> => {
    const baseFee = (await getFeeRateFromThorswap(ChainId.Cosmos)) || 500;
    return {
      type: 'base',
      [FeeOption.Fast]: baseAmount(baseFee * 1.5, BaseDecimal.GAIA),
      [FeeOption.Fastest]: baseAmount(baseFee * 3, BaseDecimal.GAIA),
      [FeeOption.Average]: baseAmount(baseFee, BaseDecimal.GAIA),
    };
  };

  return {
    ...baseToolbox,
    getFees,
    transfer: async (params: TransferParams) => {
      const gasFees = await getFees();

      return baseToolbox.transfer({
        ...params,
        fee: params.fee || {
          amount: [
            {
              denom: 'uatom',
              amount: gasFees[params.feeOptionKey || 'fast'].amount().toString() || '1000',
            },
          ],
          gas: '200000',
        },
      });
    },
  };
};

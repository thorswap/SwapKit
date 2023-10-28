import type { OfflineDirectSigner } from '@cosmjs/proto-signing';
import type { Account } from '@cosmjs/stargate';
import { type AssetValue, SwapKitNumber } from '@swapkit/helpers';
import { ApiUrl, BaseDecimal, ChainId, DerivationPath } from '@swapkit/types';

import { CosmosClient } from '../cosmosClient.ts';
import type { GaiaToolboxType } from '../index.ts';
import type { TransferParams } from '../types.ts';

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
    getBalance: (address: string, potentialScamFilter?: boolean) => Promise<AssetValue[]>;
    transfer: (params: TransferParams) => Promise<string>;
    getSigner: (phrase: string) => Promise<OfflineDirectSigner>;
    getSignerFromPrivateKey: (privateKey: Uint8Array) => Promise<OfflineDirectSigner>;
    getPubKeyFromMnemonic: (phrase: string) => Promise<string>;
  } = BaseCosmosToolbox({
    decimal: BaseDecimal.GAIA,
    derivationPath: DerivationPath.GAIA,
    client,
  });

  return {
    ...baseToolbox,
    getFees: async () => {
      const baseFee = (await getFeeRateFromThorswap(ChainId.Cosmos)) || 500;
      return {
        type: 'base',
        average: new SwapKitNumber({ value: baseFee, decimal: BaseDecimal.GAIA }),
        fast: new SwapKitNumber({ value: baseFee * 1.5, decimal: BaseDecimal.GAIA }),
        fastest: new SwapKitNumber({ value: baseFee * 2, decimal: BaseDecimal.GAIA }),
      };
    },
  };
};

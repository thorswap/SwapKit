import { RPCUrl } from '@swapkit/types';
import { BaseToolbox } from './baseSubstrateToobox.ts';
import { Network } from '../types/network.ts';
import { KeyringPair } from '@polkadot/keyring/types';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { AssetValue, SwapKitNumber } from '@swapkit/helpers';

export const ChainflipToolbox = async ({
  providerUrl = RPCUrl.Chainflip,
  signer,
  generic = false,
}: {
  providerUrl?: RPCUrl;
  signer: KeyringPair;
  generic?: boolean;
}): ReturnType<typeof BaseToolbox> => {
  const provider = new WsProvider(providerUrl);
  const api = await ApiPromise.create({ provider });
  const gasAsset = 'FLIP.FLIP';

  const getBalance = async (api: ApiPromise, address: string) => {
    const { balance } = await api.query.flip.account(address);
    const asset = AssetValue.fromStringSync(gasAsset, '0');
    return [
      asset.set(
        SwapKitNumber.fromBigInt(BigInt(balance.toString()), asset.decimal).getValue('string'),
      ),
    ];
  };

  const baseToolbox = await BaseToolbox({
    providerUrl,
    signer,
    gasAsset,
    network: generic ? Network.GENERIC_SUBSTRATE : Network.CHAINFLIP,
  });

  return {
    ...baseToolbox,
    getBalance: async (address: string) => getBalance(api, address),
  };
};

import { ChainId } from '@thorswap-lib/types';

const THORNODE_MAINNET_API_URI = 'https://thornode.thorswap.net';
const STAGENET_THORNODE_URL = 'https://stagenet-thornode.ninerealms.com';
const MAINNET_RPC = 'https://rpc.thorswap.net';
const STAGENET_THORNODE_RPC = 'https://stagenet-rpc.ninerealms.com';

export const getTcNodeUrl = (stagenet?: boolean) =>
  stagenet ? STAGENET_THORNODE_URL : THORNODE_MAINNET_API_URI;
export const getTcRpcUrl = (stagenet?: boolean) => (stagenet ? STAGENET_THORNODE_RPC : MAINNET_RPC);
export const getTcChainId = (stagenet?: boolean) =>
  stagenet ? ChainId.ThorchainStagenet : ChainId.Thorchain;

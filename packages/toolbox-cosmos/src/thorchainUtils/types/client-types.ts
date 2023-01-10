import { AmountWithBaseDenom, Asset, Network, Tx } from '@thorswap-lib/types';

export type NodeUrl = {
  node: string;
  rpc: string;
};

export type ClientUrl = Record<Network, NodeUrl>;

export type ExplorerUrls = {
  root: ExplorerUrl;
  tx: ExplorerUrl;
  address: ExplorerUrl;
};

export type ExplorerUrl = Record<Network, string>;

export type ChainIds = Record<Network, string>;

export type DepositParam = {
  walletIndex?: number;
  asset?: Asset;
  amount: AmountWithBaseDenom;
  memo: string;
};

export type TxData = Pick<Tx, 'from' | 'to' | 'type'>;

/**
 * Response from `thorchain/constants` endpoint
 */
export type ThorchainConstantsResponse = {
  int_64_values: {
    // We are in fee interested only - ignore all other values
    NativeTransactionFee: number;
  };
};

/**
 * Response of `/cosmos/base/tendermint/v1beta1/node_info`
 * Note: We are interested in `network` (aka chain id) only
 */
export type NodeInfoResponse = {
  default_node_info: {
    network: string;
  };
};

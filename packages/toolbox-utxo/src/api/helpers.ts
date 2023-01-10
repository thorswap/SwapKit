import { getRequest } from '@thorswap-lib/helpers';
import {
  Chain,
  ChainToChainId,
  ResourceWorkerGasPricesResponse,
  ResourceWorkerUrls,
} from '@thorswap-lib/types';

const getDefaultTxFeeByChain = (chain: Chain) => {
  switch (chain) {
    case Chain.Bitcoin:
      return 127;
    case Chain.Doge:
      return 10000000;
    default:
      return 2;
  }
};

export const getSuggestedTxFee = async (chain: Chain): Promise<number> => {
  try {
    // use internal api
    const response = await getRequest<ResourceWorkerGasPricesResponse>(
      ResourceWorkerUrls.ALL_GAS_PRICES,
    );
    const gasPrice = response.result.find(
      (gasPrice) => gasPrice.chainId === ChainToChainId[chain],
    )?.gas;

    if (gasPrice) {
      return gasPrice;
    }
    throw new Error('Failed to get suggested txFee');
  } catch (error) {
    try {
      //Use Bitgo API for fee estimation
      //Refer: https://app.bitgo.com/docs/#operation/v2.tx.getfeeestimate
      const { feePerKb } = await getRequest<any>(
        `https://app.bitgo.com/api/v2/${chain.toLowerCase()}/tx/fee`,
      );
      return feePerKb / 1000; // feePerKb to feePerByte
    } catch (error) {
      return getDefaultTxFeeByChain(chain);
    }
  }
};

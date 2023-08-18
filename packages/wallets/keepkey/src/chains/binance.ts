// eslint-disable-next-line import/no-extraneous-dependencies
import { addressInfoForCoin } from '@pioneer-platform/pioneer-coins';
// eslint-disable-next-line import/no-extraneous-dependencies
import { ThorchainToolbox } from '@thorswap-lib/toolbox-cosmos';
import { Chain } from '@thorswap-lib/types';

export const binanceWalletMethods = async function (params: any) {
  try {
    let { sdk, stagenet } = params;
    if (!stagenet) stagenet = false;
    const toolbox = ThorchainToolbox({ stagenet });
    console.log('toolbox: ', toolbox);

    const getAddress = async () =>
      (
        await sdk.address.cosmosGetAddress({
          address_n: addressInfoForCoin(Chain.Cosmos, false).address_n,
        })
      ).address;

    //TODO signTransaction
    // const getBalance = async function () {
    //   try {
    //     let address = await getAddress();
    //     console.log('address: ', address);
    //     let balance = await toolbox.getBalance(address);
    //     console.log('balance: ', balance);
    //     return balance;
    //   } catch (e) {
    //     console.error(e);
    //   }
    // };
    //TODO transfer

    //TODO deposit

    return {
      getAddress,
      // getBalance,
      ...toolbox,
    };
  } catch (e) {
    console.error(e);
  }
};

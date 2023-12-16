import { AssetValue, RequestClient } from '@coinmasters/helpers';
import { Chain } from '@coinmasters/types';

//const PIONEER_API_URI = 'https://pioneers.dev';
const PIONEER_API_URI = 'http://127.0.0.1:9001';

const getAccount = (address: string): Promise<any> =>
  RequestClient.get<any>(`${PIONEER_API_URI}/api/v1/getAccountInfo/ripple/${address}`);

const getBalance = async (address: any[]) => {
  //console.log(address);

  let balanceBase = await RequestClient.get(
    `${PIONEER_API_URI}/api/v1/getPubkeyBalance/ripple/${address[0].address}`,
  );
  //console.log('balance: ', balanceBase);
  //console.log('balance: ', typeof balanceBase);
  if (balanceBase && balanceBase.error) balanceBase = '0';
  await AssetValue.loadStaticAssets();
  const assetValueNative = AssetValue.fromChainOrSignature(Chain.Ripple, balanceBase);
  assetValueNative.address = address[0].address;
  assetValueNative.type = 'Native';
  //console.log('assetValueNative: ', assetValueNative);
  let balances = [assetValueNative];
  //console.log('balances: ', balances);

  return balances;
};

export const RippleToolbox = (): any => {
  return {
    // transfer: (params: TransferParams) => transfer(params),
    getAccount,
    getBalance,
    // // getFees,
    // sendRawTransaction,
  };
};

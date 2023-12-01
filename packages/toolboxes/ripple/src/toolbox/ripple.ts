import { AssetValue, getRequest } from '@coinmasters/helpers';
const PIONEER_API_URI = 'https://pioneers.dev';

const getAccount = (address: string): Promise<any> =>
  getRequest<any>(`${PIONEER_API_URI}/api/v1/getAccountInfo/ripple/${address}`);

const getBalance = async (address: any[]) => {
  console.log(address);

  let balanceBase = await getRequest(
    `${PIONEER_API_URI}/api/v1/getPubkeyBalance/ripple/${address[0].address}`,
  );
  console.log('balance: ', balanceBase);
  console.log('balance: ', typeof balanceBase);
  if (balanceBase && balanceBase.error) balanceBase = '0';
  await AssetValue.loadStaticAssets();
  const assetValueNativeOsmo = AssetValue.fromStringSync('XRP.XRP', balanceBase);
  console.log('assetValueNativeOsmo: ', assetValueNativeOsmo);
  let balances = [assetValueNativeOsmo];
  console.log('balances: ', balances);

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

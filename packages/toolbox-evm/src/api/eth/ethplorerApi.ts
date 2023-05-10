import { getRequest } from '@thorswap-lib/helpers';

import { AddressInfo } from '../../types/index.js';

type ApiRequestParams<T> = { baseUrl: string; apiKey: string } & T;

export const getAddress = ({
  baseUrl,
  apiKey = 'freekey',
  address,
}: ApiRequestParams<{ address: string }>) =>
  getRequest<AddressInfo>(`${baseUrl}/getAddressInfo/${address}`, { apiKey });

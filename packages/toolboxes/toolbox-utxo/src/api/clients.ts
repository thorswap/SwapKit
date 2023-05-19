import { Chain } from '@thorswap-lib/types';

import { ApiClientParams, UTXOApiClient } from '../types/index.js';

import { ApiClient } from './ApiClient.js';

export class BitcoinApi extends ApiClient implements UTXOApiClient {
  constructor({ apiKey, nodeUrl, chain = Chain.BitcoinCash }: ApiClientParams) {
    super({ chain, apiKey, nodeUrl });
  }
}

export class BitcoincashApi extends ApiClient implements UTXOApiClient {
  constructor({ apiKey, nodeUrl, chain = Chain.BitcoinCash }: ApiClientParams) {
    super({ chain, apiKey, nodeUrl });
  }
}

export class LitecoinApi extends ApiClient implements UTXOApiClient {
  constructor({ apiKey, nodeUrl, chain = Chain.Litecoin }: ApiClientParams) {
    super({ chain, apiKey, nodeUrl });
  }
}

export class DogecoinApi extends ApiClient implements UTXOApiClient {
  constructor({ apiKey, nodeUrl, chain = Chain.Doge }: ApiClientParams) {
    super({ chain, apiKey, nodeUrl });
  }
}

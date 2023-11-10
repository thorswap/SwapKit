import type { Options } from 'ky';
import ky from 'ky';

const headers =
  typeof window !== 'undefined'
    ? {}
    : { referrer: 'https://sk.thorswap.net', referer: 'https://sk.thorswap.net' };

const kyClient = ky.create({ headers });

export const RequestClient = {
  get: <T>(url: string | URL | Request, options?: Options) => kyClient.get(url, options).json<T>(),
  post: <T>(url: string | URL | Request, options?: Options) =>
    kyClient.post(url, options).json<T>(),
};

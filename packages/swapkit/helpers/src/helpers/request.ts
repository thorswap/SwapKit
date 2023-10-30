import type { Options } from 'ky';
import ky from 'ky';

const kyClient = ky.create({
  headers: {
    referrer: 'https://sk.thorswap.net',
    referer: 'https://sk.thorswap.net',
    'Content-Type': 'application/json',
  },
});

export const RequestClient = {
  get: <T>(url: string | URL | Request, options?: Options) => kyClient.get(url, options).json<T>(),
  post: <T>(url: string | URL | Request, options?: Options) =>
    kyClient.post(url, options).json<T>(),
};

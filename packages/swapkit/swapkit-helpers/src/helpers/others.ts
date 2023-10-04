// 10 rune for register, 1 rune per year
// MINIMUM_REGISTRATION_FEE = 11
export const getTHORNameCost = (year: number) => {
  if (year < 0) throw new Error('Invalid number of year');
  return 10 + year;
};

export const validateTHORName = (name: string) => {
  if (name.length > 30) return false;

  const regex = /^[a-zA-Z0-9+_-]+$/g;

  return !!name.match(regex);
};

export const derivationPathToString = ([network, chainId, account, change, index]: number[]) => {
  const shortPath = typeof index !== 'number';

  return `${network}'/${chainId}'/${account}'/${change}${shortPath ? '' : `/${index}`}`;
};

export const getRequest = async <T>(
  url: string,
  params?: { [key in string]?: any },
): Promise<T> => {
  const queryParams = Object.entries(params || {}).reduce(
    (acc, [key, value]) => {
      if (value) {
        acc[key] = value;
      }

      return acc;
    },
    {} as { [key in string]: any },
  );

  const response = await fetch(
    `${url}${params ? `?${new URLSearchParams(queryParams).toString()}` : ''}`,
    { method: 'GET', mode: 'cors', credentials: 'omit', referrer: 'https://sk.thorswap.net' },
  );

  return response.json();
};

export const postRequest = async <T>(
  url: string,
  body: string,
  headers?: Record<string, string>,
  parseAsString = false,
): Promise<T> => {
  const response = await fetch(`${url}`, {
    body,
    headers,
    method: 'POST',
    referrer: 'https://sk.thorswap.net',
  });

  return parseAsString ? response.text() : response.json();
};

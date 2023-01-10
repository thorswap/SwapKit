export const getRequest = async <T>(
  url: string,
  params?: { [key in string]?: any },
): Promise<T> => {
  const queryParams = Object.entries(params || {}).reduce((acc, [key, value]) => {
    if (value) {
      acc[key] = value;
    }

    return acc;
  }, {} as { [key in string]: any });

  const response = await fetch(
    `${url}${params ? `?${new URLSearchParams(queryParams).toString()}` : ''}`,
    { method: 'GET', mode: 'cors', credentials: 'omit' },
  );

  return response.json();
};

export const postRequest = async <T>(
  url: string,
  data: string,
  headers?: Record<string, string>,
  parseAsString = false,
): Promise<T> => {
  const response = await fetch(`${url}`, {
    method: 'POST',
    headers,
    body: data,
  });

  return parseAsString ? response.text() : response.json();
};

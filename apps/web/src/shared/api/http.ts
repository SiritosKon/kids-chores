import { API_PREFIX } from '@kids-chores/contracts';

export const apiRequest = async (path: string, method = 'GET', body?: unknown): Promise<Response | null> => {
  try {
    return await fetch(`${API_PREFIX}${path}`, {
      method,
      credentials: 'same-origin',
      headers: body === undefined ? undefined : { 'content-type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    return null;
  }
};

export const apiJson = async <T>(
  path: string,
  parse: (data: unknown) => T,
  method = 'GET',
  body?: unknown
): Promise<T | null> => {
  const response = await apiRequest(path, method, body);
  if (!response?.ok) {
    return null;
  }
  try {
    return parse(await response.json());
  } catch {
    return null;
  }
};

export const apiOk = async (path: string, method: string, body?: unknown): Promise<boolean> =>
  (await apiRequest(path, method, body))?.ok === true;

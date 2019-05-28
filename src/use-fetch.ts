import { useAsyncFn } from './use-async-fn';
import { useIsMounted } from './use-is-mounted';
import { Omit } from './utils';

export interface CustomError extends Error {
  details: {
    [key: string]: any;
  };
  response: Response;
  status: string;
}

export type UseFetchOptions = {
  body?: { [key: string]: any };
  url?: string;
  options?: Omit<RequestInit, 'body'>;
};

const checkStatus = async (response: Response) => {
  if (response.ok) return response;

  const error = new Error(`HTTP Error: ${response.statusText}`) as CustomError;

  if (response.status === 404) {
    error.details = { default: 'Not found' };
    throw error;
  }

  if (response.status === 401) {
    error.details = {
      default: 'You are not authorized to perform this action.',
    };
    throw error;
  }

  try {
    const errorData = await response.json();
    if (errorData.errors) {
      if (Array.isArray(errorData.errors)) {
        error.details = { default: errorData.errors.join('\n') };
      } else {
        error.details = errorData.errors ? errorData.errors : errorData;
      }
    }
  } catch (err) {
    error.details = { default: 'An error occurred.' };
  }
  throw error;
};

const request = <S = any>(
  defaultUrl: string,
  baseOptions: RequestInit,
  onSuccess: (data: S) => void,
  onError: (err: CustomError) => void,
) => async ({ body, url, options }: UseFetchOptions = {}) => {
  let finalOptions: RequestInit = {
    ...baseOptions,
    ...options,
  };

  const finalUrl = url ? url : defaultUrl;

  if (body) {
    finalOptions = {
      ...finalOptions,
      body: JSON.stringify(body),
      headers: {
        ...(options ? options.headers : {}),
        'Content-Type': 'application/json',
      },
    };
  }

  return fetch(finalUrl, finalOptions)
    .then(checkStatus)
    .then(res => (res.status !== 204 ? res.json() : res))
    .then(data => {
      onSuccess && onSuccess(data);
      return data;
    })
    .catch(err => {
      // if we abort the request, don't propogate it
      if (err && err.name && err.name === 'AbortError') return;
      onError && onError(err);
      throw err;
    });
};

export type UseFetch<S = any> = {
  url: string;
  options: RequestInit;
  onSuccess: (data: S) => void;
  onError: (error: CustomError) => void;
};

export const useFetch = <S = any>({
  url,
  options,
  onSuccess,
  onError,
}: UseFetch<S>) => {
  const controller = new AbortController();
  const { signal } = controller;

  useIsMounted(() => controller.abort());

  const fetchOptions = {
    ...options,
    signal,
  };

  const [state, callback] = useAsyncFn<S>(
    request<S>(url, fetchOptions, onSuccess, onError),
    [url],
  );

  return [state, callback];
};

export type BaseUseFetch = {
  getAuthorization?: () => { Authorization: string };
  getBaseUrl?: () => string;
  defaultOptions?: Partial<RequestInit>;
};

export const baseUseFetch = ({
  getAuthorization,
  getBaseUrl,
  defaultOptions,
}: BaseUseFetch) => {
  return <S = any>({ url, options, onSuccess, onError }: UseFetch<S>) => {
    const fetchUrl = getBaseUrl ? `${getBaseUrl()}${url}` : url;

    let fetchOptions = defaultOptions
      ? {
          ...defaultOptions,
          ...options,
        }
      : options;

    if (getAuthorization) {
      fetchOptions = {
        ...fetchOptions,
        headers: {
          ...(fetchOptions.headers || {}),
          ...getAuthorization(),
        },
      };
    }

    return useFetch<S>({
      url: fetchUrl,
      options: fetchOptions,
      onSuccess,
      onError,
    });
  };
};

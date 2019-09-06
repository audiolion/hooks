import fetchMock from 'fetch-mock';
import { act, renderHook } from 'react-hooks-testing-library';
import { checkStatus, request, useFetch, baseUseFetch } from '../use-fetch';

const url = 'http://example.com';
describe('checkStatus', () => {
  afterEach(() => {
    fetchMock.restore();
  });

  it('returns response if response is ok', async () => {
    fetchMock.once(url, 200);
    const res = await fetch(url).then(checkStatus);
    expect(res).toBeDefined();
  });

  it('returns not found error', async () => {
    fetchMock.once(url, 404);
    let err: any;
    await fetch(url)
      .then(checkStatus)
      .catch(error => {
        err = error;
      });
    expect(err.details).toStrictEqual({ default: 'Not found' });
  });

  it('returns unauthorized error', async () => {
    fetchMock.once(url, 401);
    let err: any;
    await fetch(url)
      .then(checkStatus)
      .catch(error => {
        err = error;
      });
    expect(err.details).toStrictEqual({
      default: 'You are not authorized to perform this action.',
    });
  });

  it('returns default error if error is not json', async () => {
    fetchMock.once(url, 500);
    let err: any;
    await fetch(url)
      .then(checkStatus)
      .catch(error => {
        err = error;
      });
    expect(err.details).toStrictEqual({
      default: 'An error occurred.',
    });
  });

  it('returns json error data', async () => {
    fetchMock.once(url, {
      status: 418,
      body: JSON.stringify({ errors: ['failed'] }),
    });
    let err: any;
    await fetch(url)
      .then(checkStatus)
      .catch(error => {
        err = error;
      });
    expect(err.details).toStrictEqual({
      default: 'failed',
    });

    fetchMock.once(`${url}/api/1`, {
      status: 418,
      body: JSON.stringify({ errors: { base: 'failed' } }),
    });

    await fetch(`${url}/api/1`)
      .then(checkStatus)
      .catch(error => {
        err = error;
      });
    expect(err.details).toStrictEqual({
      base: 'failed',
    });

    fetchMock.once(`${url}/api/2`, {
      status: 418,
      body: JSON.stringify({ base: 'failed' }),
    });

    await fetch(`${url}/api/2`)
      .then(checkStatus)
      .catch(error => {
        err = error;
      });
    expect(err.details).toStrictEqual({
      base: 'failed',
    });
  });
});

describe('request', () => {
  afterEach(() => {
    fetchMock.restore();
  });

  it('returns json data', async () => {
    fetchMock.once(url, {
      status: 200,
      body: JSON.stringify({ data: 'hi' }),
    });

    let success: any;
    const primedRequest = request(
      url,
      {},
      data => {
        success = data;
      },
      () => {},
    );

    const res = await primedRequest();
    expect(res).toStrictEqual({ data: 'hi' });
    expect(success).toStrictEqual({ data: 'hi' });
  });

  it('calls onError', async () => {
    fetchMock.once(url, {
      status: 418,
      body: JSON.stringify({ data: 'hi' }),
    });

    let error: any;

    const primedRequest = request(
      url,
      {},
      () => {},
      err => {
        error = err;
      },
    );

    await primedRequest().catch(() => {});
    expect(`${error}`).toEqual(`Error: HTTP Error: I'm a Teapot`);
  });

  it('accepts new url and body before sending request', async () => {
    fetchMock.once(url, {
      status: 200,
      body: JSON.stringify({ data: 'hi' }),
    });

    let success: any;
    const primedRequest = request(
      `${url}/1`,
      {},
      data => {
        success = data;
      },
      () => {},
    );

    const res = await primedRequest({ url, body: { hey: 'yo' }, options: {} });
    expect(res).toStrictEqual({ data: 'hi' });
    expect(success).toStrictEqual({ data: 'hi' });
  });
});

describe('useFetch', () => {
  afterEach(() => {
    fetchMock.restore();
  });

  it('fetches and returns data', async () => {
    fetchMock.once(url, {
      status: 200,
      body: JSON.stringify({ data: 'hi' }),
    });

    let success: any;
    const { result, waitForNextUpdate } = renderHook(() =>
      useFetch({
        url,
        options: {},
        onSuccess: data => {
          success = data;
        },
        onError: () => {},
      }),
    );

    let [state, callback] = result.current;
    expect(state).toStrictEqual({ loading: false });

    act(() => callback());

    [state, callback] = result.current;

    expect(state).toStrictEqual({ loading: true });

    await waitForNextUpdate();

    [state, callback] = result.current;

    expect(state).toStrictEqual({
      loading: false,
      value: { data: 'hi' },
    });
    expect(success).toStrictEqual({
      data: 'hi',
    });
  });

  it('aborts a fetch in-flight', async () => {
    fetchMock.once(url, {
      status: 200,
      body: JSON.stringify({ data: 'hi' }),
    });

    let error: any;
    const { result, unmount, waitForNextUpdate } = renderHook(() =>
      useFetch({
        url,
        options: {},
        onSuccess: () => {},
        onError: () => {},
      }),
    );

    let [state, callback] = result.current;
    expect(state).toStrictEqual({ loading: false });

    act(() => callback());

    [state, callback] = result.current;

    expect(state).toStrictEqual({ loading: true });

    unmount();

    [state, callback] = result.current;

    expect(state).toStrictEqual({
      loading: true,
    });
    expect(error).toBeUndefined();
  });
});

describe('baseUseFetch', () => {
  it('initializes useFetch', async () => {
    fetchMock.postOnce(`${url}/api`, {
      status: 201,
      body: JSON.stringify({ success: true }),
    });
    const useFetch = baseUseFetch({
      getAuthorization: () => ({ Authorization: 'Token hi' }),
      getBaseUrl: () => 'http://example.com',
      defaultOptions: {
        method: 'POST',
      },
    });

    const { result, waitForNextUpdate } = renderHook(() =>
      useFetch({
        url: '/api',
        options: {},
        onSuccess: () => {},
        onError: () => {},
      }),
    );

    let [state, callback] = result.current;

    expect(state.loading).toBe(false);

    act(() => callback());

    [state, callback] = result.current;

    expect(state.loading).toBe(true);

    await waitForNextUpdate();

    [state, callback] = result.current;

    expect(state.loading).toBe(false);

    expect(state.value).toStrictEqual({
      success: true,
    });
  });
});

import { act, renderHook } from 'react-hooks-testing-library';
import { checkStatus } from '../use-fetch';
import fetchMock from 'fetch-mock';

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
      headers: { 'Content-Type': 'application/json' },
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

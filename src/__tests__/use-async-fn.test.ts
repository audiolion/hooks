import { act, renderHook } from 'react-hooks-testing-library';
import { useAsyncFn } from '../use-async-fn';

test('async fn is called and state updates with value', async () => {
  const data = { foo: 'bar' };
  const mockFetch = async () => {
    return data;
  };

  const { result, waitForNextUpdate } = renderHook(() =>
    useAsyncFn<{ foo: string }>(mockFetch),
  );

  let [state, callback] = result.current;

  expect(state.loading).toBe(false);
  expect(state.error).toBe(undefined);
  expect(state.value).toBe(undefined);

  act(() => callback());

  [state, callback] = result.current;

  expect(state.loading).toBe(true);
  expect(state.error).toBe(undefined);
  expect(state.value).toBe(undefined);

  await waitForNextUpdate();

  [state, callback] = result.current;

  expect(state.loading).toBe(false);
  expect(state.error).toBe(undefined);
  expect(state.value).toBe(data);
});

test('async fn is called and state updates with error', async () => {
  const message = 'error!';
  const mockFetch = async () => {
    throw new Error(message);
  };

  const { result, waitForNextUpdate } = renderHook(() =>
    useAsyncFn<{ foo: string }>(mockFetch),
  );

  let [state, callback] = result.current;

  expect(state.loading).toBe(false);
  expect(state.error).toBe(undefined);
  expect(state.value).toBe(undefined);

  act(() => callback());

  [state, callback] = result.current;

  expect(state.loading).toBe(true);
  expect(state.error).toBe(undefined);
  expect(state.value).toBe(undefined);

  await waitForNextUpdate();

  [state, callback] = result.current;

  expect(state.loading).toBe(false);
  expect(state.error).toBeTruthy();
  state.error && expect(state.error.message).toBe(message);
  expect(state.value).toBe(undefined);
});

test('async fn is called and state does NOT update if component unmounts', async () => {
  const data = { foo: 'bar' };
  const mockFetch = async () => {
    return data;
  };

  const { result, unmount } = renderHook(() =>
    useAsyncFn<{ foo: string }>(mockFetch),
  );

  let [state, callback] = result.current;

  expect(state.loading).toBe(false);
  expect(state.error).toBe(undefined);
  expect(state.value).toBe(undefined);

  act(() => callback());

  [state, callback] = result.current;

  expect(state.loading).toBe(true);
  expect(state.error).toBe(undefined);
  expect(state.value).toBe(undefined);

  unmount();

  [state, callback] = result.current;

  expect(state.loading).toBe(true);
  expect(state.error).toBe(undefined);
  expect(state.value).toBe(undefined);
});

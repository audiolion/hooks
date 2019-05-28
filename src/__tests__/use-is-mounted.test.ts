import { renderHook } from 'react-hooks-testing-library';
import { useIsMounted } from '../use-is-mounted';

test('Returns whether component is mounted or unmounted', () => {
  const { result, rerender, unmount } = renderHook(() => useIsMounted());

  expect(result.current.current).toBe(true);

  rerender();

  expect(result.current.current).toBe(true);

  unmount();

  expect(result.current.current).toBe(false);
});

test('Runs cleanup function on unmount', () => {
  let data = null;
  const onCleanup = () => {
    data = 'cleanup!';
  };

  const { result, unmount } = renderHook(() => useIsMounted(onCleanup));

  expect(data).toBe(null);

  unmount();

  expect(data).toBe('cleanup!');
});

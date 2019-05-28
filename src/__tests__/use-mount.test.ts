import { renderHook } from 'react-hooks-testing-library';
import { useMount } from '../use-mount';

test('should run on mount', () => {
  let data = null;
  const updateData = () => {
    data = 'foo';
  };
  const { rerender, unmount } = renderHook(() => useMount(updateData));

  expect(data).toEqual('foo');

  data = 'bar';
  rerender();

  // value does not change back to 'foo'
  expect(data).toEqual('bar');

  unmount();

  renderHook(() => useMount(updateData));

  expect(data).toEqual('foo');
});

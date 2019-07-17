import { renderHook, act } from 'react-hooks-testing-library';
import { useTimeout } from '../use-timeout';

jest.useFakeTimers();

describe('useTimeout', () => {
  it('should tell you when timeout occurs', () => {
    const { result } = renderHook(() => useTimeout(1000));

    expect(result.current).toBe(false);

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(result.current).toBe(true);
  });

  it('should immediately dispaly timeout if delay is zero', () => {
    const { result } = renderHook(() => useTimeout(0));

    expect(result.current).toBe(true);
  });

  it('should immediately dispaly timeout if delay is negative', () => {
    const { result } = renderHook(() => useTimeout(-1));

    expect(result.current).toBe(true);
  });

  it('should not call setState if component unmounts', () => {
    const { result, unmount } = renderHook(() => useTimeout(1000));

    expect(result.current).toBe(false);

    jest.advanceTimersByTime(100);

    unmount();

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(result.current).toBe(false);
  });
});

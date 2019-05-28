import React, { DependencyList } from 'react';
import { useIsMounted } from './use-is-mounted';

export type AsyncState<S> =
  | {
      loading: boolean;
      error?: undefined;
      value?: undefined;
    }
  | {
      loading: false;
      error: Error;
      value?: undefined;
    }
  | {
      loading: false;
      error?: undefined;
      value: S;
    };

export const useAsyncFn = <S = any>(
  fn: (args?: any) => Promise<S>,
  deps: DependencyList = [],
): [AsyncState<S>, () => void] => {
  const [state, set] = React.useState<AsyncState<S>>({
    loading: false,
  });

  const isMounted = useIsMounted();

  const callback = React.useCallback((args?: any) => {
    if (isMounted.current) {
      set({ loading: true });

      fn(args).then(
        value => {
          isMounted.current && set({ value, loading: false });
        },
        error => {
          console.error(error);
          isMounted.current && set({ error, loading: false });
        },
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return [state, callback];
};

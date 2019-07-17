import React from 'react';
import { useMount } from './use-mount';
import { useIsMounted } from './use-is-mounted';

export function useTimeout(delay: number) {
  const [timer, setTimer] = React.useState<any>();
  const [timedOut, setTimedOut] = React.useState(delay <= 0 ? true : false);
  const isMounted = useIsMounted(() => timer && clearTimeout(timer));

  useMount(() => {
    const innerTimer = setTimeout(() => {
      if (isMounted.current) {
        setTimedOut(true);
      }
    }, delay); // tslint:disable-line
    if (isMounted.current) {
      setTimer(innerTimer);
    }
  });

  return timedOut;
}

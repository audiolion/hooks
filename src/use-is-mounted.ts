import React from 'react';

export function useIsMounted(onCleanup?: () => void) {
  const isMounted = React.useRef(true);

  React.useEffect(() => {
    return function cleanup() {
      isMounted.current = false;
      onCleanup && onCleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return isMounted;
}

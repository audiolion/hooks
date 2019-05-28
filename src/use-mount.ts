import React from 'react';

export function useMount(fn: () => any) {
  React.useEffect(fn, []);
}

import React from 'react';

export function useMount(fn) {
  React.useEffect(fn, []);
}

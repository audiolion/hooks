# Hooks

> React Hooks for general use

[![codecov](https://codecov.io/gh/audiolion/hooks/branch/master/graph/badge.svg)](https://codecov.io/gh/audiolion/hooks)

## Installation

```shell
$ yarn add @ryanar/hooks
```

## API

### useMount

Run an effect once when the component mounts. Mostly analagous to `componentDidMount` lifecycle method. Note that this uses `React.useEffect` under the hood and not `React.useLayoutEffect` so it is not the -exact- same as `componentDidMount`.

```js
import { useMount } from '@ryanar/hooks';

const updateDocumentTitle = async () => {
  document.title = 'New page title';
};

function Component() {
  useMount(updateDocumentTitle);
  return null;
}
```

### useIsMounted

Useful in conjunction with other hooks where you want to only perform an action if the component is still mounted, e.g. after a side effect.

```js
import { useIsMounted } from '@ryanar/hooks';

const fetchData = async () => {
  return fetch('https://swapi.co/api/people/1').then(res => res.json())
};

function Component() {
  const [state, setState] = React.useState({});
  const isMounted = useIsMounted();
  React.useEffect(() => {
    fetchData().then(data => {
      if (isMounted.current) {
        setState(data);
      }
    })
  }, [])
  return null;
}
```

`useIsMounted` also takes a callback function to do some cleanup when the component unmounts.


```js
import { useIsMounted } from '@ryanar/hooks';

const fetchData = async (options) => {
  return fetch('https://swapi.co/api/people/1', options).then(res => res.json())
};

function Component() {
  const [state, setState] = React.useState({});

  const controller = new AbortController();
  
  const isMounted = useIsMounted(() => controller.abort());
  
  React.useEffect(() => {
    fetchData({ signal: controller.signal }).then(data => {
      setState(data);
    })
  }, [])
  return null;
}
```

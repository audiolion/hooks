# Hooks

> React Hooks for general use

[![codecov](https://codecov.io/gh/audiolion/hooks/branch/master/graph/badge.svg)](https://codecov.io/gh/audiolion/hooks)

## Why?

I wanted my own package of hooks that:

- I tested myself
- use TypeScript
- are [Tree-shakeable](https://webpack.js.org/guides/tree-shaking/)

## Installation

```shell
$ yarn add @ryanar/hooks
```

## API

Hooks

- [useMount](#useMount)
- [useIsMounted](#useIsMounted)
- [useAsyncFn](#useAsyncFn)
- [useFetch](#useFetch)
- [useTimeout](#useTimeout)

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
  return fetch('https://swapi.co/api/people/1').then(res => res.json());
};

function Component() {
  const [state, setState] = React.useState({});
  const isMounted = useIsMounted();
  React.useEffect(() => {
    fetchData().then(data => {
      if (isMounted.current) {
        setState(data);
      }
    });
  }, []);
  return null;
}
```

`useIsMounted` also takes a callback function to do some cleanup when the component unmounts.

```js
import { useIsMounted } from '@ryanar/hooks';

const fetchData = async options => {
  return fetch('https://swapi.co/api/people/1', options).then(res =>
    res.json(),
  );
};

function Component() {
  const [state, setState] = React.useState({});

  const controller = new AbortController();

  const isMounted = useIsMounted(() => controller.abort());

  React.useEffect(() => {
    fetchData({ signal: controller.signal }).then(data => {
      setState(data);
    });
  }, []);
  return null;
}
```

### useAsyncFn

This hook is a nice building block for doing anything asynchronously.

```js
import { useAsyncFn } from '@ryanar/hooks';

function getCoffee() {
  return new Promise(resolve => {
    setTimeout(() => resolve('☕'), 2000); // it takes 2 seconds to make coffee
  });
}

function Component() {
  const [state, callback] = useAsyncFn()

  React.useEffect(() => {
    callback()
  }, [callback]);

  const { loading, error, value } = state;

  if (loading) {
    return 'Loading..';
  }

  if (error) {
    alert('Error!');
    return null;
  }

  return (
    {/* returns <p>☕️</p> */}
    <p>{value}</p>
  );
}
```

### useFetch

Easily integrate [fetch](https://fetch.spec.whatwg.org/) with requests that abort in-flight when the component unmounts.

```js
import { useFetch } from '@ryanar/hooks';

function Component() {
  const [state, doFetch] = useFetch('https://swapi.co/api/people/1', {
    method: 'GET',
  });

  React.useEffect(() => {
    doFetch();
  }, [doFetch]);

  const { loading, error, value } = state;

  if (loading) {
    return 'Loading..';
  }

  if (error) {
    alert('Error!');
    return null;
  }

  return <pre>{JSON.stringify(value)}</pre>;
}
```

To make this hook more useful, you can build your own `useFetch` from `baseUseFetch` which will handle repeated tasks like including your api's base url, setting authorization, and default options.

```js
import { useBaseFetch } from '@ryanar/hooks';

const useSwapiFetch = useBaseFetch({
  getBaseUrl: () => 'https://swapi.co/api',
  getAuthorization: () => {
    const token = localStorage.getItem('api-token');
    return {
      Authorization: `Bearer ${token}`,
    };
  },
  defaultOptions: {
    headers: {
      'Content-Type': 'application/json',
    },
  },
});

function Component() {
  const [state, doFetch] = useSwapiFetch('/people/1', { method: 'GET' });

  React.useEffect(() => {
    doFetch();
  }, [doFetch]);

  const { loading, error, value } = state;

  if (loading) {
    return 'Loading..';
  }

  if (error) {
    alert('Error!');
    return null;
  }

  return <pre>{JSON.stringify(value)}</pre>;
}
```

### useTimeout

If you want to change behavior of your component after a timeout occurs.

```js
import { useTimeout } from '@ryanar/hooks';

function Component() {
  const tenSeconds = 1000 * 10;
  const timedOut = useTimeout(tenSeconds);

  if (timedOut) {
    return 'Sorry, the request is taking too long too load.';
  }

  return null;
}
```

# Hooks

> React Hooks for general use

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

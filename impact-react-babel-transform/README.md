<p align="center">
  <img align="center" src="./Icon.png" />
</p>
<p align="center">
  <b>Observable contexts for React</b>
</p>

## Why

Observable primitives are typically organised in a global context. With `impact-react-store` you can organise any observable primitives and the related state management with React contexts.

Read more about [impact-react](https://impact-react.dev) and how to use nested stores.

## Install

```sh
npm install impact-react-store
```

## Configure store

To use observable primitives with the React context you need to configure the props so that they also become observable. When React reconciles the props passed into the store might change, which you will be able to observe.

- [mobx](#mobx)
- [jotai](#jotai)
- [legend](#legend)

### mobx

```ts
import { configureStore } from "impact-react-store";
import { observable } from "mobx";

export const createStore = configureStore((prop) => {
  const box = observable.box(prop);

  return {
    get() {
      return box.get();
    },
    set(newProp) {
      box.set(newProp);
    },
  };
});
```

There is no change to the typing.

### jotai

```ts
import { configureStore } from "impact-react-store";
import { atom } from "jotai";

export const createStore = configureStore((prop) => {
  const value = atom(prop);
  const getter = atom((get) => get(value));

  return {
    get() {
      return getter;
    },
    set(newProp) {
      value.set(newProp);
    },
  };
});
```

Type the props as `type Props = { foo: Atom<string> }`

### Legend

```ts
import { configureStore } from "impact-react-store";
import { observable, computed } from "@legendapp/state";

export const createStore = configureStore((prop) => {
  const value = observable(prop);
  const getter = computed(() => value.get());

  return {
    get() {
      return getter;
    },
    set(newProp) {
      value.set(newProp);
    },
  };
});
```

Type the props as `type Props = { foo: ObservableComputed<string> }`

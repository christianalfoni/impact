# Messages

When you return an interface from a store, that interface is public. That means all nested components and stores has access to that interface. Often there is certain management of state that should only be managed by the stores. You want a private interface between the stores.

Since stores are decoupled from each other **Impact** uses an [RPC](https://en.wikipedia.org/wiki/Remote_procedure_call) implementation to achieve this. That means a store can define a `receiver`, handling messages from nested stores, and nested stores can define an `emitter`, sending messages to parent stores. A `message` is really just a method call where you can send any number of parameters and also get a result. This is what RPC conceptually is, decoupled method calling.

```ts
import { receiver, emitter } from "impact-react";

export type GlobalStoreMessages = {
  addListItem(item: string): void;
};

function GlobalStore() {
  // We have some state that we only want to be changed by other stores
  const [list, setList] = signal<string[]>([]);

  // We register a message we will handle to update the list
  receiver<GlobalStoreMessages>({
    addListItem(item) {
      setList((current) => [...current, item]);
    },
  });

  return {
    list,
  };
}

function SomeNestedStore() {
  // We only need to create an emitter where we add the types of messages to send
  const emit = emitter<GlobalStoreMessages>();

  return {
    doSomething() {
      // Simply call the method and any returned result will also be returned here
      emit.addListItem("foo");
    },
  };
}
```

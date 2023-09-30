# Reactivity

By default it can be a good idea to use the reactive state primitives shipped with **Impact**. This is a very straight wayforward way to define state and and consume them optimally in React and other stores. That said, these stores can expose any state primitive and you can even make combine state tools with the reactive primitives of Impact to optimally consume them in components.

You could use a state machine from [XState](https://xstate.js.org/):

```ts
import {  signal, useCleanup } from 'impact-app'
import { createMachine, interpret, assign } from 'xstate';

const increment = (context) => context.count + 1;
const decrement = (context) => context.count - 1;

const counterMachine = createMachine({
  initial: "active",
  context: {
    count: 0,
  },
  states: {
    active: {
      on: {
        INC: { actions: assign({ count: increment }) },
        DEC: { actions: assign({ count: decrement }) },
      },
    },
  },
});

export function CounterStore() {
    const counterService = interpret(counterMachine).start();
    const context = signal(counterService.getSnapshot().context);

    counterService.onChange(onContextChange);

    useCleanup(() => counterService.off(onContextChange));

    function onContextChange(newContext) {
        context.value = newContext;
    }

    return {
        get count() {
            return context.value.count;
        },
        increaseCount() {
          counterService.send("INC");
        },
        decreaseCount() {
          counterService.send("DEC");
        }
    };
}
```

Or you could even replace signals with `observables` from [Mobx](https://mobx.js.org/README.html):

```ts
import { observable } from 'mobx'

export function MessageStore() {
    const messages = observable<string[]>([])

    return {
        messages,
        addMessage(message: string) {
            messages.push(message)
        }
    }
}
```
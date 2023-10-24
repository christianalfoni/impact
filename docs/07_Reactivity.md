# Reactivity

By default it can be a good idea to use the reactive state primitive shipped with **Impact**. This is a very straight forward way to define state and and consume them optimally in React and other stores. That said, these contexts can expose any state primitive and you can even make combine state tools with the reactive primitives of Impact to optimally consume them in components.

You could use a state machine from [XState](https://xstate.js.org/):

```ts
import {  signal, cleanup, context } from 'impact-app'
import { createMachine, interpret, assign } from 'xstate';

const increment = (state) => state.count + 1;
const decrement = (state) => state.count - 1;

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

const useSomePageContext = context(() => {
    const counterService = interpret(counterMachine).start();
    const state = signal(counterService.getSnapshot().context);

    counterService.onChange(onContextChange);

    cleanup(() => counterService.off(onContextChange));

    function onContextChange(newState) {
        state.value = newState;
    }

    return {
        get count() {
            return state.value.count;
        },
        increaseCount() {
          counterService.send("INC");
        },
        decreaseCount() {
          counterService.send("DEC");
        }
    };
})
```

Or you could even replace signals with `observables` from [Mobx](https://mobx.js.org/README.html):

```ts
import { context, observable } from 'mobx'

export const useSomePageContext = context(() => {
    const messages = observable<string[]>([])

    return {
        messages,
        addMessage(message: string) {
            messages.push(message)
        }
    }
})
```
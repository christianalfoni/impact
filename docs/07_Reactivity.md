# Reactivity

By default it can be a good idea to use the reactive state primitives shipped with **Impact**. This is a very straight forward to define state and and consume them optimally in React and other stores. That said, these stores can expose any reactive state primitive and you can even make combine state tools with the reactive primitives of Impact to optimally consume them in components.

For example you could choose to use `observables` from [Mobx](https://mobx.js.org/README.html).

```ts
import { observable } from 'mobx'
import { createStore } from 'impact-app'

function HelloWorld() {
    const messages = observable<string[]>([])

    return {
        messages,
        addMessage(message: string) {
            messages.push(message)
        }
    }
}

export const useHelloWorld = createStore(HelloWorld)
```

Or you could use a state machine from [XState](https://xstate.js.org/):

```ts
import { createStore, signal } from 'impact-app'
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

function Counter() {
    const counterService = interpret(counterMachine).start();
    const context = signal(counterService.getSnapshot().context);

    counterService.onChange(onContextChange);

    cleanup(() => counterService.off(onContextChange));

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

export const useCounter = createStore(Counter)
```


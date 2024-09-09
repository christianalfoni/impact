# Giving up on React

## Introduction

After the summer of 2014 I quit my job as a consultant. Up to that point I had worked on several projects, amongst those building a highly interactive web based switchboard for mobile phones. It would take events from the GSM network to produce your call state, show queues of callers, conference calls, sms, phonebooks, call groups, outlook sync etc. It was all written in JavaScript and we used no frameworks. It gave me a solid understanding of the language and how to organise and scale code.

I must have been a magnet to productivity tools, cause that is all I have been working on since. Managing a lot of client state due to complex user interfaces that has a high degree of interactivity. To manage all this I built tools like [Cerebral](https://cerebraljs.com/), later [Overmind](https://overmindjs.org/) and written a myriad of articles like [Value comparison VS mutation tracking](https://medium.com/itnext/updating-uis-value-comparison-vs-mutation-tracking-9f6fe912dd9a), [Reducing the pain of developing apps](https://medium.com/@christianalfoni/reducing-the-pain-of-developing-apps-cd10b2e6a83c), [UI as an implementation detail](https://medium.com/swlh/ui-as-an-implementation-detail-7fb9f952fb43) etc. My most recent work has been at [CodeSandbox](https://codesandbox.io).

In this article I am going to share some strong opinions and even though these opinions are based on my experience with React, it is also based on the types of applications I have been building. React is a tool I honestly owe my whole career to. Please keep this in mind as you read on.

## User interfaces as a function of state

I quit my job in 2014 because my partner and me where moving across the country and I wanted to spend 6 months self educating. I was increadibly lucky because at this point React and Webpack was starting to take hold. I remember being hesitant to begin with, but long story short the idea of `(state) => ui` resonates as strongly with me today, as it did when I first got it.

```ts
function Counter(props) {
  return <div>{props.count}</div>
}
```

Every time the `count` changes, this `Counter` function runs again and React will reconcile and update the DOM. But what truly makes this great is:

```ts
function Counter(props) {
  if (props.count > 10) {
    return <div>Wow, {props.count}</div>
  }

  return <div>{props.count}</div>
}
```

I can just use JavaScript to create the dynamic behaviour of this user interface. But not only that, I get complete TypeScript support out of the box. Not only to infer the types of the props, but type narrowing and any other feature from TypeScript that applies to expressing dynamic user interfaces. This is a really good thing when building large productivity apps.

But this core concept of `(state) => ui` has been faded over time in React. This fundamental concept that makes so much sense first started to diminish with the introduction of hooks:

```ts
function Counter() {
  const [count, setCount] = useState(0)

  return <div onClick={() => setCount(count + 1)>Count: {count}</div>
}
```

Embracing the component as a function makes sense, but the introduction of hooks disrupted React developers intuition about how code is executed in the language runtime. For example every time this component reconciles it looks like it will initialise the count state, but that is not true, it will only do it on the first call of the component function. The function looks stateless and pure, but there is this hidden state in React that you can not see by reading the code.

This disruption becomes an even bigger problem as hooks can introduce multiple function closures in the component scope. Without hooks there are no active closures. Let us inspect the `Counter` again.

```ts
function Counter(props) {
  if (props.count > 10) {
    return <div>Wow, {props.count}</div>
  }

  return <div>{props.count}</div>
}
```

When you read this code your intuition tells you that we are just calling a function and there is nothing "stuck" that will affect the next call of the function. But with hooks this can happen:

```ts
function Counter(props) {
  useEffect(() => {
    console.log("Are we toggled?", props.toggled)
  }, [props.toggled])

  if (props.count > 10) {
    return <div>Wow, {props.count}</div>
  }

  return <div>{props.count}</div>
}
```

The callback passed to `useEffect` creates a "stuck" function scope for the effect based on `props.toggled` we put in the dependency array. That means some of the code in your component lives longer than the last reconciliation of the user interface. But not only that, different closures are bound to different past reconcilations:

```ts
function Counter(props) {
  useEffect(() => {
    setTimeout(() => console.log(props.count), 1000)
  }, [props.toggled])

  if (props.count > 10) {
    return <div>Wow, {props.count}</div>
  }

  return <div>{props.count}</div>
}
```

If this component reconciles during the timeout, due to `count` being increased, the log will still show `0`. I know it is a silly example, but the point is that hooks disrupted our intuition on how code executes and it is an additional mental overhead to the simplicity of `(state) => ui`.

## Making it faster

React has never been the most performant solution because of the reconciler, but the reconciler is what has given us the ability to just use the language to express dynamic user interfaces using a function. To improve the performance of React we have typically leaned on `memo`. This primitive is basically a wrapper around components doing "props checking" to see if React needs to reconcile that component.

What I find curious though is that React has such eager reconciliation. For example:

```ts
function MyComponent() {
  return <div>Hello there</div>
}

function ParentComponent({ count }) {
  return (
    <div>
      <h1>Count {count}</h1>
      <MyComponent />
    </div>
  )
}
```

When the `count` updates in `ParentComponent` it will by default reconcile the `MyComponent` as well, even though it takes no props. Why reconcile `(state) => ui` if there is no `state`? And then there is a question why `memo` is not internally added on any component taking props? There is of course an argument that the comparing of the props is overhead when they often change. The extreme case would just add work as it would compare the props _and_ reconcile every time. But calling a component, evaluate all the hooks and reconcile the returned user interface description... my intuition just tells me that this default comparing of props would end up net positive. But who am I to challenge this. The reason I talk about it though is what follows.

As React had performance issues it introduced concurrent mode. Concurrent mode allowed React to split up its reconciliation work. Previously the reconciliation was blocking, meaning that there was risk of jank in the user interface when the component trees are big and `memo` is not efficiently used. And with concurrent mode we got `StrictMode`. `StrictMode` was thought of as a way to help developers detect side effects in their components due to wrong hooks usage. In development, React will call components, hooks and lifecycle hooks twice to ensure that there are no side effects. This is important as concurrent mode needs a guarantee that any pending reconciled component tree can be thrown away. But with this addition the inuition of how a React component works was disrupted again. Previously you could safely:

```ts
function MyComponent() {
  useEffect(() => {
    // I mounted
    return () => {
      // I unmounted
    };
  }, []);
}
```

But this was no longer possible and added confusion as things are running twice in development. We basically lost the most basic lifecycle hook for components; when the user interface is mounted and when it is unmounted.

And now we are here with React 19 and its compiler. The compiler optimises your code, adding memoization for you. But there is one thing the compiler will not fix, and it is the most important source of performance issues in my experience; contexts. One of the main reasons for performance issues is sharing state across components. To do that efficiently we use a React context. The consuming components will reconcile when the value from the context changes:

```ts
function MyContext({ children }) {
  const reducer = useReducer(...)

  return (
    <context.Provider value={reducer}>
      {children}
    </context.Provider>
  )
}
```

What this means in practice is that consuming components will reconcile regardless of what state from this reducer they are consuming. This is something the React Compiler can not fix. It can memoize as much as it wants in `MyContext`, but at the end of the day the value passed on the context has to change and every single consuming component will reconcile.

So even with the React Compiler we will still be leaning towards global state management solutions to fix the performance issues of React. And this is my biggest friction with React. Why do we need to work with two different sets of state management primitives, in different types of runtimes to build applications?

## Rolling back

So let us move back in time. There is no React Compiler, there is no concurrent mode, no strict mode and no hooks... back to `(state) => ui`. If React rather introduced reactive primitives and made components observers, could we have avoided having to deal with the mental overhead of hooks, strict mode, no lifecycle hooks, react compiler and a secondary global state management solution?

I am of course in no position to conclude on that, but I am allowed to ask the question right?

We will never know, but maybe there is a solution out there that did take a different path. A solution that allows us to keep what we fundamentally love about React, but without all this overhead and performance concerns with state management? Let us list what it needs to fulfill:

- JSX support
- Reconciles the user interface, adhearing to `(state) => ui`
- Components should only reconcile by what they observe, meaning they default to not reconciling from parents
- Reactive primitives defined in a separate scope, but exposed to the component where we reconcile the user interface
- Lifecycle hooks

Even though we are trying to break up with React due to the technical decisions, we still want a community and ecosystem. With that in mind our choices are [Vue](), [Svelte](), [Angular]() and [Solid JS](). We can immediately drop off **Svelte** and **Angular** as templates and custom type checking is not where we want to go. **Solid JS** does get us quite close, but there is no reconciliation in Solid JS, meaning we can not rely on the language for expressing dynamic user interfaces. That leaves us with **Vue**.

We are going to continue now by first evaluating the the API available to use in Vue. Just see how far we get and what tradeoffs we have to make. Then we are going to see if we can do something about these tradeoffs.

## Evaluating Vue

All Vue projects uses [Vite](), also developed by the Vue team. In the default configuration we just change to `@vitejs/plugin-vue-jsx`. We are ready to embrace reconciling user interfaces and observing state.

```ts
import { defineConfig } from "vite";
// import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vueJsx()],
});
```

Let us start by defining a simple component and render it:

```tsx
export function App() {
  return <h1>Hello World</h1>;
}
```

```tsx
import { createApp } from "vue";
import { App } from "./App";

createApp(App).mount("#root");
```

We can also use props:

```tsx
function HelloWorld(props: { message: string }) {
  return <h1>Hello World: {props.message}</h1>;
}

export function App() {
  return <HelloWorld message="This is Vue" />;
}
```

Now let us look at the final core mechanic, children. So in React we use `props.children`, but Vue has a different approach, called `slots`.

```tsx
import { useSlots } from "vue";

function HelloWorld() {
  const slots = useSlots();

  return <h1>Hello World: {slots.default?.()}</h1>;
}

export function App() {
  return <HelloWorld>This is Vue</HelloWorld>;
}
```

It is certainly simpler to use `{ children }` from the props and with React they will also be typed when consuming the component.

Talking about state, let us define some state. React defines its state management in the same function as the reconciling user interface. When our state management is reactive we need to define it in its own function scope.

Let us first look at how we would write this in React:

```tsx
import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);

  function increase() {
    setCount(count + 1);
  }

  return (
    <div>
      <h4>Count is {count}</h4>
      <button onClick={increase}>Increase count</button>
    </div>
  );
}
```

And now let us see how this would be defined with what we have from Vue by default, using `defineComponent`:

```tsx
import { ref, defineComponent } from "vue";

export const Counter = defineComponent(() => {
  const count = ref(0);

  function increase() {
    count.value++;
  }

  return function Counter() {
    return (
      <div>
        <h4>Count is {count.value}</h4>
        <button onClick={increase}>Increase count</button>
      </div>
    );
  };
});
```

`defineComponent` is a low level API that I personally do not think communicates well enough the higher level terminology of Vue and how our reactive state management scope and our reconciling user interface scope relates to each other. This signature is simply not good enough to convince a React developer to use Vue and convincing a React developer to move to templates is an even harder sell.... like, I am one of them.

Let us imagine that Vue rather exported a `createComponent` that better communicates what we are trying to conceptualise and give a nod to the name of an early React API at the same time.

First the example of React again:

```tsx
import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);

  function increase() {
    setCount(count + 1);
  }

  return (
    <div>
      <h4>Count is {count}</h4>
      <button onClick={increase}>Increase count</button>
    </div>
  );
}
```

Now how Vue single file components would do it:

```html
<script setup lang="ts">
  import { ref } from "vue";

  let count = ref(0);
</script>
<template>
  <div>
    <h4>Count is {count}</h4>
    <button onClick="{()" ="">count++}>Increase count</button>
  </div>
</template>
```

And now using `createComponent`:

```tsx
import { ref, createComponent } from "vue";

function Setup() {
  const count = ref(0);

  function increase() {
    count.value++;
  }

  return {
    get count() {
      return count.value;
    },
    increase,
  };
}

function Template(state) {
  return (
    <div>
      <h4>Count is {state.count}</h4>
      <button onClick={state.increase}>Increase count</button>
    </div>
  );
}

export default createComponent("Counter", Setup, Template);
```

What we achieve now are three things:

1. We properly separate the two scopes. Our `Setup` function is our reactive scope for state management. The `Template` is the scope for the reconciling user interface
2. If you compare this to the Vue template they use the same terminology and even look very much the same
3. Our `Setup` completely controls the changes to state. With `defineComponent` state changes can be made from both the state management scope and the user interface scope

But what if we wanted to share the state of this counter with other components? Instead of wiring up a context and risk performance issues or adopt a global state management solution with its own primitives and perspectives, what if Vue exported a similar `createStore` function?

```tsx
import { ref, createStore } from "vue";

function Setup() {
  const count = ref(0);

  function increase() {
    count.value++;
  }

  return {
    get count() {
      return count.value;
    },
    increase,
  };
}

const [CounterProvider, injectCounter] = createStore(Setup);

export { CounterProvider, injectCounter };
```

And given that we provide the Counter we are now able to use this counter in any nested component, it being the _template_ or the _setup_.

```tsx
// <CounterProvider>
function Counter(state) {
  const globalStore = injectCounter();

  return (
    <div>
      <h4>Count is {globalStore.count}</h4>
      <button onClick={globalStore.increase}>Increase count</button>
    </div>
  );
}
// </CounterProvider>
```

The important thing to highlight here is:

1. We just renamed our `CounterSetup` to `CounterStore`. This is not about time spent refactoring, but that local, scoped and global state is defined _exactly_ the same. It is only about how it is provided
2. We did not have to choose different primitives to do shared state management
3. There are absolutely no concerns on performance. The stores can be as big as you want, only the state components actually access from the store is what causes it to reconcile, and optimally so

## Beyond state and ui

- True open source UI framework
- Debugger
- Vite
- Complete toolchain
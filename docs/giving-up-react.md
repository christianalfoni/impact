# Giving up on React (WIP)

## Introduction

After the summer of 2014 I quit my job as a consultant. Up to that point I had worked on several projects, amongst those building a highly interactive web based switchboard for mobile phones. It would take events from the GSM network to produce your call state, show queues of callers, conference calls, sms, phonebooks, call groups, outlook sync etc. The client was written in JavaScript and we used no existing tooling. It gave me a solid understanding of the language and how to organise and build tooling to scale code. During this project, and later projects, I worked with junior engineers and experienced how productive we can all be using tools that reflects a strong mental model of how to build an application.

I must have been a magnet to productivity tools, cause that is all I have been working on since. Managing a lot of client state due to complex user interfaces that has a high degree of interactivity. To manage all this complexity I built tools like [Cerebral](https://cerebraljs.com/), later [Overmind](https://overmindjs.org/) and written a myriad of articles like [Value comparison VS mutation tracking](https://medium.com/itnext/updating-uis-value-comparison-vs-mutation-tracking-9f6fe912dd9a), [Reducing the pain of developing apps](https://medium.com/@christianalfoni/reducing-the-pain-of-developing-apps-cd10b2e6a83c), [UI as an implementation detail](https://medium.com/swlh/ui-as-an-implementation-detail-7fb9f952fb43) etc. My most recent work has been at [CodeSandbox](https://codesandbox.io).

In this article I am going to share some strong opinions about React. I will do my best to explain the source of the frustration. Nevertheless React is a tool I honestly owe my whole career to. My time with React has in no way been a waste of time. It has been exceptionally educational, helped me contritube to open source and led my to amazing career opportunities. That said, I want to simplify the process of building productivity types of applications, balancing moving fast and ability to scale. Allow juniors and seniors in the same team feel productive and spend time on what matters; creating an amazing user experience. Over time React has added more and more friction to reaching that goal.

## User interfaces as a function of state

I quit my job in 2014 because my partner and me where moving across the country and I wanted to spend 6 months self educating. I was increadibly lucky because at this point React and Webpack was just starting to take hold. I remember being hesitant to begin with, but long story short the idea of `(state) => ui` resonates as strongly with me today as it did when I first understood it.

```ts
function Counter(props) {
  return <div>{props.count}</div>
}
```

Every time the `count` changes, this `Counter` function runs again and React will reconcile and update the DOM. What truly makes this great though:

```ts
function Counter(props) {
  if (props.count > 10) {
    return <div>Wow, {props.count}</div>
  }

  return <div>{props.count}</div>
}
```

I can use JavaScript to express the dynamic behaviour of this user interface. But not only that, I get complete TypeScript support out of the box. Not only to infer the types of the props, but type narrowing and any other feature from TypeScript that applies to expressing dynamic user interfaces. This is a really good thing when building large productivity apps.

But this core concept of `(state) => ui` has been faded over time in React. This fundamental concept that makes so much sense first started to diminish with the introduction of hooks:

```ts
function Counter() {
  const [count, setCount] = useState(0)

  return <div onClick={() => setCount(count + 1)>Count: {count}</div>
}
```

Embracing the component as a function makes sense, but the introduction of hooks disrupted React developers intuition on how code is executed in the component. Hooks is based on a concept of [Algebraic Effects](https://overreacted.io/algebraic-effects-for-the-rest-of-us/) which is a way to manage side effects in a functional paradigm. Here is a summary of languages that natively support it and what those languages are typically used for:

- **Eff, Koka**: Research, experimentation with algebraic effects, primarily academic.
- **OCaml**: Systems programming, compilers, financial sector; exploring concurrency with algebraic effects.
- **Haskell**: Academia, finance, data analysis; algebraic effects via libraries.
- **F#**: Enterprise applications, data science, financial modeling on .NET.
- **Scala**: Big data, distributed computing, enterprise backend systems; effect management via libraries.
- **Unison**: Cloud computing, distributed systems, still experimental.

It is safe to state that this is a concept far from what JavaScript UX engineers would imagine having to deal with to build user interfaces.

The disruption goes beyond the mental model though. Hooks can introduce closures in the component scope. Let us inspect the `Counter` again.

```ts
function Counter(props) {
  if (props.count > 10) {
    return <div>Wow, {props.count}</div>
  }

  return <div>{props.count}</div>
}
```

When you read this code your intuition tells you that we are calling a function and there is nothing "stuck" that will affect the next call of the function. It is pure. But with hooks this can happen:

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

If this component reconciles during the timeout, due to `count` being increased, the log will still show `0` from the first reconciliation. Unless you change the `toggled` state again. I know it is a silly example, but the point is that hooks disrupted our intuition on how code executes in a component. It creates a mental overhead to the simplicity of `(state) => ui`.

## Making it faster

React has never been the most performant solution because of the reconciler, but the reconciler is what has given us the ability to use the language to express dynamic user interfaces. To improve the performance of React we have typically leaned on `memo`. This primitive is basically a wrapper around components doing "props checking" to see if React needs to reconcile that component.

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

When the `count` updates in `ParentComponent` it will by default reconcile the `MyComponent` as well, even though it takes no props. Why reconcile `(state) => ui` if there is no `state`? And then there is a question why `memo` is not internally wrapped around all components taking props? There is of course an argument that the comparing of the props is overhead when they often change. The extreme case would just add work as it would compare the props _and_ reconcile every time. But calling a component, evaluate all the hooks and reconcile the returned user interface description... my intuition just tells me that this default comparing of props would end up net positive. But who am I to challenge this. The reason I talk about it though, is what follows.

As React had performance issues it introduced concurrent mode. Concurrent mode allowed React to split up its reconciliation work. Previously the reconciliation was blocking, meaning that there was risk of jank in the user interface when the component trees are big and `memo` is not efficiently used. And with concurrent mode we had to prepare with `StrictMode`. `StrictMode` was thought of as a way to help developers detect side effects in their components due to wrong hooks usage. In development, React will call components, hooks and lifecycle hooks in class components twice to ensure that there are no side effects. This is an important gurantee for concurrent mode. But with this addition the intuition of how a React component works was disrupted again. Previously you could safely:

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

And now we are here with React 19 and its compiler. The compiler optimises your code, adding memoization for you. But there is one thing the compiler will not fix, and it is the most important source of performance issues in my experience; contexts. One of the main reasons for performance issues is sharing state across components. To share state efficiently we use a React context. The consuming components will reconcile when the value from the context changes:

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

So even with the React Compiler we will still be leaning towards global state management solutions to fix the performance issues of React. And this is my biggest friction with React. Why do we need to work with two different sets of state management primitives and runtimes to build applications?

## Rolling back

So let us move back in time. There is no React Compiler, there is no concurrent mode, no strict mode and no hooks... back to `(state) => ui`. If React rather introduced reactive primitives and made components observers, could we have avoided having to deal with the mental overhead of hooks, strict mode, no lifecycle hooks, react compiler and a secondary state management solution?

I am of course in no position to conclude on that, but I am allowed to ask the question... right?

We will never know, but maybe there is a solution out there that did take a different path. A solution that allows us to keep what we fundamentally love about React, but without all this overhead and performance concerns with state management. Let us list what it needs to fulfill:

- JSX support
- Reconciles the user interface, adhearing to `(state) => ui`
- Components should only reconcile by what they observe, meaning they default to not reconciling unless their observed dependencies change
- Reactive primitives defined in a separate scope, but exposed to the component where we reconcile the user interface
- Lifecycle hooks

Even though we are trying to break up with React due to the technical direction, we would also break up with its community. That really sucks, so we also have to consider moving to a community and an ecosystem which can continue to inspire us.

With that in mind our choices are [Vue](https://vuejs.org/), [Svelte](https://svelte.dev/), [Angular](https://angular.dev/) and [Solid JS](https://www.solidjs.com/). We can immediately drop off **Svelte** and **Angular** as templates and limited type checking is not where we want to go. **Solid JS** does get us quite close, but there is no reconciliation in Solid JS, meaning we can not rely on the language for expressing dynamic user interfaces or have native typing support. That leaves us with **Vue**.

We are going to continue now by evaluating Vue. We are going to look at where it fits our mental model and where it falls short.

## Evaluating Vue

All Vue projects uses [Vite](https://vitejs.dev/), also developed by the Vue team. In the default configuration change to `@vitejs/plugin-vue-jsx` and we are ready to observe state to reconcile user interfaces.

```ts
import { defineConfig } from "vite";
// import vue from "@vitejs/plugin-vue";
import vue from "@vitejs/plugin-vue-jsx";

export default defineConfig({
  plugins: [vue()],
});
```

We also add JSX typing to our `tsconfig.json` file:

```json
{
  "compilerOptions": {
    "jsx": "preserve",
    "jsxImportSource": "vue"
  }
}
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

What is amazing about Vue is that when the `App` component reconciles, the `HelloWorld` component will not, cause there is no reason for it. Its dependencies does not change.

We are off to a good start, but with `children` things starts to diverge:

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

Components in Vue does not support the common `children` prop and there is no way to type it for the consumer of the component. **This is the first thing we need to address**.

But let us define some state. React defines its state management in the same function as the reconciling user interface. When our state management is reactive we need to define it in its own function scope.

To manage state Vue exports a `defineComponent` function:

```tsx
import { ref, defineComponent } from "vue";

export default defineComponent(function Counter() {
  const count = ref(0);

  return () => {
    return (
      <div>
        <h4>Count is {count.value}</h4>
        <button onClick={() => count.value++}>Increase count</button>
      </div>
    );
  };
});
```

The `defineComponent` function introduces two function scopes. The passed function is your state management scope, referred to as _setup_, and the returned function is the user interface scope, which will reconcile on observed changes. It litraly is `(state) => ui`, only the state is accessed from its outer scope. This is a simple and powerful signature that allows you to think about your component as "one thing", but separated by a reactive scope of state management and a reconciling scope of the user interface.

As things grow we can easily separate out the state management and also control how the user interface interacts with it:

```tsx
import { ref, defineComponent } from "vue";

function createState() {
  const count = ref(0);

  return {
    get count() {
      return count.value;
    },
    increase() {
      count.value++;
    },
  };
}

export default defineComponent(function Counter() {
  const state = createState();

  return () => {
    return (
      <div>
        <h4>Count is {state.count}</h4>
        <button onClick={state.increase}>Increase count</button>
      </div>
    );
  };
});
```

And if we want to share this state with other nested components we can:

```tsx
import { ref, defineComponent, provide, inject } from "vue";

type State = {
  count: number;
  increase(): void;
};

const counter = Symbol("counter");

export const useCounter = () => inject(counter) as State;

function createState() {
  const count = ref(0);

  return {
    get count() {
      return count.value;
    },
    increase() {
      count.value++;
    },
  };
}

export default defineComponent(function Counter() {
  const state = createState();

  provide(counter, state);

  return () => {
    return (
      <div>
        <h4>Count is {state.count}</h4>
        <button onClick={state.increase}>Increase count</button>
      </div>
    );
  };
});
```

And this is it. This is how you scale up your state management without worrying about any performance issues as Vue will conservatively reconcile your components and depend on its reactive mechanism to keep them up to date.

But we have one more issue to deal with. Let us add an `initialCount` to a stateful component and see what happens:

```tsx
type Props = {
  initialCount: number;
};

export default defineComponent(function Counter(props: Props) {
  const count = ref(props.initialCount);

  return () => {
    return (
      <div>
        <h4>Count is {count.value}</h4>
        <button onClick={() => count.value++}>Increase count</button>
      </div>
    );
  };
});
```

When you run this code the `initialCount` will be undefined. The reason is that unlike functional components, stateful components does not receive props by default. This difference sadly breaks the natural progression of a stateless component to a stateful component.

The reason for this behaviour is a feature in Vue called [Fallthrough Attributes](https://vuejs.org/guide/components/attrs.html#fallthrough-attributes). It is the ability to pass props to a component that is automatically inherited by the root element of the component. By default a function component will only "fall through" `class`, `style` and the `on` event listeners. But a stateful component will "fall through" _any_ attribute and you need to explicitly pick what is considered a prop. **This is the second issue to address**.

## Addressing the issues

So over a week I [streamed my iterations](https://www.youtube.com/playlist?list=PLvEC9UhRenekK0yaw0b2zRceY00rUEwkE) on how to best approach fixing these issues to make Vue adoptable for someone coming from React. I moved between creating my own NPM package abstracting Vue, but ultimately decided to see if I can make the core of Vue more approachable.

[This PR]() was the result of that work and it tries to fix these issues by:

1. **Update the JSX typing**. We add the latest JSX typing for HTML elements, including proper typing of event listeners, fallthrough attributes and things like the `class` (Yeah, class!) with its correct typing
2. **Add children prop**. We add the `children` prop to the JSX typing and allow you to resolve those children to correctly typed slots
3. **Lazy fallthrough attributes**. We add a mechanism to functional and stateful components where accessing props automatically flags them as a prop, preventing the fall through mechanism for the specific props

These suggested changes represents my personal blockers from adopting Vue, and I believe to be the reason why Vue is not seeing more adoption from React developers. It was a fun journey and I hope my next article can be about state management with Vue and how to build productivity types of applications just using Vue primitives.

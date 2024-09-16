# What if React was reactive

> Christian Alfoni

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

It is safe to state that this is a concept far from what JavaScript UX engineers would imagine having to utilise to build user interfaces.

The disruption goes beyond the mental model though. Hooks can introduce closures in the component scope. Let us inspect the `Counter` again.

```ts
function Counter(props) {
  if (props.count > 10) {
    return <div>Wow, {props.count}</div>
  }

  return <div>{props.count}</div>
}
```

When you read this code your intuition tells you that we are calling a function and there is nothing "stuck" that will affect the next call of the function. It is pure, it is `(state) => ui`. But with hooks this can happen:

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

The callback passed to `useEffect` creates a "stuck" function scope for the effect based on `props.toggled` we put in the dependency array. That means some of the code in your component lives longer than the last reconciliation of the user interface. But not only that, different closures are bound to different past reconcilations, past user interfaces:

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

If this component reconciles during the timeout, due to `count` being increased, the log will still show `0` from the first reconciliation. Unless you change the `toggled` state again. I know it is a silly example, but the point is that hooks disrupted our intuition on how code executes in a component. It creates a mental overhead.

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

As React had performance issues it introduced concurrent mode. Concurrent mode allowed React to split up its reconciliation work. Previously the reconciliation was blocking, meaning that there was risk of jank in the user interface when the component trees are big and `memo` is not efficiently used. And with concurrent mode we had to prepare with `StrictMode`. `StrictMode` was intended as a way to help developers detect side effects in their components due to wrong hooks usage. In development, React will call components, hooks and lifecycle hooks in class components twice to ensure that there are no side effects. This is an important gurantee for concurrent mode. But with this addition the intuition of how a React component works was disrupted again. Previously you could safely:

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

And now we are here with React 19 and its compiler, another layer. The compiler optimises your code, adding memoization for you. But there is one thing the compiler will not fix, and it is the most important source of performance issues in my experience; contexts. One of the main reasons for performance issues is sharing state across components. To share state efficiently we use a React context. The consuming components will reconcile when the value from the context changes:

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

Even though that question will never be answered, maybe there is a solution out there that did take a different path. A path that we could take inspiration from and see if we could have a simpler and more performant approach to state management?

It turns out that the only source of inspiration we can use is [Vue](https://vuejs.org/). Even though Vue is known for its single file components, it actually has a reconciler for the user interface and it uses reactive primitives for state management.

## Taking inspiration from Vue

In Vue you have functional components, but they do not have state management. They can only take `props` and return the user interface.

```tsx
function HelloWorld(props: { message: string }) {
  return <h1>Hello World: {props.message}</h1>;
}
```

To manage state you need a new **non** reconciling function scope, but still make the state accessible by the user interface scope that **does** reconcile.

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

And this is it. This is how Vue is able to go from a simple counter and scale up the state management without risking performance issues. But most importantly the state management is not integrated with the reconciler. You can use your existing programming mental model for state management and the mental model for the user interface is `(state) => ui`.

## Making React reactive

Most reactive state management solutions for React are global state management solutions. That means if you want to write your state management outside the reconciler, you have to go global. This tension between using React state management for components and a completely different paradigm globally is in no way ideal. What you ideally want is to use a single state management paradigm that scales from a single component to your whole application. But not only that, you want it to execute outside of the reconciler due to its performance and mental overhead.

And we can do this. We can give components a reactive state management scope in addition to the reconciling user interface, exactly like Vue. But instead of `defineComponent` let us give a nod back to the old `createComponent`.

```tsx
// Stateless Counter
export default function Counter(props) {
  return (
    <div>
      <h1>Count: {props.count}</h1>
      <button onClick={props.increase}>Increase</button>
    </div>
  );
}

// Stateful Counter
export default createComponent(function Counter() {
  const state = reactive({ count });

  function increase() {
    state.count++;
  }

  return () => (
    <div>
      <h1>Count: {state.count}</h1>
      <button onClick={xincrease}>Increase</button>
    </div>
  );
});
```

Just like Vue we are able to

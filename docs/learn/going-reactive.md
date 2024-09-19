# Going Reactive

The two challenges with React we are trying to solve is **performance** and **mental overhead**. Since performance is something we implicitly gain by doing reactive state management, let us rather focus on how we write and think reactive state management.

The simplest example of state management is a counter:

```ts
function Counter() {
  const state = reactive({ count: 0 });

  function increase() {
    state.count++;
  }
}
```

If we where to express this in React, we would:

```tsx
function Counter() {
  const [count, setCount] = useState(0);

  function increase() {
    setCount(count + 1);
  }
}
```

Even though this code **looks the same**, it does not **execute the same**. In React the `Counter` is called every time the component potentially needs to reconcile. In reactive code the `Counter` is only called once, when the component initialises. That means you avoid the overhead of how `useState` and `setCount` behaves in this special runtime of reconciliation.

The complexity increases as you start managing side effects, here showing the reactive code:

```tsx
function Counter() {
  const state = reactive({ count: 0 });
  const interval = setInterval(() => state.count++, 1000);

  cleanup(() => clearInterval(interval));
}
```

And with React:

```tsx
function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(
      () => setCount((current) => current + 1),
      1000,
    );
    return () => {
      clearInterval(interval);
    };
  }, []);
}
```

What we wanted to express is an interval that is created when the component mounts. The interval updates the count every second and is cleared when the component unmounts. With reactive code we can express exactly that, but in React there is no such thing as _initialise_ and _cleanup_, not even _mount_ and _unmount_. The reason is its concurrent rendering. You just have a generic `useEffect` you try to squeeze your mental model into. We also have to consider closures preventing access to the current `count` in this context.

Let us continue by creating an instance of `Something` when the component mounts, and then dispose of it when the component unmounts:

```tsx
function Counter() {
  const something = new Something();

  cleanup(() => something.dispose());
}
```

With React this is the closest we get:

```tsx
function Counter() {
  const [something] = useState(() => new Something());

  useEffect(() => () => something.dispose(), []);
}
```

But this does not actually work in React. The reason is concurrent mode. This component might initialise and be disposed by React without running the effects. Also during `StrictMode` the `useState` is called twice. That means you have a leak. This makes perfect sense to enable concurrent mode for optimising updates to the UI, but it completely melts your brain doing state management.

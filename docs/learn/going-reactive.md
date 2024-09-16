# Going Reactive

When the React context does not work for us we have a tendency to replace it with reactive global state management. Doing so definitely solves friction, but we are only treating the symptoms of a deeper problem. Let us rather move back to the core idea that makes React great. The mental model of `(state) => ui`, user interfaces as a function of state, is why React is so appealing. We use the language to express the dynamic behaviour of our user interfaces with complete TypeScript support out of the box.

```tsx
function Counter(props) {
  return (
    <div>
      <h1>Count: {props.count}</h1>
      <button onClick={props.increase}>Increase</button>
    </div>
  );
}
```

Have you ever reflected on how React could solve state management without hooks? How we could keep this strong mental model of `(state) => ui` and avoid the performance and mental overhead of doing state management in the same reconciling runtime of the user interface? Please read [the following article](../what-if-react-was-reactive.md) which explores the friction of doing state management in React, or please continue if you are just curious where this goes.

**Impact** aims to be a solution where you can treat your function components as stateless components and progressively manage state complexity without performance issues and having to deal with state management in a reconciling execution context.

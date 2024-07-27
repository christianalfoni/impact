---
outline: deep
---

# observe

Components needs to observe any signals that are consumed. They do this with the `observe` function, which is used similar to the `memo` function.

```ts
import { observe, signal } from "impact-react";

function createApp() {
  const count = signal(0);

  return {
    get count() {
      return count();
    },
  };
}

const app = createApp()

const App = observe(() => (
  <h1>Count: {app.count}</h1>
))
```

When using the React Devtools you components will be named `Anonymous` using this pattern. You can use linters to ensure that you give them a display name:

```ts
export const App = observe(() => {});

App.displayName = "App";
```

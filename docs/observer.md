---
outline: deep
---

# observer

Components needs to observe any signals that are consumed. They do this with the `observer` function, which can be used in two different ways:

```tsx
import { observer, signal } from "impact-react";

function createApp() {
  const count = signal(0);

  return {
    get count() {
      return count();
    },
  };
}

const app = createApp();

// This is what you know from other libraries. The drawback of this is that you
// have to define your components as variables and they become anonymously named
// in the React Devtools
const TraditionalUsage = observer(() => <h1>Count: {app.count}</h1>);

// Explicit resource control is a new feature of JavaScript that allows us to
// use the observer inline. The syntax is new and different, but prevents
// forcing you to define your components as variables
function ModernUsage() {
  using _ = observer();

  return <h1>Count: {app.count}</h1>;
}
```

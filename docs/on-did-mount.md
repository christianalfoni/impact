# onDidMount

Is called when the component has mounted.

```tsx
import { createComponent, onDidMount } from "@impact-react/[*]";

export default createComponent(function Counter() {
  onDidMount(() => {
    console.log("I mounted!");
  });

  return () => <div />;
});
```

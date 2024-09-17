# createComponent

Create a reactive component. A reactive component will initialise in the _commit_ phase of React to guarantee being mounted and unmounted. Thing of the component more as a state management component than a UI component, meaning you will use these components more as "controllers" in your application to efficiently share state with its immediate UI and any nested components.

The returned UI is automatically observed.

```tsx
import { createComponent } from "@impact-react/[*]";

export default createComponent(function Counter() {
  // My reactive state management goes here
  return () => <div />;
});
```

::: warning
You can not use hooks in reactive components
:::

# createComponent

Create a reactive component. A reactive component will initialise in the _commit_ phase of React to guarantee being mounted and unmounted. Thing of the component more as a state management component than a UI component, meaning you will use these components more as "controllers" in your application to efficiently share state with its immediate UI and any nested components.

The returned UI is automatically observed.

::: info
If you **server render** reactive components you will need to wrap your app with the exported `SSR` component. The reason for this is that we need the reactive components to render in the _render_ phase instead, which is safe as server rendered components are guaranteed to mount.
:::

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

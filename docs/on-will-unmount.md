# onWillUnmount

Is called when the component will unmount.

```tsx
import { createComponent, onWillUnmount } from "@impact-react/[*]";

export default createComponent(function Counter() {
  onWillUnmount(() => {
    console.log("I will unmount, clean up some stuff!");
  });

  return () => <div />;
});
```

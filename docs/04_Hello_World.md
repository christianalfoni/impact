# Hello World

```ts
import { useSignal, useReactiveHook } from 'impact-app'

/*
  A reactive hook is just a hook that returns something, typically an interface
  to consume and change state. The hook is only run once.
*/
export function HelloWorld() {
  const message = useSignal('Hello World')

  return {
    get message() {
      return message.value
    },
    upperCaseMessage() {
      message.value = message.value.toUpperCase()
    }
  }
}

/*
  Expose it as a plain hook to consume in components
*/
export const useHelloWorld = () => useReactiveHook(HelloWorld)
```

```tsx
import { observe, useReactiveHook } from 'impact-app'
import { useHelloWorld } from 'reactive-hooks/HelloWorld'

function HelloWorld() {
    // Observe any signals consumed
    using _ = observe()
    
    /*
      The reactive hook will be called if it has
      not been called already
    */
    const helloWorld = useHelloWorld()
    
    return <h1 onClick={() => helloWorld.upperCaseMessage()}>{helloWorld.message}</h1>
}
```
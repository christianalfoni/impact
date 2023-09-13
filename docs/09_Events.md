# Events

Signals makes state in hooks observable, but we also need to emit events. **Impact** ships with its own event emitter for good measure;

```ts
import { emitter, createHook } from 'impact-app'

function SomeHook() {
    const helloEmitter = emitter<string>()

    return {
        onHello: helloEmitter.on,
        sayHello() {
            helloEmitter.emit('Hello!')
        }
    }
}

export const useSomeHook = createHook(SomeHook)
```
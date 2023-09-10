# Events

Signals makes state in stores observable, but we also need to emit events. **Impact** ships with its own event emitter for good measure;

```ts
import { emitter, createStore } from 'impact-app'

function SomeStore() {
    const helloEmitter = emitter<string>()

    return {
        onHello: helloEmitter.on,
        sayHello() {
            helloEmitter.emit('Hello!')
        }
    }
}

export const useSomeStore = createStore(SomeStore)
```
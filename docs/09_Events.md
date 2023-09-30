# Events

Signals makes state in stores observable, but we also need to emit events. **Impact** ships with its own event emitter for good measure;

```ts
import { emitter } from 'impact-app'

export function SomeStore() {
    const helloEmitter = emitter<string>()

    return {
        onHello: helloEmitter.on,
        sayHello() {
            helloEmitter.emit('Hello!')
        }
    }
}
```
# Events

Signals makes state in services observable, but we also need to emit events. As events needs proper disposal and also support object oriented patterns like the accessor pattern, **Impact** ships with its own event emitter.

```ts
import { emitter, Service, Disposable } from 'impact-app'

@Service()
export class SomeService extends Disposable {
    #eventEmitter = emitter<string>()
    onEvent = this.#eventEmitter.on
    constructor() {
        this.onDispose(this.#eventEmitter.dispose)
    }
    sayHello() {
        this.#eventEmitter.emit('Hello!')
    }
}
```
# Events

Signals makes state in classes observable, but we also need to emit events. As events needs proper disposal and also support object oriented patterns like the accessor pattern, **Impact** ships with its own event emitter.

```ts
import { emitter, Service, Disposable } from 'impact-app'

@Service()
export class SomeService extends Disposable {
    private onEventEmitter = emitter<string>()
    onEvent = this.onEventEmitter.on

    constructor() {
        this.onDispose(this.onEventEmitter.dispose)
    }
    sayHello() {
        this.onEventEmitter.emit('Hello!')
    }
}
```
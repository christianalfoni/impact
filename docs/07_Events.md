# Events

**SignalIt** makes state in services observable, but we also need to emit events. As events needs proper disposal and also support object oriented patterns like the accessor pattern, **impact** ships with its own event emitter.

```ts
import { emitter, Service } from 'impact-app'

@Service()
export class SomeService {
    private _eventEmitter = emitter<string>()
    onEvent = this._eventEmitter.on
    sayHello() {
        this._eventEmitter.emit('Hello!')
    }
}
```
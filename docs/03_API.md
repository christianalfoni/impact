# API

## Service

The decorator which enables injection of other services and sets the lifecycle of the class to be tied to the ServiceProvider.

```ts
import { Service } from 'impact-app'
import { SomeOtherService } from './SomeOtherService'

@Service()
export class SomeService {
    // Will be resolved when SomeService is resolved
    constructor(someOtherService: SomeOtherService) {}
}
```

## Value

The decorator which enables injection of values from the ServiceProvider where a string has been used as a token.

```ts
import { Service, Value } from 'impact-app'
import { SomeOtherService } from './SomeOtherService'

@Service()
export class SomeService {
    // "KEY" is used to inject a string value in the related ServiceProvider
    constructor(@Value('KEY') key: string) {}
}
```

## Disposable

All services exposed to React has to extend the `Disposable` class. This ensures you are considering what cleanup needs to be done when the component tree unmounts.

```ts
import { Service, Disposable } from 'impact-app'

@Service()
export class SomeService extends Disposable {
    constructor() {
        this.onDispose(() => {
            /*
                I run when the component where this class is registered
                unmounts
            */
        })
    }
}
```

## ServiceProvider

Registers services and values to the lifecycle of the component and exposes them for injection in the component tree.

```tsx
import { ServiceProvider } from 'impact-app'
import { SomeExternalTool } from 'some-cool-tool-package'
import { ServiceA, ServiceB } from './services'

const someExternalTool = new SomeExternalTool()
const config = {}

export const Main = () => {
    return (
        <ServiceProvider
            services={[ServiceA, ServiceB]}
            values={[
                [SomeExternalTool, someExternalTool],
                ['CONFIG', config]
            ]}
        >
            <App />
        </ServiceProvider>
    )
}
```

## useService

Consumes a service in a component. If the service has not been instantiated yet, it will be. If the service has not been registered to a parent ServiceProvider or the service does not extend `Disposable`, it will throw.

```tsx
import { useService } from 'impact-app'
import { SomeService } from '../services/SomeService'

export const SomeComponent = () => {
    const someService = useService(SomeService)
}
```

## signal

Creates a value that can be observed by React and consumed by your services as well.

```ts
import { Service, signal } from 'impact-app'

@Service()
export class SomeService {
    #foo = signal('bar')
    get foo() {
        return this.#foo.value
    }
    changeFoo(newValue: string) {
        this.#foo.value = newValue
    }
}
```

## asyncSignal

Creates a promise that can be observed, supports suspense and be consumed as just a promise from your services.

```ts
import { Service, asyncSignal, AsyncSignal } from 'impact-app'
import { Api } from './Api'

@Service()
export class SomeService {
    #data: AsyncSignal<{}>
    get data() {
        return this.#data.value
    }
    constructor(private _api: Api) {
        this.#data = asyncSignal(_api.getData())
    }
    refetchData() {
        /*
            You can update the value with a new promise. If a component
            is consuming the signal, it will not notified when the new
            promise resolves
        */
        this.#data.value = this._api.getData()
    }
    updateData(newData: {}) {
        /*
            You can update also just change the value, where the signal
            will wrap it in a promise
        */
        this.#data.value = newData
    }
}
```

## observe

Observes changes to signals in components.

```tsx
import { observe, useService } from 'impact-app'
import { SomeService } from '../services/SomeService'

export const SomeComponent = () => {
    using _ = observe()

    const someService = useService(SomeService)

    return (
        <div>{someService.someSignalValue}</div>
    )
}
```

## emitter

A typed event emitter which enables accessor pattern and disposal.

```ts
import { Service, emitter, Disposable } from 'impact-app'

@Service()
export class SomeService extends Disposable {
    #fooEmitter = emitter<string>()
    onFoo = this.#fooEmitter.on
    constructor() {
        this.onDispose(this.#fooEmitter.dispose)
    }
}
```


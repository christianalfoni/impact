# API

- [Service](#service)
- [Signal](#signal)
- [Compute](#compute)
- [Disposable](#disposable)
- [Value](#value)
- [ServiceProvider](#serviceprovider)
- [useService](#useservice)
- [SuspensePromise](#suspensepromise)
- [observe](#observe)
- [emitter](#emitter)

## Service

The decorator which enables injection of other services and sets the lifecycle of the class to be tied to the `ServiceProvider` component.

```ts
import { Service } from 'impact-app'
import { SomeOtherService } from './SomeOtherService'

@Service()
export class SomeService {
    // Will be resolved when SomeService is resolved
    constructor(someOtherService: SomeOtherService) {}
}
```

## Signal

Creates a property that can be observed by React and consumed by your services as well. Signals are expected to be treated as immutable values, meaning you always need to assign a new value.

```ts
import { Service, Signal } from 'impact-app'

@Service()
export class SomeService {
    @Signal()
    private _foo = 'bar'
    get foo() {
        return this._foo
    }
    changeFoo(newValue: string) {
        // Set the new value
        this._foo = newValue
    }
}
```

## Compute

Creates a signal that lazily recomputes whenever any accessed signals within the compute callback changes.

```ts
import { Service, Signal, Compute } from 'impact-app'

@Service()
export class SomeService {
    @Signal()
    private _foo = 'bar'
    @Compute()
    get shoutingFoo() {
        return this._foo + '!!!'
    }
    get foo() {
        return this._foo
    }
    changeFoo(newValue: string) {
        // Set the new value
        this._foo = newValue
    }
}
```

## Disposable

All services exposed to React has to extend the `Disposable` class, or it will throw an error. This ensures you are considering what cleanup needs to be done when the component tree unmounts.

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

## Value

The decorator which enables injection of values from the `ServiceProvider` component where a string has been used as a token.

```ts
import { Service, Value } from 'impact-app'
import { SomeOtherService } from './SomeOtherService'

@Service()
export class SomeService {
    // "KEY" is used to inject a string value in the related ServiceProvider component
    constructor(@Value('KEY') key: string) {}
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
            // Classes with the Service decorator
            services={[ServiceA, ServiceB]}
            // Other values
            values={[
                // Use the class as token to reference the instance
                [SomeExternalTool, someExternalTool],
                // Use a string as token to reference the value
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

## SuspensePromise

An enhanced promise which allows React to consume it directly in components. It is just a normal `Promise` which has some additional properties.

```ts
import { Service, Disposable, SuspensePromise } from 'impact-app'
import { Api, PostDTO } from './Api'

@Service
export class Posts {
  private _posts: Record<string, SuspensePromise<PostDTO>> = {}
  constructor(private api: Api ) {}
  fetchPost(id: string) {
    if (!this._posts[id]) { 
      this._posts[id] = SuspensePromise.from(this.api.fetchPost(id))
    }
    
    return this._posts[id]
  }
}
```

And now in a component you can consume it directly:

```tsx
import { useService } from 'impact-app'
import { Posts } from '../services/Posts'

export const PostComponent = ({ id }: { id: string }) => {
  const posts = useService(Posts)
  // When React gets its own "use" hook, you can use that instead
  const post = posts.fetchPost(id).use()
}
```

This promise throws to the closest Suspense boundary when pending and to the Error boundary when rejected. If the promise is already resolved it will synchronously resolve.

You can also use `SuspensePromise.resolve` to create a resolved SuspensePromise.

## emitter

A typed event emitter which enables accessor pattern and disposal.

```ts
import { Service, emitter, Disposable } from 'impact-app'

@Service()
export class SomeService extends Disposable {
    private _fooEmitter = emitter<string>()
    onFoo = this._fooEmitter.on
    constructor() {
        this.onDispose(this._fooEmitter.dispose)
    }
}
```


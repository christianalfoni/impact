# Services

A service is just a class which is enhanced with the ability to be injected into components and other classes. You never instantiate the class directly, the constructor is only used to inject other classes or values, and run initialization logic.

```ts
import { Service } from 'impact-app'
import { Api } from './Api'

@Service()
class SomeFeature {
    /* 
        Now you can use other services in the
        constructor and they will be injected when
        this class is instantiated by a component
        or an other service
    */
    constructor(private api: Api) {}
}
```

**NOTE!** Make sure you do not `import type` when referencing classes in the constructor.

## ServiceProvider

To be able to inject a service you will need to mount a ServiceProvider in your component tree.

```tsx
import { ServiceProvider, useService } from 'impact-app'

const SomeComponent = () => {
    const someClass = useService(SomeClass)
}

const SomeOtherComponent = () => {
    /* 
      This will get the same instance of the class as
      "SomeComponent" because they use the same ServiceProvider
    */
    const someClass = useService(SomeClass)
}

const App = () => (
    /*
        You always have to explicitly register the class 
        to the provider or it will throw an error when
        consumed
    */
    <ServiceProvider services={[SomeClass]}>
      <SomeComponent />
      <SomeOtherComponent />
    </ServiceProvider>
)
```


## Injecting services into services

To inject a service into a service you use the constructor. Unlike the "useService" hook, the class does not need to be exposed on a ServiceProvider.

```ts
import { Service } from 'impact-app'
import { Api } from './Api'

@Service()
class Posts {
    constructor(private _api: Api) {}
    getPost(id: string) {
        return this._api.fetchPost(id)
    }
}
```

## Disposing services

When a ServiceProvider is unmounted it will be disposed. Any services registered to that ServiceProvider will also be disposed. The `useService` hook will throw if you consume a service without extending `Disposable`

```ts
import { Service, Disposable } from 'impact-app'

@Service()
class SomeSubscriber extends Disposable {
    constructor(private _api: Api) {
        this.onDispose(this._api.subscribeSomething())
    }
}
```

## Injecting values

When adding a `ServiceProvider` component you can preconfigure it with values. This is very useful for instantating external libraries, exposing configuration or provide initial data.

```tsx
import { SomeApi } from 'some-api'
import { ServiceProvider } from 'impact-app'

const api = SomeApi({})

const App = () => {
    return (
        <ServiceProvider services={[SomeFeature]} values={[SomeApi, api]}>
            <Content />
        </ServiceProvider>
    )
}
```

The **values** property is a tuple of the type and the value. Now in any other class injected you can:

```ts
import { SomeApi } from 'some-api'
import { Service } from 'impact-app'

@Service()
class SomeFeature {
    constructor(private _api: SomeApi) {}
}
```

Sometimes you just want to inject some value which is not a class. In that case you can use a string and inject it in a constructor using the `@Value` decorator. 

```tsx
import { ServiceProvider } from 'impact-app'

const CONFIG: Record<string, string> = {}

const App = () => {
    return (
        <ServiceProvider services={[SomeFeature]} values={['CONFIG', CONFIG]}>
            <Content />
        </ServiceProvider>
    )
}
```

```tsx
import { Service, Value } from 'impact-app'

@Service()
class SomeFeature {
    constructor(@Value('CONFIG'): Record<string, string>) {}
}
```

## Nested service providers

The `ServiceProvider` components can be nested and resolving services propagates up the component tree. This is useful when you have services tied to specific feature, but they depend on more globally available services like API, configuration etc.

## Lazy loading services

Since classes are defined and consumed through a ServiceProvider component, you can just lazy load the component which has the ServiceProvider and all related classes will also be lazy loaded.

```tsx
import { lazy } from 'react'
import { ServiceProvider, useService } from 'impact-app'

// ProjectPage has a ServiceProvider for related classes
const ProjectPage = lazy(() => import('./ProjectPage'))

const Layout = () => {
  return (
    <ProjectPage />
  )
}
```
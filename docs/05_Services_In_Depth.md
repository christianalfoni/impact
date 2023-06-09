# Services In Depth

A service is just a class which is enhanced with the ability to be injected by components and other classes. You never instantiate a service directly, the constructor is only used to inject other services or values, and run initialization logic.

```ts
import { service } from 'impact-app'
import { Api } from './Api'

@service()
class SomeFeature {
    constructor(private api: Api) {}
}
```

## ServiceProvider

To be able to inject a service you will need to provide a ServiceProvider to your components.

```tsx
import { ContainerProvider, useService } from 'impact-app'

const SomeComponent = () => {
    /* 
      This will register to the service provider
    */
    const service = useService(SomeService)
}

const SomeOtherComponent = () => {
    /* 
      This will get the same instance of the service as
      "SomeComponent" because they use the same service
      provider
    */
    const service = useService(SomeService)
}

const App = () => (
    <ServiceProvider>
      <SomeComponent />
      <SomeOtherComponent />
    </ServiceProvider>
)
```

## Disposing services

When a service provider is unmounted it will be disposed. Any services registered to that service provider will also be disposed, given they implement the `IDisposable` interface, which is basically just a `dispose` method.

```ts
import { service, IDisposable } from 'impact-app'

@service()
class SomeSubscriber implements IDisposable {
    private disposeSubscription: () => void
    constructor(private api: Api) {
        this.disposeSubscription = this.api.subscribeSomething()
    }
    /*
      This runs when the related service provider unmounts from the React component tree
    */
    dispose() {
        this.disposeSubscription()
    }
}
```

## Injecting other services

To inject a service into a service you use the constructor. Any argument 


## Injecting values

When adding a `ServiceProvider` you can preconfigure it with values. This is very useful for instantating external libraries, exposing configuration or provide initial data.

```tsx
import { SomeApi } from 'some-api'
import { ServiceProvider } from 'impact-app'

const api = SomeApi({})

const App = () => {
    return (
        <ServiceProvider values={[SomeApi, api]}>
            <Content />
        </ServiceProvider>
    )
}
```

The **values** property is a tuple of the type and the value. Now in any other service injected you can:

```ts
import { SomeApi } from 'some-api'
import { service } from 'impact-app'

@service()
class SomeFeature {
    constructor(api: SomeApi) {}
}
```

Sometimes you just want to inject some value which is not a class. In that case you can use a string.

```tsx
import { ServiceProvider } from 'impact-app'

const CONFIG: Record<string, string> = {}

const App = () => {
    return (
        <ServiceProvider values={['CONFIG', CONFIG]}>
            <Content />
        </ServiceProvider>
    )
}
```

```tsx
import { service, inject } from 'impact-app'

@service()
class SomeFeature {
    constructor(@inject('CONFIG'): Record<string, string>) {}
}
```

## Nested service providers

It can be a good idea to use nested service providers. For a typical setup you would high up in your component tree have a service provider which holds all your "global services". These are services used regardless of what url/page you are displaying. Typically APIs, configuration etc.

```tsx
import { ServiceProvider } from 'impact-app'
import { SomeApi } from 'some-api'

const api = new SomeApi({})


const MainComponent = () => {
    return (
        <ServiceProvider values={[[SomeApi, Api]]}>
            <App />
        </ServiceProvider>
    )
}
```

And then as you open a specific url/page you do any asynchronous fetching of initial data required by that specific url/page to display:

```tsx
import { ServiceProvider, usePromise, useService } from 'impact-app'
import { Projects, ProjectDTO } from './services/Projects'

const ProjectPage = ({ id }: { id: string }) => {
    const projects = useService(Projects)
    const projectData = usePromise(projects.fetch(id))
    
    return (
        <ServiceProvider values={[['PROJECT_DATA', projectData]]}>
            <Project />
        </ServiceProvider>
    )
}
```

This `projectData` could now be used with a `Project` service available to any project components.

```ts
import { service, inject, signal } from 'impact-app'
import type { ProjectDTO } from './services/Projects'

@service()
class Project {
    @signal
    data: ProjectDTO
    constructor(@inject('PROJECT_DATA') data: ProjectDTO) {
        this.data = data
    }
}
```

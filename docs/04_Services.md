# Services

A service just a class which is enhanced with the ability to be injected into components and other classes. You never instantiate the class directly, the constructor is only used to inject other classes or values, and run initialization logic.

```ts
import { Service } from 'impact-app'
import { Api } from './Api'

@Service()
class SomeFeature {
    // Now you can use any other service in the
    // constructor and it will be injected as
    // this class is instantiated by a component
    // or some other service
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
    const someClass = useInject(SomeClass)
}

const App = () => (
    // You always have to explicitly register the class to the provider or it will throw an error
    <InjectionProvider classes={[SomeClass]}>
      <SomeComponent />
      <SomeOtherComponent />
    </InjectionProvider>
)
```


## Injecting services into services

To inject a service into a service you use the constructor. Unlike the "useService" hook, the class does not need to be exposed on a ServiceProvider.

```ts
import { Service } from 'impact-app'
import { Api } from './Api'

@Service()
class Posts {
    constructor(private api: Api) {}
    getPost(id: string) {
        return this.api.fetchPost(id)
    }
}
```

## Disposing services

When a ServiceProvider is unmounted it will be disposed. Any services registered to that ServiceProvider will also be disposed. The `useService` hook will throw if you consume a service without extending `Disposable`

```ts
import { Service, Disposable } from 'impact-app'

@Service()
class SomeSubscriber extends Disposable {
    constructor(private api: Api) {
        this.onDispose(this.api.subscribeSomething())
    }
}
```

## Injecting values

When adding a ServiceProvider you can preconfigure it with values. This is very useful for instantating external libraries, exposing configuration or provide initial data.

```tsx
import { SomeApi } from 'some-api'
import { ServiceProvider } from 'impact-app'

const api = SomeApi({})

const App = () => {
    return (
        <ServiceProvider classes={[SomeFeature]} values={[SomeApi, api]}>
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
    constructor(api: SomeApi) {}
}
```

Sometimes you just want to inject some value which is not a class. In that case you can use a string and inject it in a constructor using the `@inject` decorator. 

```tsx
import { ServiceProvider } from 'impact-app'

const CONFIG: Record<string, string> = {}

const App = () => {
    return (
        <ServiceProvider classes={[SomeFeature]} values={['CONFIG', CONFIG]}>
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

It can be a good idea to use nested service providers. For a typical setup you would high up in your component tree have a service provider which holds all your "global classes". These are classes used regardless of what url/page you are displaying. Typically APIs, configuration etc.

```tsx
import { InjectionProvider } from 'impact-app'
import { SomeApi } from 'some-api'

const api = new SomeApi({})

const MainComponent = () => {
    return (
        <InjectionProvider values={[[SomeApi, Api]]}>
            <App />
        </InjectionProvider>
    )
}
```

And then as you open a specific url/page you do any asynchronous fetching of initial data required by that specific url/page to display:

```tsx
import { InjectionProvider, useInject } from 'impact-app'
import { Projects, ProjectDTO } from './services/Projects'

const ProjectPage = ({ id }: { id: string }) => {
    const projects = useInject(Projects)
    const projectData = use(projects.fetch(id))
    
    return (
        <InjectionProvider classes={[Project]} values={[['PROJECT_DATA', projectData]]}>
            <Project />
        </InjectionProvider>
    )
}
```

This `projectData` could now be used with a `Project` class available to any project components.

```ts
import { injectable, inject } from 'impact-app'
import type { ProjectDTO } from './services/Projects'

@injectable()
class Project {
    data: ProjectDTO
    constructor(@inject('PROJECT_DATA') data: ProjectDTO) {
        this.data = data
    }
}
```

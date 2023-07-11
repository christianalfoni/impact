# Injection In Depth

An injectable class is just a class which is enhanced with the ability to be injected by components and other classes. You never instantiate the class directly, the constructor is only used to inject other classes or values, and run initialization logic.

```ts
import { injectable } from 'impact-app'
import { Api } from './Api'

@injectable()
class SomeFeature {
    constructor(private api: Api) {}
}
```

## InjectionProvider

To be able to inject a service you will need to provide an InjectionProvider to your components.

```tsx
import { InjectionProvider, useInject } from 'impact-app'

const SomeComponent = () => {
    /* 
      This will register to the injection provider
    */
    const someClass = useInject(SomeClass)
}

const SomeOtherComponent = () => {
    /* 
      This will get the same instance of the class as
      "SomeComponent" because they use the same injection
      provider
    */
    const someClass = useInject(SomeClass)
}

const App = () => (
    // You always have to explicitly register the class to the provider. 
    <InjectionProvider classes={[SomeClass]}>
      <SomeComponent />
      <SomeOtherComponent />
    </InjectionProvider>
)
```


## Injecting classes into classes

To inject a class into a class you use the constructor. Any argument pointing to a class registered to an injection provider will be available:

```ts
import { injectable } from 'impact-app'
// Make sure you do not use "import type" here
import { Api } from './Api'

@injectable()
class Posts {
    constructor(private api: Api) {}
    getPost(id: string) {
        return this.api.fetchPost(id)
    }
}
```

## Disposing classes

When an injection provider is unmounted it will be disposed. Any classes registered to that injection provider will also be disposed, given they implement the `IDisposable` interface, which is practically just a `dispose` method. You could write this dispose method yourself, but `impact` also allows you to extend a `Disposable` class where you rather use the `constructor` to define what should be disposed.

```ts
import { injectable, Disposable } from 'impact-app'

@injectable()
class SomeSubscriber extends Disposable {
    constructor(private api: Api) {
        this.addDisposable(this.api.subscribeSomething())
    }
}
```

## Injecting values

When adding an `InjectionProvider` you can preconfigure it with values. This is very useful for instantating external libraries, exposing configuration or provide initial data.

```tsx
import { SomeApi } from 'some-api'
import { InjectionProvider } from 'impact-app'

const api = SomeApi({})

const App = () => {
    return (
        <InjectionProvider classes={[SomeFeature]} values={[SomeApi, api]}>
            <Content />
        </InjectionProvider>
    )
}
```

The **values** property is a tuple of the type and the value. Now in any other class injected you can:

```ts
import { SomeApi } from 'some-api'
import { injectable } from 'impact-app'

@injectable()
class SomeFeature {
    constructor(api: SomeApi) {}
}
```

Sometimes you just want to inject some value which is not a class. In that case you can use a string and inject it in a constructor using the `@inject` decorator. 

```tsx
import { InjectionProvider } from 'impact-app'

const CONFIG: Record<string, string> = {}

const App = () => {
    return (
        <InjectionProvider classes={[SomeFeature]} values={['CONFIG', CONFIG]}>
            <Content />
        </InjectionProvider>
    )
}
```

```tsx
import { injectable, inject } from 'impact-app'

@injectable()
class SomeFeature {
    constructor(@inject('CONFIG'): Record<string, string>) {}
}
```

## Nested injection providers

It can be a good idea to use nested injection providers. For a typical setup you would high up in your component tree have an injection provider which holds all your "global classes". These are classes used regardless of what url/page you are displaying. Typically APIs, configuration etc.

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

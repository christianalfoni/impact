# Stores

## Creating a store

A store is just a function that returns state and/or management of that state, just like any other traditional React hook. We call it a store because it runs outside of React and enables reactive behaviour by the usage of reactive state primitives within it, like the signals from **Impact**. That means on its own a store is not reactive, it is a just a container for reactive primitives.

```ts
export function SomeStore() { 
    return {}
}
```

## Providing and consuming stores

By default all stores are global and you can just start consuming them within components and other stores. They will all share a single instance of any store consumed.

```tsx
import { store } from 'impact-app'

function SomeStore() {
    return {}
}

const useSomeStore = () => store(SomeStore)

function SomeComponent() {
    const someStore = useSomeStore()
}

```

The `ScopeProvider` allows you to scope your stores to a component tree. The components in the component tree consuming the stores from a `ScopeProvider` will all consume the same instance of stores. When a store is being resolved in a `ScopeProvider` and can not be found the resolvement will propagate up the component tree, all the way up to the global stores. When a `ScopeProvider` unmounts any `cleanup` callbacks will be called on the resolved stores.

```tsx
import { scope, store, cleanup } from 'impact-app'

function FooStore() {
    cleanup(() => {
        console.log("My scope was unmounted")
    })

    return {}
}

const useFoo = () => store(FooStore)

const SomeScopeProvider = scope({ FooStore })

function SomeComponent() {
    const foo = useFoo()
}

function SomeOtherComponent() {
    /* 
      This will get the same instance of the store as
      "SomeComponent" because they use the same ScopeProvider
    */
    const foo = useFoo()
}

const App = () => (
    /*
        The store is now registered and can be consumed by the component tree. When this
        App component unmounts it will trigger the "cleanup" callback in "FooStore"
    */
    <SomeScopeProvider>
      <SomeComponent />
      <SomeOtherComponent />
    </SomeScopeProvider>
)
```

## Composing stores

The stores can be used by any other store, any traditional React hook or in a component.

```ts
import { useApi } from './stores/ApiStore'

export function SomeStore() {
    const api = useApi()

    return {}
}
```

## Disposing

When a `ScopeProvider` is unmounted it will be disposed. Any resolved stores will also be disposed. The `cleanup` hook registers a callback that will be called when this disposal occurs.

```ts
import { store, cleanup } from 'impact-app'
import { useApi } from '../stores/ApiStore'

export function SomeSubscribingStore() {
    const api = useApi()
    const disposeSubscription = api.subscribeSomething(() => {
        // Update a signal or whatever    
    })

    cleanup(disposeSubscription)

    return {}
}
```

## Passing params to stores

By default your stores are global and not scoped explicitly to a component tree, so there is no way to give them values from "the outside" when they resolve. But with the use of a `ScopeProvider` you will be able to resolve them with initial values coming from React.

```tsx
import { scope } from 'impact-app'

function FooStore(id: string) {
    return {}
}

const SomeScopeProvider = scope({ FooStore })

const App = ({ id }: { id: string }) => {
    return (
        // SomeScopeProvider is now typed to ensure you pass the argument
        <SomeScopeProvider FooStore={id}>
            <Content />
        </SomeScopeProvider>
    )
}
```

## Nested scope providers

The `ScopeProvider` components can be nested and resolving stores propagates up the component tree. This is a useful mechanism as you are likely to have certain stores that are considered global, others per page and maybe some per feature.

## Lazy loading stores

Since stores are defined and consumed through a `ScopeProvider` component, you can just lazy load the component which has the `ScopeProvider` and all related stores will also be lazy loaded, just like traditional hooks.

```tsx
import { lazy } from 'react'

// ProjectPage has a HooksProvider for related hooks
const ProjectPage = lazy(() => import('./ProjectPage'))

const Layout = () => {
  return (
    <ProjectPage />
  )
}
```

## Organising stores

It can be a good idea to structure your application as a set of pages and/or features as that enables more controlled lazy loading. So for example:

```bash
/global-stores
  ApiStore.ts
  VisibilityStore.ts
  TimeStore.ts
  index.ts
/features
  /project
    /stores
        SomethingStore.ts
        SomethingElseStore.ts
        index.tsx
    /components
    index.tsx
```

The `/global-stores` at the root represents stores across the entire project. These stores does not have to be exposed on a `ScopeProvider`. The stores within `/features/project/stores` are stores available to the project feature and any stores, components and hooks within it.

The `features/project/stores/index.ts` could organise the stores like this:

```ts 
import { scope } from 'impact-app'
import { ProjectStore } from './ProjectStore'
import { SomethingElseStore } from './SomethingElseStore'


export const ProjectScopeProvider = scope({
    ProjectStore,
    SomethingElseStore
})
```

The `index.tsx` file would be responsible for exposing the related stores and composing your components.

```tsx
import { use } from 'impact-app'
import { useApi } from '../global-stores/ApiStore'
import { ProjectScopeProvider } from './stores'
import { Layout } from './components/Layout'
import { ProjectOverview } from './components/ProjectOverview'
import { ConfigureProject } from './components/ConfigureProject'

export function Project({ id }: { id: string }) {
    const api = useApi()
    const projectData = use(api.projects.fetch(id))

    return (
        <ProjectScopeProvider key={id} ProjectStore={projectData}>
            <Layout>
                <ProjectOverview />
                <ConfigureProject />
            </Layout>
        </ProjectScopeProvider>
    )
}
```



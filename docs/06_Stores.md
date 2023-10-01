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
import { useStore } from 'impact-app'

function SomeStore() {
    return {}
}

function SomeComponent() {
    const someStore = useStore(SomeStore)
}
```

The `StoresProvider` allows you to scope your stores to a component tree. The components in the component tree consuming the stores from a `StoresProvider` will all consume the same instance of stores. When a store is being resolved in a `StoresProvider` and can not be found the resolvement will propagate up the component tree, all the way up to the global stores. When a `StoresProvider` unmounts any `useCleanup` callbacks will be called on the resolved stores.

```tsx
import { createStoresProvider, useStore, useCleanup } from 'impact-app'

function SomeStore() {
    useCleanup(() => {
        console.log("My StoresProvider was unmounted")
    })

    return {}
}

const StoresProvider = createStoresProvider({ SomeStore })

function SomeComponent() {
    const someStore = useStore(SomeStore)
}

function SomeOtherComponent() {
    /* 
      This will get the same instance of the store as
      "SomeComponent" because they use the same StoresProvider
    */
    const someStore = useStore(SomeStore)
}

const App = () => (
    /*
        The store is now registered and can be consumed by the component tree. When this
        App component unmounts it will trigger the "useCleanup" callback in "SomeStore"
    */
    <StoresProvider>
      <SomeComponent />
      <SomeOtherComponent />
    </StoresProvider>
)
```

## Composing stores

The stores can be used by any other store, any traditional React hook or in a component.

```ts
import { useStore } from 'impact-app'
import { ApiStore } from './stores/ApiStore'

export function SomeStore() {
    const apiStore = useStore(ApiStore)

    return {}
}
```

## Disposing

When a `StoresProvider` is unmounted it will be disposed. Any resolved stores will also be disposed. The `useCleanup` hook registers a callback that will be called when this disposal occurs.

```ts
import { useStore, useCleanup } from 'impact-app'
import { ApiStore } from './useApi'

export function SomeSubscribingStore() {
    const apiStore = useStore(ApiStore)
    const disposeSubscription = apiStore.subscribeSomething(() => {
        // Update a signal or whatever    
    })

    useCleanup(disposeSubscription)

    return {}
}
```

## Passing params to stores

By default your stores are global and not provided explicitly to React so there is no way to give them values from "the outside" when they resolve. But with the use of a `StoresProvider` you will be able to resolve them with initial values coming from React.

```tsx
import { createStoresProvider, createStore } from 'impact-app'

function SomeStore(id: string) {
    return {}
}

const StoresProvider = createStoresProvider({ SomeStore })

const App = ({ id }: { id: string }) => {
    return (
        // StoresProvider is now typed to ensure you pass the argument
        <StoresProvider SomeStore={id}>
            <Content />
        </StoresProvider>
    )
}
```

## Nested store providers

The `StoresProvider` components can be nested and resolving stores propagates up the component tree. This is a useful mechanism as you are likely to have certain stores that are considered global, others per page and maybe some per feature.

## Lazy loading stores

Since stores are defined and consumed through a `StoresProvider` component, you can just lazy load the component which has the `StoresProvider` and all related stores will also be lazy loaded, just like traditional hooks.

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

The `/global-stores` at the root represents stores across the entire project. These stores does not have to be exposed on a `StoresProvider`, but it can be a good idea to expose these on their own `StoresProvider` at the root level of your application. That way if any of the stores needs to initialize with some data, they can using the provider. The stores within `/features/project/stores` are stores available to the project feature and any stores, components and hooks within it.

The `features/project/stores/index.ts` could organise the stores like this:

```ts 
import { createStoresProvider } from 'impact-app'
import { ProjectStore } from './ProjectStore'
import { SomethingElseStore } from './SomethingElseStore'

/*
    It can be a good idea to export the stores so any component can import a single "projectStores". This reduces number of imports
    and makes the stores more discoverable as you can `.` with your intellisense to find all stores for a certain page/feature etc.
*/
export const projectStores = {
    ProjectStore,
    SomethingElseStore
}

export const ProjectStoresProvider = createStoresProvider(projectStores)
```

The `index.tsx` file would be responsible for exposing the related stores and composing your components.

```tsx
import { useStore } from 'impact-app'
import { globalStores } from '../global-stores'
import { ProjectStoresProvider } from './stores'
import { Layout } from './components/Layout'
import { ProjectOverview } from './components/ProjectOverview'
import { ConfigureProject } from './components/ConfigureProject'

export function Project({ id }: { id: string }) {
    const apiStore = useStore(globalStores.ApiStore)
    const projectData = apiStore.projects.suspend(id)

    return (
        <ProjectStoresProvider key={id} ProjectStore={projectData}>
            <Layout>
                <ProjectOverview />
                <ConfigureProject />
            </Layout>
        </ProjectStoresProvider>
    )
}
```



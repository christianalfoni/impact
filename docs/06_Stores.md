# Stores

## Creating a store

A store is just a function that returns state and/or logic, just like any other traditional React hook. We call it a store because it runs outside of React and enables reactive behaviour by the usage of reactive state primitives within it, like the signals from **Impact**. That means on its own a store is not reactive, it is a just a container for reactive primitives.

```ts
import { createStore } from 'impact-app'

export function SomeStore() { 
    return {}
}

export const useSomeStore = createStore(SomeStore)
```

## Providing stores

The `StoresProvider` allows you to scope your stores to a component tree. The components in the component tree consuming the stores from a `StoresProvider` will all consume the same instance of stores. When the `StoresProvider` unmounts any `useCleanup` callbacks will be called on the resolved stores.

```tsx
import { createStoresProvider, createStore, useCleanup } from 'impact-app'

function SomeStore() {
    useCleanup(() => {
        console.log("My StoresProvider was unmounted")
    })

    return {}
}

const useSomeStore = createStore(SomeStore)

const StoresProvider = createStoresProvider({ useSomeStore })

function SomeComponent() {
    /*
        Using "useSomeStore" will throw an error if the store is not provided
        by a "StoresProvider"
    */
    const store = useSomeStore()
}

function SomeOtherComponent() {
    /* 
      This will get the same instance of the store as
      "SomeComponent" because they use the same StoresProvider
    */
    const store = useSomeStore()
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
import { createStore } from 'impact-app'
import { useApi } from './useApi'

export function SomeStore() {
    const api = useApi()

    return {}
}

export const useSomeStore = createStore(SomeStore)
```

## Disposing

When a `StoresProvider` is unmounted it will be disposed. Any resolved stores will also be disposed. The `useCleanup` hook registers a callback that will be called when this disposal occurs.

```ts
import { createStore, useCleanup } from 'impact-app'
import { useApi } from './useApi'

function SomeSubscriber() {
    const api = useApi()
    const disposeSubscription = api.subscribeSomething(() => {
        // Update a signal or whatever    
    })

    useCleanup(disposeSubscription)

    return {}
}

export const useSomeSubscriber = createStore(SomeSubscriber)
```

## Passing params to stores

By default your stores are global and not provided explicitly to React so there is no way to give them values from "the outside" when they resolve. But with the use of a `StoresProvider` you will be able to resolve them with initial values coming from React.

```tsx
import { createStoresProvider, createStore } from 'impact-app'

function SomeStore(id: string) {
    return {}
}

const useSomeStore = createStore(SomeStore)

const StoresProvider = createStoresProvider({ useSomeStore })

const App = ({ id }: { id: string }) => {
    return (
        // HooksProvider is now typed to ensure you pass the argument
        <StoresProvider useSomeStore={id}>
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
  useApi.ts
  useVisibility.ts
  useTime.ts
  index.ts
/features
  /project
    /stores
        useSomething.ts
        useSomethingElse.ts
        index.tsx
    /components
    index.tsx
```

The `/global-stores` at the root represents stores across the entire project, which will be available to any component and other stores. Where `/features/project/stores` are stores available to the project feature and any components and other hooks within it.

The `global-stores/index.tsx` file would be where you define the `StoresProvider`, here showing `features/project/stores/index.ts`

```ts 
import { createStoresProvider } from 'impact-app'
import { useProject } from './useProject'
import { useSomethingElse } from './useSomethingElse'

/*
    It is a good idea to export the stores so any component can import a single "projectStores". This reduces number of imports
    and makes the stores more discoverable as you can `.` with your intellisense to find all stores for a certain page/feature etc.
*/
export const projectStores = {
    useProject,
    useSomethingElse
}

export const ProjectStoresProvider = createStoresProvider(projectStores)
```

The `index.tsx` file would be responsible for exposing the related stores and composing your components.

```tsx
import { globalStores } from '../global-stores'
import { ProjectStoresProvider } from './stores'
import { Layout } from './components/Layout'
import { ProjectOverview } from './components/ProjectOverview'
import { ConfigureProject } from './components/ConfigureProject'

export function Project({ id }: { id: string }) {
    const projects = globalStores.useProjects()
    const projectData = projects.getProject(id).use()

    return (
        <ProjectStoresProvider key={id} useProject={projectData}>
            <Layout>
                <ProjectOverview />
                <ConfigureProject />
            </Layout>
        </ProjectStoresProvider>
    )
}
```



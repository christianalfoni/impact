# Stores

## Creating a store

A store is just a function that returns state and/or logic. A store is not necessarily reactive, its reactive behaviour is determined by the usage of reactive state primitives, like the signals from **Impact**. That means a store can represent any kind of state management, it being reactive or not.

```ts
import { createStore } from 'impact-app'

export function SomeStore() { 
    return {}
}

export const useSomeStore = createStore(SomeStore)
```

## StoresProvider

The `StoresProvider` allows you to scope your stores to a component tree. The components in the component tree consuming the stores from a `StoresProvider` will all consume the same store. When the `StoresProvider` unmounts also the related stores dispose.

```tsx
import { createStoresProvider, createStore } from 'impact-app'

function SomeStore() {
    return {}
}

const useSomeStore = createStore(SomeStore)

const StoresProvider = createStoresProvider({ useSomeStore })

function SomeComponent() {
    /*
        Using "useSomeStore" will throw an error if the store is not provided
        by a "StoresProvider"
    */
    const something = useSomeStore()
}

function SomeOtherComponent() {
    /* 
      This will get the same instance of the store as
      "SomeComponent" because they use the same StoresProvider
    */
    const something = useSomeStore()
}

const App = () => (
    /*
        The store is now registered and can be consumed by the component tree. When this
        App component unmounts it will trigger disposal of the stores resolved
    */
    <StoresProvider>
      <SomeComponent />
      <SomeOtherComponent />
    </StoresProvider>
)
```


## Using stores in stores

To use a store with an other store you can just use it. 

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

When a `StoresProvider` is unmounted it will be disposed. Any stores resolved will also be disposed. The `cleanup` function is used to act on these disposals.

```ts
import { createStore, cleanup } from 'impact-app'
import { useApi } from './useApi'

function SomeSubscriber() {
    const api = useApi()
    const disposeSubscription = api.subscribeSomething(() => {
        // Update a signal or whatever    
    })

    cleanup(disposeSubscription)

    return {}
}

export const useSomeSubscriber = createStore(SomeSubscriber)
```

## Passing initial state to stores

You might want to pass initial state to a store when it instantiates. You use the `StoresProvider` to configure this.

```tsx
import { createStoresProvider, createStore } from 'impact-app'

function SomeStore(number: number) {
    return {}
}

const useSomeStore = createStore(SomeStore)

const StoresProvider = createStoresProvider({ useSomeStore })

const App = ({ id }: { id: string }) => {
    return (
        // StoresProvider is now typed to ensure you pass the argument
        <StoresProvider useSomeStore={100}>
            <Content />
        </StoresProvider>
    )
}
```

## Nested store providers

The `StoresProvider` components can be nested and resolving stores propagates up the component tree. This is a useful mechanism as you are likely to have certain stores that are considered global, others per page and maybe some per feature.

## Lazy loading stores

Since stores are defined and consumed through a `StoresProvider` component, you can just lazy load the component which has the `StoresProvider` and all related stores will also be lazy loaded.

```tsx
import { lazy } from 'react'

// ProjectPage has a StoresProvider for related stores
const ProjectPage = lazy(() => import('./ProjectPage'))

const Layout = () => {
  return (
    <ProjectPage />
  )
}
```

## Organising stores

It can be a good idea to structure your application as a set of features as that enables more controlled lazy loading. So for example:

```bash
/common-stores
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

The `/stores` at the root represents stores across the entire project, which will be available to any component. Where `/features/project/stores` are stores available to the project feature.

The `stores/index.tsx` file would be where you define the `StoresProvider`, here showing `features/project/stores/index.ts`

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

The `index.tsx` file would be responsible for exposing the related  stores and composing your components.

```tsx
import { commonStores } from '../common-stores'
import { ProjectStoresProvider } from './stores'
import { Layout } from './components/Layout'
import { ProjectOverview } from './components/ProjectOverview'
import { ConfigureProject } from './components/ConfigureProject'

export function Project({ id }: { id: string }) {
    const projects = commonStores.useProjects()
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

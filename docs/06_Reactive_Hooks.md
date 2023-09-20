# Reactive Hooks

## Creating a hook

A reactive hook is just a function that returns state and/or logic, just like any other traditional React hook. We call it a reactive hook because it enables reactive behaviour by the usage of reactive state primitives within it, like the signals from **Impact**. That means on its own the hook is not reactive, it is a just a container for reactive primitives.

```ts
import { createHook } from 'impact-app'

export function SomeHook() { 
    return {}
}

export const useSomeHook = createHook(SomeHook)
```

## Providing hooks

The `ReactiveHooksProvider` allows you to scope your hooks to a component tree. The components in the component tree consuming the hooks from a `ReactiveHooksProvider` will all consume the same hooks. When the `ReactiveHooksProvider` unmounts any `useCleanup` hook callbacks will be called on the resolved hooks.

```tsx
import { createHooksProvider, createHook, useCleanup } from 'impact-app'

function SomeHook() {
    useCleanup(() => {
        console.log("My HooksProvider was unmounted")
    })

    return {}
}

const useSomeHook = createHook(SomeHook)

const HooksProvider = createHooksProvider({ useSomeHook })

function SomeComponent() {
    /*
        Using "useSomeHook" will throw an error if the hook is not provided
        by a "ReactiveHooksProvider"
    */
    const something = useSomeHook()
}

function SomeOtherComponent() {
    /* 
      This will get the same instance of the hook as
      "SomeComponent" because they use the same ReactiveHooksProvider
    */
    const something = useSomeHook()
}

const App = () => (
    /*
        The hook is now registered and can be consumed by the component tree. When this
        App component unmounts it will trigger the "useCleanup" hook in "SomeHook"
    */
    <HooksProvider>
      <SomeComponent />
      <SomeOtherComponent />
    </HooksProvider>
)
```


## Composing reactive hooks

The reactive hooks can be used by any other reactive hook, any traditional React hook or in a component.

```ts
import { createHook } from 'impact-app'
import { useApi } from './useApi'

export function SomeHook() {
    const api = useApi()

    return {}
}

export const useSomeHook = createHook(SomeHook)
```

## Disposing

When a `ReactiveHooksProvider` is unmounted it will be disposed. Any hooks resolved will also be disposed. The `useCleanup` hook registers a callback that will be called when this disposal occurs.

```ts
import { createHook, useCleanup } from 'impact-app'
import { useApi } from './useApi'

function SomeSubscriber() {
    const api = useApi()
    const disposeSubscription = api.subscribeSomething(() => {
        // Update a signal or whatever    
    })

    useCleanup(disposeSubscription)

    return {}
}

export const useSomeSubscriber = createHook(SomeSubscriber)
```

## Passing initial state to hooks

By default your reactive hooks are not provided explicitly to React so there is no way to give them values from "the outside" when they resolve. But with the use of a `ReactiveHooksProvider` you will be able to resolve them with initial values coming from React.

```tsx
import { createHooksProvider, createHook } from 'impact-app'

function SomeHook(id: string) {
    return {}
}

const useSomeHook = createHook(SomeHook)

const HooksProvider = createHooksProvider({ useSomeHook })

const App = ({ id }: { id: string }) => {
    return (
        // HooksProvider is now typed to ensure you pass the argument
        <HooksProvider useSomeHook={id}>
            <Content />
        </HooksProvider>
    )
}
```

## Nested hook providers

The `ReactiveHooksProvider` components can be nested and resolving hooks propagates up the component tree. This is a useful mechanism as you are likely to have certain hooks that are considered global, others per page and maybe some per feature.

## Lazy loading hooks

Since reactive hooks are defined and consumed through a `ReactiveHooksProvider` component, you can just lazy load the component which has the `ReactiveHooksProvider` and all related hooks will also be lazy loaded, just like traditional hooks.

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

## Organising reactive hooks

It can be a good idea to structure your application as a set of pages and/or features as that enables more controlled lazy loading. So for example:

```bash
/global-hooks
  useApi.ts
  useVisibility.ts
  useTime.ts
  index.ts
/features
  /project
    /hooks
        useSomething.ts
        useSomethingElse.ts
        index.tsx
    /components
    index.tsx
```

The `/global-hooks` at the root represents reactive hooks across the entire project, which will be available to any component and other hooks. Where `/features/project/hooks` are reactive hooks available to the project feature and any components and other hooks within it.

The `global-hooks/index.tsx` file would be where you define the `ReactiveHooksProvider`, here showing `features/project/hooks/index.ts`

```ts 
import { createHooksProvider } from 'impact-app'
import { useProject } from './useProject'
import { useSomethingElse } from './useSomethingElse'

/*
    It is a good idea to export the hooks so any component can import a single "projectHooks". This reduces number of imports
    and makes the hooks more discoverable as you can `.` with your intellisense to find all hooks for a certain page/feature etc.
*/
export const projectHooks = {
    useProject,
    useSomethingElse
}

export const ProjectHooksProvider = createHooksProvider(projectHooks)
```

The `index.tsx` file would be responsible for exposing the related hooks and composing your components.

```tsx
import { commonHooks } from '../reactive-hooks'
import { ProjectHooksProvider } from './reactive-hooks'
import { Layout } from './components/Layout'
import { ProjectOverview } from './components/ProjectOverview'
import { ConfigureProject } from './components/ConfigureProject'

export function Project({ id }: { id: string }) {
    const projects = commonHooks.useProjects()
    const projectData = projects.getProject(id).use()

    return (
        <ProjectHooksProvider key={id} useProject={projectData}>
            <Layout>
                <ProjectOverview />
                <ConfigureProject />
            </Layout>
        </ProjectHooksProvider>
    )
}
```

**So where do I keep my custom traditional React hooks?** Since Reacts hooks are scoped to components, you would keep those files with the components they operate on.

# Hooks

An **Impact** hook is expressed like any other hook, though they only run once and use reactive mechanisms to notify components when they need to update. This removes the overhead of Reacts reconciliation loop for your state management and related logic.

## Creating a hook

A hook is just a function that returns en object exposing state and behaviour. A hook is not necessarily reactive, its reactive behaviour is determined by the usage of signals. That means a hook can represent any kind of state management, it being reactive or not.

```ts
import { createHook } from 'impact-app'

export function SomeHook() { 
    return {}
}

export const useSomeHook = createHook(SomeHook)
```

## HooksProvider

The `HooksProvider` allows you to scope your hooks to a component tree. That components in the component tree consuming the hook will all consume the same hook. When the `HooksProvider` unmounts also the related hooks dispose.

```tsx
import { createHooksProvider, createHook } from 'impact-app'

function SomeHook() {
    return {}
}

const useSomeHook = createHook(SomeHook)

const HooksProvider = createHooksProvider({ useSomeHook })

function SomeComponent() {
    /*
        Using "useSomeHook" will throw an error if the hook is not provided
        by a "HooksProvider". You use the "using" keyword to consume hooks in components or
        a warning will be shown in development.
    */
    using something = useSomeHook()
}

function SomeOtherComponent() {
    /* 
      This will get the same instance of the hook as
      "SomeComponent" because they use the same HooksProvider
    */
    using something = useSomeHook()
}

const App = () => (
    /*
        The hook is now registered and can be consumed by the component tree. When this
        App component unmounts it will trigger disposal of the hooks resolved
    */
    <HooksProvider>
      <SomeComponent />
      <SomeOtherComponent />
    </HooksProvider>
)
```


## Using hooks in hooks

To use an **Impact** hook with an other **Impact** hook you can just use it. 

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

When a `HooksProvider` is unmounted it will be disposed. Any hooks resolved will also be disposed. The `useDispose` hook is used to act on these disposals.

```ts
import { createHook, useDispose } from 'impact-app'
import { useApi } from './useApi'

function SomeSubscriber() {
    const api = useApi()
    const disposeSubscription = api.subscribeSomething(() => {
        // Update a signal or whatever    
    })

    useDispose(disposeSubscription)

    return {}
}

export const useSomeSubscriber = createHook(SomeSubscriber)
```

## Passing initial state to hooks

You might want to pass initial state to a hook when it instantiates. You use the `HooksProvider` to configure this.

```tsx
import { createHooksProvider, createHook } from 'impact-app'
import { useSomeHook } from './useSomeHook'

function SomeHook(number: number) {
    return {}
}

const useSomeHook = createHook(SomeHook)

const HooksProvider = createHooksProvider({ useSomeHook })

const App = ({ id }: { id: string }) => {
    return (
        <HooksProvider useSomeHook={100}>
            <Content />
        </HooksProvider>
    )
}
```

## Nested hook providers

The `HooksProvider` components can be nested and resolving hooks propagates up the component tree. This is a useful mechanism as you are likely to have certain hooks that are considered global, others per page and some per feature.

## Lazy loading hooks

Since hooks are defined and consumed through a `HooksProvider` component, you can just lazy load the component which has the `HooksProvider` and all related hooks will also be lazy loaded.

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

## Organising hooks

You would organise hooks the same you organise your normal hooks. It can be a good idea to structure your application as a set of features as that enables more controlled lazy loading. So for example:

```bash
/hooks
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

The `/hooks` at the root represents hooks across the entire project, which will be available to any component. Where `/features/project/hooks` are hooks available to the project feature.

The `hooks/index.tsx` file would be where you define the `HooksProvider`, here showing `features/project/hooks/index.ts`

```ts
import { createHooksProvider } from 'impact-app'
import { useSomething } from './useSomething'
import { useSomethingElse } from './useSomethingElse'

/*
    It is a good idea to export the hooks so any component can import a single "projectHooks". This reduces number of imports
    and makes the hooks more discoverable as you can `.` with your intellisense to find all hooks for a certain page/feature etc.
*/
export const projectHooks = {
    useSomething,
    useSomethingElse
}

export const ProjectHooksProvider = createHooksProvider(projectHooks)
```

The `index.tsx` file would be responsible for exposing the related reactive hooks and composing your components.

```tsx
import { commonHooks } from '../common-hooks'
import { ProjectHooksProvider } from './hooks'
import { ProjectConfiguration } from './reactive-hooks/useProjectConfiguration'
import { Layout } from './components/Layout'
import { ProjectOverview } from './components/ProjectOverview'
import { ConfigureProject } from './components/ConfigureProject'

export function ProjectFeature({ id }: { id: string }) {
    using projects = commonHooks.useProjects()

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

# Contexts

## Creating a context

A context is just a function that returns state and/or management of state, just like any other traditional React context. We call it a context for familiarity, but you will learn that Impact contexts has benefits over traditional React contexts.

```ts
import { context } from 'impact-app'

const useSomeContext = context(() => { 
    return {}
})
```

## Providing and consuming contexts

The `context` function returns a hook that can be used in components and other Impact contexts. The hook has a property called `Provider` which you use to expose the context to React. 

```tsx
import { context } from 'impact-app'

const useSomeContext = context(() => { 
    return {}
})

function SomeComponent() {
    const someContext = useSomeContext()
}

function App() {
    return (
        <useSomeContext.Provider>
            <SomeComponent />
        </useSomeContext.Provider>
    )
}
```

## Consuming contexts in other contexts

A great thing about React contexts is that you can consume other contexts higher up in the component tree. Impact contexts allows the same. The hook returned from a context can be used in both components and other Impact contexts.

```ts
import { context } from 'impact-app'
import { useGlobalContext } from './useGlobalContext'

const useSomePageContext = context(() => {
    const { api } = useGlobalContext()

    return {}
})
```

## Disposing

When a context provider is unmounted it will be disposed. The `cleanup` function registers a callback that will be called when this disposal occurs. Since Impact contexts runs outside the reconciliation loop this function is guaranteed to run only when the provider is unmounted.

```ts
import { context, cleanup } from 'impact-app'
import { useApi } from '../stores/ApiStore'

const useSomePageContext = context(() => {
    const api = useApi()
    const disposeSubscription = api.subscribeSomething(() => {
        // Update a signal or whatever    
    })

    cleanup(disposeSubscription)

    return {}
})
```

## Passing props to contexts

When your context is provided to a React component tree, just like normal contexts you can give them props.

```tsx
import { context } from 'impact-app'

const useSomePageContext = context(({ id }: { id: string }) => {
    return {}
})

const App = ({ id }: { id: string }) => {
    return (
        <useSomePageContext.Provider id={id}>
            <Content />
        </useSomePageContext.Provider>
    )
}
```

## Lazy loading contexts

Just like traditional context providers you simply lazy load the component that has the provider of the context.

```tsx
import { lazy } from 'react'

// ProjectPage is providing a context
const ProjectPage = lazy(() => import('./ProjectPage'))

const Layout = () => {
  return (
    <ProjectPage />
  )
}
```

## Organising contexts

It can be a good idea to structure your application as a set of pages and/or features as that enables more controlled lazy loading. So for example:

```bash
/features
  /project
    /components
    useProjectContext.ts
    index.tsx
useGlobalContext.ts
```

The `useGlobalContext` at the root represents the context across the entire application. The context within `/features/project` is a context initialized to be available to the project feature and the components and hooks within it.

The `index.tsx` file would be responsible for exposing the related context and composing your components.

```tsx
import { use } from 'impact-app'
import { useGlobalContext } from '../useGlobalContext'
import { useProjectContext } from './useProjectContext'
import { Layout } from './components/Layout'
import { ProjectOverview } from './components/ProjectOverview'
import { ConfigureProject } from './components/ConfigureProject'

export function Project({ id }: { id: string }) {
    const { api } = useGlobalContext()
    const projectData = use(api.projects.fetch(id))

    return (
        <useProjectContext.Provider key={id} data={projectData}>
            <Layout>
                <ProjectOverview />
                <ConfigureProject />
            </Layout>
        </useProjectContext.Provider>
    )
}
```



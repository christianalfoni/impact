# Contexts

## Creating a context

A context is just a function that returns state and/or management of state, just like any other traditional React context. We call it a context for familiarity, but you will learn that Impact contexts has benefits over traditional React contexts.

```ts
import { context } from 'impact-app'

function SomeContext() {
    return {}
}

const useSomeContext = context(SomeContext)
```

## Providing and consuming contexts

The `context` function returns a hook that can be used in components and other Impact contexts. The hook has a property called `Provider` which you use to expose the context to React. 

```tsx
import { context } from 'impact-app'

function SomeContext() {
    return {}
}

const useSomeContext = context(SomeContext)

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
import { useGlobalContext } from '../useGlobalContext'

function SomePageContext() {
    const { api } = useGlobalContext()

    return {}
}

return useSomePageContext = context(SomePageContext)
```

## Disposing

When a context provider is unmounted it will be disposed. The `cleanup` function registers a callback that will be called when this disposal occurs. Since Impact contexts runs outside the reconciliation loop this function is guaranteed to run only when the provider is unmounted.

```ts
import { context, cleanup } from 'impact-app'
import { useGlobalContext } from '../useGlobalContext'

function SomePageContext() {
    const { api } = useGlobalContext()
    const disposeSubscription = api.subscribeSomething(() => {
        // Update a signal or whatever    
    })

    cleanup(disposeSubscription)

    return {}
}

export const useSomePageContext = context(SomePageContext)
```

## Passing props to contexts

When your context is provided to a React component tree you can provide its the props of the Provider.

```tsx
import { context } from 'impact-app'

function SomePageContext({ id }: { id: string }) {
  return {}
}

const useSomePageContext = context(SomePageContext)

const App = ({ id }: { id: string }) => {
    return (
        <useSomePageContext.Provider key={id} id={id}>
            <SomePage />
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

It can be a good idea to structure your application the way your components are nested. Instead of of creating directories of flat components, hooks etc. you rather start with the root component and create a nested structure. Now your file structure reflects you UI composition, but also your contexts shows in the file tree what components can consume them.

```bash
/pages
  /PageA
    index.tsx
    usePageAContext.ts
  /PageB
    /Sidebar
        index.tsx
        useSidebarContext.ts
    index.tsx
    usePageBContext.ts
index.tsx
useGlobalContext.ts
```

The `index.tsx` entry points is responsible for providing the related context to the component tree. What is great about this is that your pages/features does not only get a context, but you can use the same entry to provide any initial data for the context, suspense and an error boundary to handle errors within that page/feature.

```tsx
import { Suspense } from 'react'
import { use } from 'impact-app'
import { Errorboundary } from 'react-error-boundary'
import { useGlobalContext } from '../useGlobalContext'
import { useProjectContext } from './useProjectContext'
import { Layout } from './components/Layout'
import { ProjectOverview } from './components/ProjectOverview'
import { ConfigureProject } from './components/ConfigureProject'

export function Project({ id }: { id: string }) {
    const { api } = useGlobalContext()
    const projectData = use(api.projects.fetch(id))

    return (
        <ErrorBoundary>
            <Suspense>
                <useProjectContext.Provider key={id} data={projectData}>
                    <Layout>
                        <ProjectOverview />
                        <ConfigureProject />
                    </Layout>
                </useProjectContext.Provider>
            </Suspense>
        </ErrorBoundary>
    )
}
```
This pattern gives you a lot of insight about the application just looking at the files and folders in your project:

- It tells you how your components are composed
- It tells you what contexts are available to what component trees
- It tells your where data fetching boundaries are
- It tells you where your error boundaries are
- It tells you where your suspense boundaries are

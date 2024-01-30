# Context

## Description

You probably already know contexts from React. Contexts is the primitive you use to share and manage state scoped to a component tree. Impact contexts are also just React contexts, but they have a reactive implementation. That means you use reactive state primitives instead of the state primitives tied to the reconciliation loop of React. You are freed from the performance challenges and the mental overhead of sharing state and management of state through React contexts.

## Learn

### Creating a global context

If you only need to compose your state management into a single context, you can use the `globalContext`. This context does not need to be provided to your component tree. 

```ts
import { globalContext } from 'impact-app'

function SomeGlobalContext() {
    return {}
}

const useSomeGlobalContext = globalContext(SomeGlobalContext)
```

### Creating a context

A context is just a function that returns state and/or management of state, just like any other traditional React context. We call it a context for familiarity, but you can think about this function as a constructor. It will be called once, when the context is mounted, and not be called again during its lifetime.

```ts
import { context } from 'impact-app'

function SomeContext() {
    return {}
}

const useSomeContext = context(SomeContext)
```

#### Providing and consuming contexts

The `context` function returns a hook that can be used in components and other Impact contexts. The hook has a property called `Provider` which is a context provider component that exposes the context to React. 

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

#### Consuming contexts in other contexts

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

#### Disposing

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

#### Passing props to contexts

When your context is exposed through its `Provider` any props are passed to the context.

```tsx
import { context } from 'impact-app'

function SomePageContext({ id }: { id: string }) {
  return {}
}

const useSomePageContext = context(SomePageContext)

const App = ({ id }: { id: string }) => {
    return (
        <useSomePageContext.Provider id={id}>
            <SomePage />
        </useSomePageContext.Provider>
    )
}
```

#### Lazy loading contexts

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

#### Organising contexts

It can be a good idea to structure your application the way your components are nested. Instead of of creating directories of flat components, hooks etc. you rather start with the root component and create a nested structure. Now your file structure reflects you UI composition, but also your file tree also shows what components can consume what contexts.

```bash
/pages
  /PageAContext
    index.tsx
    PageA.tsx
    usePageAContext.ts
  /PageBContext
    /SidebarContext
        index.tsx
        Sidebar.tsx
        useSidebarContext.ts
    index.tsx
    PageB.tsx
    usePageBContext.ts
index.tsx
useGlobalContext.ts
```

The `index.tsx` entry points is responsible for providing the related context to the component tree. What is great about this is that your pages/features does not only get a context, but you can use the same entry to provide any initial data for the context, suspense and an error boundary to handle errors within that page/feature.

```tsx
import { Suspense, use } from 'react'
import { Errorboundary } from 'react-error-boundary'
import { useGlobalContext } from '../useGlobalContext'
import { useProjectContext } from './useProjectContext'
import { Project } from './Project'

export function ProjectContext({ id }: { id: string }) {
    const { api } = useGlobalContext()
    const projectData = use(api.projects.fetch(id))

    return (
        <ErrorBoundary>
            <Suspense fallback={<h4>Loading...</h4>}>
                <useProjectContext.Provider key={id} data={projectData}>
                    <Project />
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

## Concurrent mode

With concurrent mode React fully embraces the fact that components needs to be pure. That means you can not use `useRef` or `useState` to instantiate something with side effects, as you can not reliably dispose of them. The reason is that the concurrent mode could run the component body several times without running `useEffect` to clean things up.

For **Impact** to work the `ReactiveContextProvider` creates a `ContextContainer` which needs to be disposed on unmount. This is exactly what is not possible to achieve with concurrent mode. The great thing though is that a `ContextContainer` by itself is not a side effect, there is nothing in there, just references to what "can be there". It is only when the provider is mounted and children components starts consuming the context that it is "instantiated".

That does not solve disposal completely though, cause a `useEffect` might also run multiple times. That is why the `ReactiveContextProvider` uses a component class with `componentDidUmount` to trigger disposal. This lifecycle method only runs when the component actually unmounts.

But that actually does not completely solve the challenge. React might call `componentDidUnmount`, but still keep reference to the component and mount it again. This happens for example during suspense. Impact solves this by making the `ReactiveContextProvider` and create the `ContextContainer` during its render. If there is no existing `ContextContainer`, or it has been disposed, it will create a new one. This changes the context value and guarantees consuming components will resolve it again. The final event on this component is a `componentDidUnmount` which will guarantee disposing of the context.


# impact-app

```bash
yarn add impact-app
```

## Description

Combines `impact-app` and `impact-signal` and enhances the developer experience with:

- Components consuming a context automatically observes any signals accessed. There is no need to control any observability in components
- Using the `effect` will automatically clean it up when the context unmounts

## Example application

**FamilyScrum** is an open source application following the patterns and guidelines described here. It gives you insight into how an application can take advantage of contexts, how to solve async data resolvement, suspense, derived async state, optimistic updates etc.

[Open on CodeSandbox](https://codesandbox.io/p/devbox/github/christianalfoni/family-scrum-v2?file=%2FREADME.md%3A1%2C1)

**Note!** You can not currently sign in to the app without a registered family.

## Learn

### Files and folders

The file and folder structure of an Impact app follows the contexts you create for your application. That means by just looking at the files and folders you can infer a lot of information about the application:

- Where state management is initialized, exposed and what components can access it
- Data fetching boundaries
- Suspense boundaries
- Error boundaries

An example of such a structure would be:

```shell
/ProjectContext
  Project.tsx
  ProjectError.tsx
  ProjectLoader.tsx
  useProjectContext.ts
  index.tsx
useGlobalContext.ts
index.tsx
```

Whenever you intend to initialize and mount a new context you create a folder. The folder should explicitly be named what the context provides. In this example `ProjectContext`.

The `index.tsx` of that folder would do any necessary data fetching and mount the context provider with the top level UI component. The component can also include an error boundary, named `ProjectError.tx`, and suspense boundary, named `ProjectLoader.tsx`. This would catch any errors within the context provided and handle any use of suspense within the context provided.

```tsx
export function ProjectContext({ id }: { id: string }) {
    const { api } = useGlobalContext()

    const projectData = use(api.fetchProject(id))

    return (
        <ErrorBoundary>
            <Suspense fallback={<Loader />}>
                <useProjectContext data={projectData}>
                    <Project />
                </useProjectContext>
            <Suspense>
        <ErrorBoundary>
    )
}
```

The related context implementation should be a file or folder named `useProjectContext.ts` in this example. Choosing a folder relates to the size of the context.

### Creating a context

The name of the context file should be for example `useProjectContext.ts` or you could use a folder with an `index.ts` file to compose it together with multiple files. 

```ts
import { context, signal, cleanup, effect } from 'impact-app'
import { produce } from 'immer'

// Define the export at the top
export const useProjectContext = context(ProjectContext)

// Export any props it uses
export type Props = {
    data: ProjectDTO
}

function ProjectContext(props: Props) {
    // Do not destructure the props, rather do it on next line. This prevents the destructuring to break the function
    // definition into multiple lines
    const { data } = props

    // Define any usage of other contexts, in nested order
    const { api } = useGlobalContext()

    // Define any signals
    const project = signal(props.data)

    // Define any effects
    effect(() => console.log(project.title))

    // Define any variables, subscriptions and cleanup
    let interval = setInterval(() => {}, 1000)

    cleanup(() => clearInterval(interval))

    // Return the API of the context
    return {
        // Return any signal access as a getter
        get title() {
            return project.value.title
        }
    }
}
```

### Data fetching

With signals data fetching is just a promise you put into a signal. This makes the promise observable, meaning you can suspend it or access its `status` to evaluate its state. That promise can come from a GQL query, a REST request or any other promise producing source.

An important aspect of data fetching in React is caching. We need to "hold on" to the promise representing the fetching of the data as React will "query it" multiple times during its reconciliation. In the example below we see how `fetchProject` could be called multiple times, though it should represent a single promise.

```tsx
import { Project } from './Project'
import { useProjectsContext } from '../useProjectsContext'
import { useProjectContext } from '../useProjectContext'

function ProjectContext({ id }: { id: string }) {
    const { fetchProject } = useProjectsContext()

    const project = fetchProject(id)

    if (project.status === 'rejected') {
        throw project.reason
    }

    if (project.status === 'pending') {
        return <h1>Loading project...</h1>
    }

    return (
        <useProjectContext.Provider data={project.value}>
            <Project />
        </useProjectContext.Provider>
    )
}
```

Or with suspense:

```tsx
import { Project } from './Project'
import { useProjectsContext } from '../useProjectsContext'
import { useProjectContext } from '../useProjectContext'

function ProjectContext({ id }: { id: string }) {
    const { fetchProject } = useProjectsContext()

    const project = use(fetchProject(id))

    return (
        <useProjectContext.Provider data={project}>
            <Project />
        </useProjectContext.Provider>
    )
}
```

In Impact data fetching is just a signal with a promise in it, so it is up to you how to keep that signal around. For example the `ProjectsContext` above could:

```ts
import { context } from 'impact-app'

export const useProjectsContext = context(ProjectsContext)

function ProjectsContext() {
    const projects: Record<string, Signal<Promise<Project>>> = {}

    return {
        fetchProject(id: string) {
            let project = projects[id]

            if (!project) {
                project = projects[id] = signal(fetch('/projects/' + id))
            }

            return project.value
        }
    }
}
```

We will keep the fetched project in a record, which would also keep the project cached when navigating to a different one. In other scenarios the data fetching might happen when the context initialises and the components will consume the observable promise. 

### Mutations

Mutations are no different than fetching data. It is just a signal with a promise, though the signal starts out undefined.

```ts
import { context, signal } from 'impact-app'

export const useProjectContext = context(ProjectContext)

export type Props = {
    data: ProjectDTO
}

function ProjectContext(props: Props) {
    const { data } = props

    const project = signal(data)
    // Always name mutations as "What it does", set the response type
    // and initialize without a value
    const changingTitle = signal<Promise<void>>()

    return {
        get title() {
            return project.value.title
        },
        changeTitle(newTitle: string) {
            // Reference the previous value to revert
            const currentTitle = project.value.title
            
            // Optimistically update the project
            project.value = {
                ...project.value,
                title: newTitle
            }
            
            // Run the mutation
            changingTitle.value = changeTitleMutation(data.id, newTitle)
                .catch((error) => {
                    // If an error, revert the value
                    project.value = {
                        ...project.value,
                        title: currentTitle
                    }

                    // Throw the error to put the promise in a rejected state
                    throw error
                })

            // Optionally return the promise 
            return changingTitle.value
        }
    }
}
```

### Composing contexts

### Naming context properties

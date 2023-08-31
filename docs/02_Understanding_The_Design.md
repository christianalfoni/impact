# Understanding The Design

Reacts responsibility is to compose dynamic user interfaces and doing so across the client and server boundary. The primitives of React for state are scoped to individual components and you rely on mechanisms like props passing and context providers to share that state. A common misconception about React is that their primitives can be used to manage state and related logic, but they are really more to synchronise state. It quite quickly becomes cumbersome to use Reacts primitives to manage and share state and logic across components in a performant way. Also expressing logic with the mental overhead of the reconciliation loop creates friction.

**The first principle** of **Impact** is to scope state and logic to component trees, as opposed to local component scope or a global scope.

**The second principle** of **Impact** is to allow developers to write state and logic without the mental and performance overhead of reconcilication, but still tie it to the lifecycle of component trees.

**The third principle** of **Impact** is to minimze indirection when navigating and debugging code. In other words you should ideally always be a single intellisense click away from finding the origin of state and logic.

## The fundamental building block

When moving away from the local component scope to manage state there are different types of implementations. Some implementations gives you a reactive primitive:

```ts
const myReactiveValue = reactive(0)
```

There is really no structure around the primitives, it is up to you to find ways to structure it. To consume the reactive value you would typically use a hook:

```ts
function MyComponent() {
    const value = useReactiveValue(myReactiveValue)
}
```

This hook would extract the current value and subscribe to any updates.

A different way to think about this is a global state tree. The state tree can be explicitly defined or composed together by for example reducers. The point is that your application state can be represented as one big object.

```ts
const state = createStateTree({
  value: 0
})
```

How the state in this tree changes differs from implementation to implementation. It could be a general dispatcher where you send actions or a common pattern is to introduce methods with access to the state:

```ts
const store = createStore({
    value: 0
}, (state) => ({
    increaseValue(state) {
        state.value++
    }
}))
```

Some trees uses proxies to wrap the native mutation API of JavaScript, some use dispatching and others has their own setter methods.

At this point we have really reached the scope of what most state management libraries offer. This is a lot of value, but there are some challenges with state represented in a global scope.

If we go back to our single state tree you will define the initial state of your whole application. That means if that application can for example show a `project`, you would initialise with an empty project and type it as such:

```ts
type state = {
    project: Project | null
}
```

But now you explicitly have to check if the project is there, even in a component context where you as a developer know the project has been loaded:

```ts
function ProjectComponent() {
    const globalState = useGlobalState()

    globalState.project?. // Maybe not there
}
```

To scope the context of your state you can use unions. For example state is represented by pages:

```ts
type state = {
    someGlobalState: boolean
    page: {
        name: 'project',
        project: Project
    } | {
        name: 'dashboard'
    }
}
```

Now you have gobal state, but also scoped to specific page state. To consume a specific page state you would create a hook like this:

```ts
function useProjectState() {
    const globalState = useGlobalState()

    if (globalState.page.name === 'project') {
        return globalState.page
    }

    throw new Error("You can not use project state when not on a project page")
}

function SomeComponent() {
    const projectState = useProjectState()

    useProjectState.project // Yeah
}
```

This definitely helps, but the question now becomes. How do we scope logic to the state it interacts with? We want to avoid doing:

```ts
const store = createStore({
    globalValue: 0,
    page: { name: 'home' }
}, (state) => ({
    updateProjectTitle(newTitle) {
        // Now our state is scoped, but logic is global, we need to check :(
        if (state.page.name === 'project') {
            state.page.project.title = newTitle
        }
    }
}))
```

To solve this we could try just splitting up the store:

```ts
const globalStore = createStore({ foo: 'bar' })
const projectStore = createStore({ data: null }, { updateTitle() {} })
```

But this will not work as there are certain parts of our state and logic we want to instantiate only when it becomes valid. In our case we want to instantiate a slice of state and related logic when the `project` page opens.

We could approach that doing something like:

```ts
type Project = { title: string }

type HomeSlice = {
    name: 'home'
}

type ProjectSlice = {
    name: 'project'
    project: Project
    updateTitle(newTitle: string): void
}

type Store = {
    foo: string
    page: HomeSlice | ProjectSlice
    openHome(): void
    openProject(project: Project): void
}

const createHomeSlice = () => createSlice({
    name: 'home'
})

const createProjectSlice = (project: Project) => createSlice({
  name: 'project',
  project
}, (state) => ({
    updateTitle(newTitle) {
        state.project.title = newTitle
    }
}))

const gobalStore = createStore<Store>({
    foo: 'bar',
    page: createHomeSlice()
}, (state) => ({
    openHome() {
        state.page = createHomeSlice()
    }
    openProject(project) {
        state.page = createProjectSlice(project)
    }
}))
```

Now we have been able to scope state and logic together without causing issues with typing. It might look appealing, but with this kind of concept we are missing some important features of managing state:

- How would you use your root global state inside the nested slice without having to do a lot of writing?
- What about state that is not part of the tree, but is considered "private state"?
- What if opening the project page triggers a side effect, like a subscription, you need to dispose of when moving away from that page?
- What if we want to lazy load a slice?

So a `createStore`, with its state definition and related methods is not the construct we are looking for. We need a primitive that can deal with the missing parts. Maybe a class primitive could help us?

```ts
class Store {
    private somePrivateState = 'mip'
    private _page = page = new HomeSlice()
    get page() {
        return this._page
    }
    set page(pageSlice) {
        this._page.dispose()
        this._page = pageSlice
    }
    foo = 'bar'
    openHome() {
        this.page = new HomeSlice(this)
    }
    openProject() {
        this.page = new ProjectSlice(this)
    }
}
```

In this concept we are indeed able to deal with both private related state and disposal, but how to do lazy loading is not apparent. No matter, classes are quite verbose and is a completely different paradigm than Reacts functional nature.

On that note, what if we could just use functions? That is certainly closer to the paradigm of React. We could express the same state and related logic with:

```ts
function homeSlice() {
    return {
        dispose() {}
    }
}

function projectSlice(project) {
    return {
        get project() {
            return project
        },
        updateTitle(newTitle) {
            project.title = newTitle
        },
        dispose() {}
    }
}

function globalStore() {
    const somePrivateState = 'foo'
    let page = homeSlice()

    function setPage(newPage) {
        page.dispose()
        page = newPage
    }

    return {
        get page() {
            return page
        },
        openHome() {
            page = homeSlice()
        },
        openProject(project) {
            page = projectSlice()
        }
    }
}
```

Now, this certainly feels closer to React and we have solved the issue of privacy. But there are still issues to solve here:

- The slices can not access the parent store/slices without a lot of wiring
- We can not lazy load the slices without a lot of wiring and managing the state of the promise
- We are manually disposing

To solve these things we could look even closer at React and take advantage of very well known concept... **hooks**:

```ts
function useHome() {
    const pages = usePages()

    return {}
}

function useProject(projectData) {
    const project = signal(projectData)
    const pages = usePages()

    cleanup(() => {})

    return {
        get project() {
            return project
        },
        updateTitle(newTitle) {
            project.value = { title: newTitle }
        }
    }
}

function usePages() {
    const somePrivateState = 'foo'
    let page = signal({ name: 'home' })

    return {
        get page() {
            return page.value
        },
        openHome() {
            page.value = { name: 'home' }
        },
        openProject(id) {
            page.value = { name: 'project', id }
        }
    }
}
```

The hooks pattern is a really great pattern to solve every single thing we want. The only problem with Reacts hooks is that they are bound to the reconciliation loop and requires Reacts primitives. Those work great for local component state, but not for complex state management across components.

What **Impact** does is take this fundamental building block of a composable hook, enables reactivity and binds it to the lifecycle of a component tree. It is difficult to infer how this low level concept solves all the issues adressed above, but as you explore this concept it hopefully becomes more obvious.

## Reactive primitives

**Impact** implements a reactive primitive called signals. This is a very simple reactive primitive which does targeted reconciliation of components. With its use of the new `using` keyword in JavaScript there is no overhead added to the React runtime.

"Change" is where things go wrong in your application. A user interacts with the application and you have unexpected state changes. The signal debugger gives you exact information about where a state change occurs in your code and also where state changes are being observed in your code. With VSCode you will be able to click debugging information in the browser and go straight to the code location inside VSCode. 

**Impact** also enables promises to be consumed "the React way". That means promises created in reactive hooks can be enhanced to be a `SuspensePromise`. This is just a normal promise, but React can now evaluate the state of the promise to use it with suspense.



## Concurrent mode

With React 18 and concurrent mode React fully embraces the fact that components needs to be pure. That means you can not use `useRef` or `useState` to instantiate something with side effects, as you can not reliably dispose of them. The reason is that the concurrent mode could run the component body several times without running `useEffect` to clean things up.

For **Impact** to work the `HooksProvider` creates a `HooksContainer` which needs to be disposed on unmount. This is exactly what is not possible to achieve with React 18. The great thing though is that a `HooksContainer` by itself is not a side effect, there is nothing in there, just references to what "can be there". It is only when the provider is mounted and children components starts consuming hooks that the hooks are actually resolved and "instantiated".

That does not solve disposal completely though, cause a `useEffect` might also run multiple times. That is why the `HooksProvider` uses a component class with `componentDidUmount` to trigger disposal. This lifecycle hook only runs when the component actually unmounts.


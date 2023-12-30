# Tutorial

This tutorial is divided into three levels of state management complexity. How exactly to determine "state complexity" of an application is difficult, especially before hand. You want to get started quickly and efficiently, but as your application grows and you learn more about its nature, you want a tool that is prepared to deal with any state complexity.

We think a good way to look at **state complexity** is to evaluate the component tree size and depth in relation to consumption of shared state across these component trees. In other words, the more complex UI and the more state shared across that complex UI, the more **state complexity** you have.

## Level 1: Just give me some global state

Declarative global state stores is a popular approach to managing shared state between components. They are straight forward and solve the immediate problem of sharing state. In **Impact** you would use `globalStore` to create such a store:

```tsx
import { globalStore } from 'impact-app'

const useAppStore = globalStore({
    count: 0,
    get double() {
        return this.count * 2
    },
    increment() {
        this.count++
    }
})

function App() {
    const appStore = useAppStore()

    return (
        <div>
            <h1>{appStore.count}</h1>
            <h4>{appStore.double}</h4>
            <button onClick={appStore.increase}>
                Increase
            </button>
        </div>
    )
}
```

At the core of **Impact** you have [signals](./05_signal.md). The `globalStore` is just an accessible abstraction over lower level APIs like `signal`, `store` and `globalContext`. Each key you define in the global state store is a signal, where *getters* are lazily evaluated derived signals. Components will only reconcile when the consumed signal changes. The state defined in the store is protected so changes to it can only be made from within the store.

## Level 2: I need to compose multiple stores

As the complexity of your state increases you will want to split it up into different domains or namespaces. With **Impact** you can continue using the declarative store API, but rather compose them in a `globalContext` as opposed to a single `globalStore`.

```ts
import { globalContext, store, effect } from 'impact-app'

const useNotifications = () => store({
    stack: [],
    add(newNotification) {
        this.stack = [newNotification, ...this.stack]
        setTimeout(() => {
            this.stack = this.stack.filter((notification) => notification !== newNotification)
        }, 2000)
    }
})

const useTodos = (api, notifications) => {
    const todos = store({
        all: [],
        get completed() {
            return this.all.filter((todo) => todo.completed)
        }
        get remaining() {
            return this.all.filter((todo) => !todo.completed)
        }
        async add(newTodo) {
            this.all = [newTodo, ...this.all]
            try {
                await api.post('/todos', newTodo)
                notifications.add({ type: 'success', text: "Todo saved" })
            } catch {
                this.all = this.all.filter((todo) => todo !== newTodo)
                notifications.add({ type: 'error', text: "Failed adding todo" })
            }
            
            
        }
    })

    effect(() => {
        if (todos.remaining === 10) {
            notifications.add({ type: 'warning', text: "Oh oh, make sure you keep sane!" })
        }
    })

    return todos
}

const useAppStore = globalContext(() => {
    const api = new Api()
    const notifications = useNotifications()
    const todos = useTodos(api, notifications)
        
    return {
        todos,
        notifications
    }
})
```

With `globalContext` you still consume a single global store, but it is composed together using the `store` API, which is the same accessible declarative API over signals. The function scope of `globalContext` is used to compose together the stores however you want and you can start taking advantage of `effect` and whatever else you want to initialise and manage within your global context.

## Level 3: Granular control

In extremely complex web applications you might have multiple pages and features that has some shared state across pages/features and some state scoped to the page/feature, but still with a complex component tree to consume that state. This is where **Impact** gives you `context`. Unlike Reacts context this is, like `globalContext`, a reactive context. The only difference is that it needs to be provided to a component tree.

At this point you can still use the `store` API, but you will more likely embrace raw signals.

```tsx
import { context, signal, cleanup } from 'impact-app'

const usePage = context(({ initialCount }) => {
    const initialCount = signal(initialCount)

    return {
        get initialCount() {
            return initialCount.value
        }
    }
})

const useFeature = context(() => {
    const { initialCount } = usePage()

    const count = signal(initialCount)

    const interval = setInterval(() => {
        count.value++
    }, 1000)

    cleanup(() => clearInterval(interval))

    return {
        get count() {
            return count.value
        }
    }
})

function Feature() {
    const feature = useFeature()

    return <h1>Count: {feature.count}</h1>
}

function Page() {
    return (
        <useFeature.Provider>
            <Feature />
        </useFeature.Provider>
    )
}

function App() {
    return (
        <usePage.Provider initialCount={10}>
            <Page />
        </usePage.Provider>
    )
}
```

Reading this example you see that you gain even more control of your state managent. First of all you can mount your state management with the related component tree. This simplifies lazy loading. You can also pass props to the reactive contexts, initializing state with information coming from your React application. You will also be able to consume contexts from other contexts, in this case the feature context consumes the page context.

At this level of managing complexity new possibilities open up. Things like cleaning up state management as the related component tree unmounts. You can optimise consumption of data in components by giving each nested piece of data its own signal. Now that your state management is fused with React itself you can also start taking advantage of new patterns to manage data fetching.




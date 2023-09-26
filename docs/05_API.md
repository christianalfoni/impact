# API

- [createStore](#createStore)
- [createStoresProvider](#createStoresProvider)
- [useCleanup](#useCleanup)
- [signal](#signal)
    - [derive](#derive)
    - [observe](#observe)
    - [Debugging](#debugging)
- [query/queries](#queryqueries)
    - [fetch](#fetch)
    - [refetch](#refetch)
    - [suspend](#suspend)
    - [setValue](#setvalue)
    - [getValue](#getvalue)
    - [onChange](#onchange)
- [mutation/mutations](#mutationmutations)
    - [mutate](#mutate)
    - [subscribe](#subscribe)
    - [onChange](#onchange)
- [emitter](#emitter)

## createStore

Create your store. By default you stores are automatically registered globally and is shared by all components and other stores.

```ts
import { createStore } from 'impact-app'

function HelloWorld() {
    return {
        message: 'Hello World'
    }
}

export const useHelloWorld = createStore(HelloWorld)
```

## createStoresProvider

Creating a `StoresProvider` allows you to define what stores are shared by what components and other stores. Typically you create one provider at the root of your component tree to capture all stores resolvement and control which stores are considered global to the application and which are scoped to specific pages/features.

```tsx
import { createStoresProvider } from 'impact-app'
import { useStoreA } from './useStoreA'
import { useStoreB } from './useStoreB'
import { useStoreC } from './useStoreC'

export const MyStoresProvider = createStoresProvider({
    useStoreA,
    useStoreB,
    useStoreA
})
```

```tsx
import { MyStoresProvider } from './stores'

function SomeComponent() {
    return (
        /*
            If a store takes an argument, you will pass it here. Typed so that you will not miss it.
            The value is only used when resolving the store, which means if you expect to "remount"
            the store with a new initial value you will need to remount the provider
        */
        <MyStoresProvider useStoreB={100}>
            <SomeComponent />
            <SomeOtherComponent />
        </MyStoresProvider>
    )
}
```

## useCleanup

It used in combination with store providers. When the `StoresProvider` unmounts it will call this function for any stores resolved within the provider.

```ts
import { createStore, signal, useCleanup } from 'impact-app'

function Counter() {
    const count = signal(0)

    const interval = setInterval(() => count.value++, 1000)

    useCleanup(() => clearInterval(interval))

    return {
        get count() {
            return count.value
        }
    }
}

export const useCounter = createStore(Counter)
```

## signal

Creates a value that can be observed by React. Signals are expected to be treated as immutable values, meaning you always need to assign a new value when changing them.

```ts
import { createStore, signal } from 'impact-app'

function HelloWorld() {
    const message = signal('Hello World')

    return {
        get message() {
            return message.value
        }
    }
}

export const useHelloWorld = createStore(HelloWorld)
```

Under the hood signals uses [Immer](https://immerjs.github.io/immer/) which allows you to update the value by using a function. This function gives you the current value and you can use the normal mutation APIs and Immer returns an immutable value:

```ts
import { createStore, signal } from 'impact-app'

function HelloWorld() {
    const messages = signal<string[]>([])

    return {
        get messages() {
            return messages.value
        },
        addMessage(message: string) {
            messages.value = (draft) => {
                draft.push(message)
            }
        }
    }
}

export const useHelloWorld = createStore(HelloWorld)
```

### derive

Creates a signal that lazily recomputes whenever any accessed signals within the derive callback changes.

```ts
import { createStore, signal, derive } from 'impact-app'

function HelloWorld() {
    const message = signal('Hello World')
    const shoutingMessage = derive(() => message.value + '!!!')
    
    return {
        get message() {
            return message.value
        },
        get shoutingMessage() {
            return shoutingMessage.value
        }
    }
}

export const useHelloWorld = createStore(HelloWorld)
```

### observe

To observe signals, and "rerender" the components, they need to bound to an `ObserverContext`. There are two ways you can achieve this. The default way is to use a traditional `observe` higher order component. 

```tsx
import { observe } from 'impact-app'
import { useHelloWorld } from '../stores/useHelloWorld'

function HelloWorld() {
    const helloWorld = useHelloWorld()

    return <div>{helloWorld.message}</div>
}

export default observe(HelloWorld)
```

But the approach above can result in anonymous component names and dictates to some extent how you can define and export components. Another approach, given you do a little bit of configuration is:

```tsx
import { observe } from 'impact-app'
import { useHelloWorld } from '../stores/useHelloWorld'

export function HelloWorld() {
    using _ = observe()

    const helloWorld = useHelloWorld()

    return <div>{helloWorld.message}</div>
}
```

<img align="center" src="https://github.com/christianalfoni/signalit/assets/3956929/5c4a8b43-27a2-4553-a710-146d94fbc612" width="25"/> **TypeScript 5.2**

<br />

<img align="center" src="https://github.com/christianalfoni/signalit/assets/3956929/eb74b1ea-0ff1-4d18-9ba5-97150408ae86" width="25"/> **Babel**

```bash
yarn add @babel/plugin-proposal-explicit-resource-management -D
```

```json
{
    "plugins": [
        "@babel/plugin-proposal-explicit-resource-management"
    ]
}
```

This is a **Stage 3** proposal and is coming to JavaScript.

### Debugging

You can configure VSCode to open the file and position of signal changes and observations by clicking debug statements in the browser.

Make sure your project has a `.vscode/launch.json` file with the following contents:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "msedge",
      "request": "launch",
      "name": "Dev",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}"
    }
  ]
}
```

-  Make sure you have the [Edge](https://www.microsoft.com/en-us/edge?form=MA13FJ&exp=e00) browser installed (It is Chromium, so works just like Chrome)
- Start your dev server
- Use the Debug tool in VSCode and start it, this opens up Edge
- The first time Edge will ask you to set the the workspace folder. Navigate to the project folder on your computer and select it

**NOTE!** If it is not working and you are taken to the source tab, refresh the app

## query / queries

A primitive to handle quering and consuming data across stores and components. The only difference between `query` and `queries` is that `queries` takes a unqiue identifier, typically the UID of a resource, as its first argument. Though that argument can also be an array of multiple values representing the uniqueness of the resource. Using `query` represents a single resource and does not requires a unique identifier.

```ts
import { createStore, queries, query } from 'impact-app'
import { useApi, PostDTO } from './Api'

function Api() {
    return {
        posts: queries((id: string) =>
            fetch('/posts/' + id).then((response) => response.json())
        ),
        status: query(() => fetch('/status').then((response) => response.json()))
    }
}

export const useApi = createStore(Api)
```

The first argument to the `queries` callback is considered the key. It can be a `string` or an array combining `string`, `number` or `boolean`. The query generates a unique caching key based on this. The `query` caches as well.

### fetch

Runs the query and returns a subscription to the state of the query. 

```tsx
import { useApi } from '../useApi'

export const Post = ({ id }: { id: string }) => {
  const api = useApi()
  const postState = api.posts.fetch(id)
  // const statusState = api.status.fetch()

  if (postState.status === 'pending') {
    return <div>Loading...</div>
  }

  if (postState.status === 'rejected') {
    return <div>Error: {postState.reason}</div>
  }

  const post = postState.value
  
  return <div>{post.title}</div>
}
```

### refetch

Runs the query again, even when `fulfilled`. In this state the state of the query has an additional `isRefetching` property set to `true`. Any subscribers of the query will update.

```tsx
import { useApi } from '../useApi'

export const Post = ({ id }: { id: string }) => {
  const api = useApi()
  
  return (
    <div onClick={() => {
        api.posts.refetch(id)
        api.status.refetch()
    }}>
        Click to get a fresh value
    </div>
}
```

### suspend

Just like `fetch`, but the promise is thrown to suspense or error boundary when pending or rejected. When resolved it will subscribe to query state changes and re-evaluate the suspense value. To update the data `refetch` needs to be called.

```tsx
import { useApi } from '../useApi'

export const Post = ({ id }: { id: string }) => {
  const api = useApi()
  
  const post = api.posts.suspend(id)
  // const status = api.status.suspend()
  
  return <div>{post.title}</div>
}
```

### setValue

Immediately set the cache to a fulfilled value. Will notify any subscribers of the change. This can be useful when a subscription updates the query. Any existing pending fetch will be aborted.

```tsx
import { queries, query, useCleanup, createStore } from 'impact-app'

function Api() {
    const notifications = useApiNotifications()
    const posts = queries((id: string) =>
        fetch('/posts/' + id).then((response) => response.json())
    )
    const status = query(() =>
        fetch('/status').then((response) => response.json())
    )

    useCleanup(notifications.subscribeNewPosts(handleNewPosts))
    useCleanup(notifications.subscribeStatus(handleNewStatus))

    function handleNewPosts(post) {
        posts.setValue(post.id, post)
    }

    function handleNewStatus(newStatus) {
        status.setValue(newStatus)
    }

    return {
        posts,
        status
    }
}

export const useApi = createStore(Api)
```

### getValue

Allows you to consume the query as a normal promise. It will fetch the value if not cached, or hook into the existing pending state of the query. This is useful to access query values in other stores.

```tsx
import { createStore } from 'impact-app'

function Api() {
    const api = useApi()

    return {
        async doSomething() {
            try {
                const currentStatus = await api.status.getValue()
                
                if (currentStatus.isAwesome) {
                    // Do something awesome
                }
            } catch () {
                api.status.refetch()
            }
        }
    }
}

export const useApi = createStore(Api)
```


### onStatusChange

Subscribe to when a query changes its status. This can be useful to sync signals.

```ts
import { signal, createStore, QueryState } from 'impact-app'
import { PostDTO } from './useApi'

function Post(initialPost: PostDTO) {
    const api = useApi()
    // We split up the DTO into multiple signals for optimal consumption in components
    const title = signal(initialPost.title)
    const description = signal(initialPost.description)

    useCleanup(api.posts.onStatusChange(post.value.id, handlePostStatusChange))

    function handlePostStatusChange(postQueryState: QueryState<PostDTO>) {
        if (postQueryState.status === 'fulfilled') {
            title.value = postQueryState.value.title
            description.value = postQueryState.value.description
        }
    }

    return {
        get id() {
            return initialPost.id
        },
        get title() {
            return title.value
        },
        get description() {
            return description.value
        }
    }
}

export const usePost = createStore(Post)
```

## mutation / mutations

A mutation represents a one off request which changes something externally. The `mutations` function is for resource with unique identifiers, while `mutation` is for a request representing a single resource.

```ts
import { createStore, mutations, query } from 'impact-app'
import { useApi, PostDTO } from './Api'

function Api() {
    return {
        changePostTile: mutations((id: string, newTitle: string) =>
            fetch({
                url: '/posts/' + id,
                method: POST,
                body: JSON.stringify({ title: newTitle }),
            }).then((response) => response.json())
        ),
    }
}

export const useApi = createStore(Api)
```

### mutate

Runs the request. This method can be called in both stores and components.

```tsx
import { useApi } from '../useApi'

export const Post = ({ id }: { id: string }) => {
  const api = useApi()
  const post = api.posts.suspend(id)
  const [title, setTitle] = useState(post.title)
  const changeTitleState = api.changePostTitle.subscribe(id)

  useEffect(() => api.changePostTile.onStatusChange((changePostTileState) => {
    if (changePostTileState.status === 'fulfilled') {
        alert("Oh yeah, you changed it!")
    }
  }), [])
  
  return (
    <div>
        <input
            disabled={changeTitleState.status === 'pending'}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            onKeyDown={(event) => {
                if (event.key === 'Enter') {
                    api.changePostTitle.mutate(id, title)
                }
            }}
        />
        {changeTitleState.status === 'rejected' ? 'Ops, there was an error!' : null}
    </div>
  )
}
```

### subscribe

Subscribe to the state of a mutation. This method can only be called in components.

**Look at example above**

### onStatusChange

A traditional event listener to react to state changes of a mutation.

**Look at example above**

## emitter

A typed event emitter which enables accessor pattern and disposal.

```ts
import { emitter, createStore } from 'impact-app'

function SomeStore() {
    const fooEmitter = emitter<string>()

    return {
        onFoo: fooEmitter.on,
        trigger() {
            fooEmitter.emit('WOOP!')
        }
    }
}

export const useSomeStore = createStore(SomeStore)
```




# impact
Imperative apps for React

- [Install](#install)
- [Get Started](#get-started)
- [Configuring](#configuring)
- [Explanation](#explanation)
- [Why](#why)
- [Deep Dive](#deep-dive)

## Install

```
yarn install impact-app reflect-metadata
```

## Configuring

**reflect-metadata**

```ts
// In your entry file
import 'reflect-metadata'
```

**tsconfig**
```json
{
    "compilerOptions": {
        "emitDecoratorMetadata": true,
        // Even though TS 5, use this for typing purposes
        "experimentalDecorators": true
    }
}
```

**babel**
```json
{
    "plugins": [
        "babel-plugin-transform-typescript-metadata",
        ["@babel/plugin-proposal-decorators", { version: "legacy" }],
        "@babel/plugin-proposal-class-properties"
    ]
}
```

## Get started

```ts
import { singleton, observer, observable, ContainerProvider, useInject } from 'impact-app'

@singleton()
class Logger {
    log(msg: string) {
        console.log(msg)
    }
}

@singleton()
class Counter {
    @observable()
    count = 0;
    constructor(private logger: Logger) {}
    increase() {
        this.count++
        this.logger.log("increased count")
    }
}

const CounterComponent = observer(() => {
    const count = useInject(Counter)
    
    return (
        <div>
          <p>{count}</p>
          <button onClick={() => counter.increase()}>Increase</button>
        </div>
    )
})

const App = () => (
    <ContainerProvider>
      <CounterComponent />
    </ContainerProvider>
)
```

## Explanation

- **singleton**: Marks a class to be injectable and will resolve any constructor params and inject other classes. The [tsyringe](https://github.com/microsoft/tsyringe) library from Microsoft is used and is also exposed as an export if needed.
- **observable**: Marks a property as observable. Whenever a component accesses an observable during component render it will subscribe to it. No proxies, just a plain getter/setter
- **observer**: Tracks when an observable should return a React hook as opposed to the plain value
- **ContainerProvider**: Exposes a dependency injection container which holds on to classes requested by the **useInject** hook. 
- **useInject**: Uses the container on the context to inject the referenced class and any dependencies it has

## Why

React is an amazing tool to build UIs, though it is typically used to build applications which primarily fetches and displays data, where interactions are by majority driven by a router. There are really good tools to take advantage of Reacts reactive and declarative paradigm to make this an excellent developer experience.

Where React falls short is when you build complex rich applications. In these kinds of applications you quickly end up in putting all your state at the top using context providers and your asynchronous flows becomes a spaghetti of different effects, in different components, reacting to state changes.

There are tools that aid this already, but it is well worth providing an imperative and object oritented version for developers who already embraces an this paradigm for application logic. Allowing them to take full advantage of the latest asynchronous primitives that React itself offers.

## Deep Dive

### observable

Unlike [Mobx](https://mobx.js.org/README.html) which wraps values in proxies to track mutations, the observable is a simple getter/setter tracker. It is considered an immutable value, which is what React requires. That means updating an observable always needs to set the value. With React and favoured patterns in object oriented programming which properly separate private and public access, we can:

```ts
class Todo {
    @observable
    private state = {
        id: 0,
        title: "Hello there",
        isChecked: false
    }
    get id () {
        return this.state.id
    }
    get title () {
        return this.state.title
    }
    get isChecked () {
        return this.state.isChecked
    }
    toggle() {
        this.state = {
            ...this.state,
            isChecked: !this.state.isChecked
        }
    }
}
```

There are no async restrictions or transactional behaviour to an observable. React itself does synchronous batching of state updates.

### Consuming promises

As a rich web application it will most certainly require you to produce some promises. In the context of React, promises can be quite a challenge to express properly. There is actually a proposal from the React team on a first class primitive for React to consume promises, using the [use hook](https://github.com/acdlite/rfcs/blob/first-class-promises/text/0000-first-class-support-for-promises.md#conditionally-suspending-on-data). As part of this suggestion they also suggest the ability to cache promises and read their cached state.

In terms of your imperative layer that means you want to hold on to promises representing resources, this ensures promises are being reused in the UI, but to be best consumable by React they also need a cache state. That is why **Impact** allows you to create a **CachedPromise**. This is a plain `Promise` instance with the additional cache status suggested by the React team.

```ts
import { use, CachedPromise } from 'impact-app';

class Post {
    constructor(public id: string, public title: string, public body: string) {}
}

@Injectable
class Posts {
    private posts: Record<string, CachedPromise<Post>> = {}
    constructor(private api: Api) {}
    fetchPost(id: string) {
        if (!this.posts[id]) {
            this.posts[id] = CachedPromise.from(
                this.api.fetchPost(id).then(
                    ({ id, title, body}) => new Post(id, title, body)
                )
            )
        }
        
        return this.posts[id]
    }
}

const PostComponent = ({ id }: { id: string }) => {
    const posts = useInject(Posts)
    const post = use(posts.fetchPost(id))
}
```

The great thing about this is that you can now safely consume values without having to determine if they have their initial value or not. Use a `CachedPromise` and React will read it synchronously if it is resolved already and for your imperative layer you can still `await` these values.

This approach requires the use of Suspense and Error boundaries in React to handle the pending and error state of the promise.

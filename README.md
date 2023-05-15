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
        // Not after Typescript 5.0
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
import { Injectable, observer, observable, ContainerProvider, useInject } from 'impact-app'

@Injectable
class Logger {
    log(msg: string) {
        console.log(msg)
    }
}

@Injectable
class Counter {
    @observable
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

- **Injectable**: Marks a class to be injectable and will resolve any constructor params and inject other classes
- **observable**: Marks a property as observable. Whenever a component accesses an observable during component render it will return a hook which subscribes to it, as opposed to just getting the value in any other context. No proxies, no magic...
- **observer**: Tracks when an observable should return a React hook as opposed to the plain value
- **ContainerProvider**: Exposes a dependency injection container which holds on to classes requested by the **useInject** hook. 
- **useInject**: Uses the container on the context to inject the referenced class and any dependencies it has

## Why

React is an amazing tool to build UIs, though it is typically used to build applications which primarily fetches and displays data, where interactions are by majority driven by a router. There are really good tools to take advantage of Reacts reactive and declarative paradigm to make this an excellent developer experience.

Where React falls short is when you are building complex rich applications. In these kinds of applications you quickly end up in putting all your state at the top using context providers and your asynchronous flows becomes a spaghetti of different effects reacting to state changes.

There are tools that aid this already, but it is well worth providing an imperative and object oritented version for developers who already embraces an this paradigm for application logic.

## Deep Dive

### observable

Unlike [Mobx](https://mobx.js.org/README.html) which wraps values in proxies to track mutations, the observable is a simple getter/setter tracker. It is considered an immutable value, which is what React requires. That means updating an observable always needs to set the value. With React and favoured patterns in object oriented programming we manage this by:

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

Now we have proper constraints on how this class can be consumed and we ensure that we properly change the state of the class.

There are no async restrictions or transactional behaviour to an observable. React itself does synchronous batching of state updates.

### Consuming promises

As a rich web application it will most certainly require you to produce some promises. In the context of React, promises can be quite a challenge to express properly. There is actually a proposal from the React team on a first class primitive for React to consume promises, using the [use hook](https://irvingvjuarez.medium.com/the-coming-use-promise-hook-in-react-a5fe78186288). In the meantime you can use the accompanying `use` hook from this library or [react-promise-suspense](https://github.com/vigzmv/react-promise-suspense).

```ts
import { use } from 'impact-app';

class Post {
    constructor(public id: string, public title: string, public body: string) {}
}

@Injectable
class Posts {
    private posts: Record<string, Promise<Post>> = {}
    constructor(private api: Api) {}
    fetchPost(id: string) {
        if (!this.posts[id]) {
            this.posts[id] = this.api.fetchPost(id)
                .then(({ id, title, body}) => new Post(id, title, body))
        }
        
        return this.posts[id]
    }
}

const PostComponent = ({ id }: { id: string }) => {
    const posts = useInject(Posts)
    const post = use(posts.fetchPost(id))
}
```

This approach requires the use of Suspense and Error boundaries in React to handle the pending and error state of the promise.

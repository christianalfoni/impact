# @codesandbox/impact

> Bridging object oriented code with React.

## Why

At CodeSandbox we write most of our code in an object oriented paradigm. This includes projects like **pitcher**, **VSCode extension**, **@codesandbox/pitcher-client** and **@codesandbox/api**. To make it easier for us to move between these projects, reuse existing tools and practices and work more effeciently, we use Impact to bridge the gap between this paradigm and Reacts paradigm.

## Exposing classes to React

Instead of creating a tree of class instances representing the different domains of the app we rather expose the classes using dependency injection. This has some benefits:

- It is the React component injecting the class which determines if it will be instantiated. So for example if you never open the VM Metrics devtool, its logic will not be instantiated either
- We avoid having to wire up the dependencies of the class. You just add dependencies as constructor params and they are made available. This makes it easier for us to try out ideas and create prototypes

This is how a container is exposed and how a class would be injected:

```tsx
import { ContainerProvider, useInject, injectable } from '@codesandbox/impact'

@injectable()
class Test {
    foo = 'bar'
}

const TestComponent = () => {
    const test = useInject(Test)
    
    return <h1>{test.foo}</h1>
}

export const App = () => (
    <ContainerProvider>
      <TestComponent />
    </ContainerProvider>
)
```

## Creating reactive values

For React to be able to subscribe to changes in the classes we need to change how values are defined, but we do not not want to change how values are set and consumed in the imperative layer. To achieve this we use a decorator which makes any property of a class a **signal**. This just creates a `getter/setter` for the property.

```ts
import { signal } from '@codesandbox/impact'

class SomeFeature {
    @signal
    foo = 'bar'
}
```

This value can now be used just as normal in the imperative layer, but when being accessed by a component during reconciliation it will subscribe to the `setter`, triggering a new component reconciliation.

```tsx
import { useInject, useSignals } from '@codesandbox/impact'

const SomeComponent = () => {
    const feature = useInject(Feature)
    
    return useSignals(() => (
        <h1>{feature.foo}</h1>
    ))
}
```

**NOTE!** You should think about this signal as an immutable value. You update it like you would update any state in React.

```ts
import { signal, injectable } from '@codesandbox/impact'

@injectable()
class SomeClass {
    @signal
    list = []
    addToList(item) {
        this.list = this.list.concat(item)
    }
}
```

## Providing promises

As part of Reacts roadmap it will have native support for promises with the **use** hook. As stated in the current documentation it is up to the external layer providing the promises to make them optimal for React consumption. Again we want to consume these promise values as normal in the imperative layer, but still make them optimal for React to consume.

The **CachedPromise** utility and the polyfilled **use** hook makes this possible.

```ts
import { CachedPromise, signal, use, useInject } from '@codesandbox/impact'

class SomeFeature {
    @signal
    somePromise: CachedPromise<string>
    constructor() {
        this.somePromise = CachedPromise.from(createStringPromise())
    }
}

const SomeComponent = () => {
    const feature = useInject(SomeFeature)
    const stringValue = use(feature.somePromise)
    
}
```

The use of the **use** hook requires a suspense and error boundary as the component will throw when the promise is pending (suspense) or rejected (error).

To update the value of the promise, for example data from a subscription, you can use `CachedPromise.fulfilled('hello')` to replace the promise with the new resolved value, which can be synchronously read by React. Combine it with a signal to make the component reconcile again if the value of the promise changes.


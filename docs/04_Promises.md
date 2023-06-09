# Promises

As part of Reacts roadmap it will have native support for promises with the **use** hook. As stated in the current documentation it is up to the external layer providing the promises to make them optimal for React consumption. Again we want to consume these promise values as normal in the classes, but still make them optimal for React to consume.

The **CachedPromise** utility and the polyfilled **use** hook makes this possible.

```ts
import { CachedPromise, signal, usePromise, useService, service } from 'impact-app'

@service()
class SomeFeature {
    @signal
    somePromise: CachedPromise<string>
    constructor(api: Api) {
        this.somePromise = CachedPromise.from(this.api.fetchSomething())
    }
}

const SomeComponent = () => {
    const feature = useService(SomeFeature)
    const stringValue = usePromise(feature.somePromise)
    
}
```

The use of the **usePromise** hook requires a suspense and error boundary as the component will throw when the promise is pending (suspense boundary) or rejected (error boundary).

To update the value of the promise, for example data from a subscription, you can use `CachedPromise.fulfilled('hello')` to replace the promise with the new resolved value, which can be synchronously read by React. Combine it with a signal to make the component reconcile again if the value of the promise changes.
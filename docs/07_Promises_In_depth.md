# Promises In Depth

As React aims to support promises natively Impact will allow you to create compatible promises in your services and other classes. These promises are just plain promises, but will be consumed optimally by React as well using the currently polyfilled `use` hook, which is planned to become part of React itself.

```ts
import { service, CachedPromise, signal } from 'impact-app'

@service()
class SomeFeature {
    @signal
    private _status: CachedPromise<StatusDTO>
    private disposeStatusListener: () => void
    get status () {
        return this._status
    }
    constructor(api: Api) {
        // As the status is an async value, we store it as a CachedPromise
        this._status = CachedPromise.from(api.getStatus())
        // Whenever the status update we keep it as a fulfilled cached promise
        this.disposeStatusListener = api.subscribeStatus((status) => {
            this._status = CachedPromise.fulfilled(status)
        })        
    }
    dispose() {
        this.disposeStatusListener()
    }
}
```

And in your component you would consume these promises like:

```tsx
import { useService, usePromise } from 'impact-app'
import { SomeFeature } from './services/SomeFeature'

const SomeStatusComponent = () => {
    const someFeature = useService(SomeFeature)
    const status = usePromise(someFeature.status)
    
    return <div/>
}
```

Cached promises requires the components to have a `Suspense` and `Error` boundary, as the `usePromise` hook throws the promise to these boundaries depending on its state.
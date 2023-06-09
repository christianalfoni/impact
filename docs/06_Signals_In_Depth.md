# Signals In Depth

Signals are values in your services that components can subscribe to. Signals does not have any API to them, they are truly normal values which can be consumed by components and services alike.

```ts
import { service, signal } from 'impact-app'

@service()
class MyService {
    @signal
    foo = 'bar'
    changeFoo(newFoo: string) {
        this.foo = newFoo
    }
}
```

This value is accessed like any other plain value, but when used with the `useSignals` hook a subscription is made to the `setter` of this property in the class instance.

```tsx
import { useService, useSignals } from 'impact-app'
import { MyService } from './services/MyService'

const SomeComponent = () => {
    const myService = useService(MyService)
    
    return useSignals(() => (
        <div>
          <h1>Hello {myService.foo}</h1>
          <button onClick={() => myService.changeFoo('woop woop')}>Change</button>
        </div>
    ))
}
```

In this example the `changeFoo` method is called from a component click, but it could be anything calling this method to change the property and the `SomeComponent` would reconcile again.

## Setters and getters

In Object Oriented code it is common to make state private to the class instance and be explicit about exposing what state can be read and what can be changed. With a signal you would typically:

```ts
import { service, signal } from 'impact-app'

@service()
class SomeFeature {
    @signal
    private _state = {}
    // We expose public state by defining our own getters. As we still access the underlying signal this is
    // also tracked in component reconciliation
    get foo () {
        return this._state.foo
    }
    // As healthy object oriented code does, we explicitly define how to change its internal state
    changeFoo(newFoo: string) {
        this._state = {
            ...this._state,
            foo: newFoo
        }
    }
}
```

## Immutable

You should consider a signal value as immutable, just like React thinks about its values as immutable. That means if you add an object to a class property, you still need to replace the whole object to update it.

```ts
import { service, signal } from 'impact-app'

class Post {
    @signal
    private _data = { title: 'foo' }
    changeTitle(newTitle: string) {
        this._data = {
            ...this._data,
            title: newTitle
        }        
    }
}
```

## Other classes

Signals does not require a `service` class. You can add them to any class.

```ts
import { service, signal } from 'impact-app'

interface IPostDTO {
    title: string
    description: string
}

class Post {
    @signal
    private _data: PostDTO = {}
    constructor(data: PostDTO) {
        this._data = PostDTO
    }
    get title() {
        return this._data.title
    }
    get description() {
        return this._data.description
    }
    
}

@service()
class Posts {
    private _posts: Record<string, CachedPromise<Post>> = {}
    constructor(api: Api) {}
    fetch(id: string) {
        
        if (!this._posts[id]) {
            this._posts[id] = CachedPromise.from(this.api.getPost(id).then((data) => new Post(data)))
        }
        
        return this._posts[id]
    }
}
```

## Computing signals

The `useSignals` hook allows you to add depdencies, meaning it will memoize the value returned from it. This is useful when you need to compute a value, but only when the actual signal changes are any dependent references.

```tsx
import { useService } from 'impact-app'

const SomeComponent = ({ foo }: { foo: string }) => {
    const service = useService(SomeService)
    // This value will only recompute if `service.foo` or the `foo` prop updates
    const computedValue = useSignals(() => service.foo + foo, [foo])
    
    return <div/>
}
```

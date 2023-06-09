# Reactivity

For React to be able to subscribe to changes in the classes we need to change how values are defined, but we do not not want to change how values are set and consumed in the classes.

```ts
import { signal, service } from 'impact-app'

@service()
class SomeFeature {
    /*
      The "signal" decorator creates a getter/setter on this property. Consuming the value
      from a class is exactly the same, though it allows components to subscribe to the setter
      during reconciliation
    */
    @signal
    foo = 'bar'
    changeFoo() {
        /*
          Changing a signal always requires you to replace the existing value. You can not make nested changes
          to objects or arrays and expect that to trigger the signal. This creates consistency with React. No
          magic
        */
        this.foo = 'mip'
    }
}
```

This value can now be used just as normal in the class, but when being accessed by a component during reconciliation it will subscribe to the `setter`, triggering a new component reconciliation when executed.

```tsx
import { useService, useSignals } from 'impact-app'

const SomeComponent = () => {
    /*
      The "useService" hook does not trigger any kind of reactivity, it just gets the instance of the class
    */
    const feature = useService(Feature)
    
    /*
      The "useSignals" hook will track access to signals and subscribe to their "setters". In this
      example we use it to return React elements
    */
    return useSignals(() => (
        <h1>{feature.foo}</h1>
    ))
}
```
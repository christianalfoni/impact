# Hello World

```ts
import { Service, Disposable, useService, Signal } from 'impact-app'

/*
  The "Service" decorator ties the lifecycle of the class
  to the component tree where it is exposed. We extend "Disposable"
  as this class will be disposed when the "App" component unmounts
*/
@Service()
export class HelloWorldService extends Disposable {
    /*
      We define the property as a signal which enables components to observe
      changes to the signal. We ensure it can only be changed within the service by
      using the "protected" keyword
    */
    @Signal()
    protected message = 'Hello World'

    /*
      You always assign a new value to a signal and it should be treated
      as an immutable value.
    */
    upperCaseMessage() [
      this.message = this.message.toUpperCase()
    ]
}

export const useHelloWorld = () => useService(HelloWorldService)
```

```tsx
import { ServiceProvider } from 'impact-app'
import { HelloWorldService } from 'services/HelloWorldService'

/*
  Use the "ServiceProvider" to provide a service to a 
  component tree. When this component unmounts its
  registered services will also dispose
*/
export const App = () => (
    <ServiceProvider services={[HelloWorldService]}>
      <HelloWorldComponent />
    </ServiceProvider>
)
```

```tsx
import { observe } from 'impact-app'
import { useHelloWorld } from 'services/HelloWorldService'

function HelloWorld() {
    // Observe any signals consumed
    using _ = observe()
    
    /*
      Use the "useService" hook to inject a class into a
      component. The class will be instantiated if it has
      not been instantied already. If it has not been
      provided, it will throw an error
    */
    const helloWorld = useHelloWorld()
    
    return <h1 onClick={() => helloWorld.upperCaseMessage()}>{helloWorld.message}</h1>
}
```
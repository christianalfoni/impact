# Hello World

```tsx
import { ServiceProvider, useService, service } from 'impact-app'

/*
  Use the "service" decorator on a class so that the ServiceProvider will only instantiate
  one instance of this class when injected by a component or an other class
*/
@service()
class HelloWorld {
    message = 'Hello World'
}

const HelloWorldComponent = () => {
    /*
      Use the "useService" hook to inject a class into a component. The class will be instantiated if it has
      not been instantied already. Any injected classes in "HelloWorld" would get the same treatment
    */
    const helloWorld = useService(HelloWorld)
    
    return <h1>{helloWorld.message}</h1>
}

/*
  Use the "ServiceProvider" to provide a container. When a nested component injects a class, it will be
  injected in the nearest container provider. That means you can have multiple nested container providers
*/
export const App = () => (
    <ServiceProvider>
      <HelloWorldComponent />
    </ServiceProvider>
)
```
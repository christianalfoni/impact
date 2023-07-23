# Hello World

```tsx
import { ServiceProvider, useService, Service } from 'impact-app'

/*
  The "Service" decorator ties the lifecycle of the class
  to the component tree where it is exposed
*/
@Service()
class HelloWorld {
    message = 'Hello World'
}

/*
  Use the "ServiceProvider" to provide a class to a component tree
*/
export const App = () => (
    <ServiceProvider classes={[HelloWorld]}>
      <HelloWorldComponent />
    </ServiceProvider>
)

function HelloWorldComponent() {
    /*
      Use the "useService" hook to inject a class into a component. The class will be instantiated if it has
      not been instantied already
    */
    const helloWorld = useInject(HelloWorld)
    
    return <h1>{helloWorld.message}</h1>
}
```
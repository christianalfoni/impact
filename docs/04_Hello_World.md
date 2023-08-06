# Hello World

```tsx
import { ServiceProvider, Service, Disposable, useService } from 'impact-app'

/*
  The "Service" decorator ties the lifecycle of the class
  to the component tree where it is exposed. We extend "Disposable"
  as this class will be disposed when the "App" component unmounts
*/
@Service()
export class HelloWorld extends Disposable {
    message = 'Hello World'
}

/*
  Use the "ServiceProvider" to provide a class to a 
  component tree. When this component unmounts its
  registered classes will also dispose
*/
export const App = () => (
    <ServiceProvider services={[HelloWorld]}>
      <HelloWorldComponent />
    </ServiceProvider>
)

function HelloWorldComponent() {
    /*
      Use the "useService" hook to inject a class into a
      component. The class will be instantiated if it has
      not been instantied already. If it has not been
      provided, it will throw an error
    */
    const helloWorld = useService(HelloWorld)
    
    return <h1>{helloWorld.message}</h1>
}
```
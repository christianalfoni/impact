# Hello World

```tsx
import { ServiceProvider, Service, Disposable, useService, signal, observe } from 'impact-app'

/*
  The "Service" decorator ties the lifecycle of the class
  to the component tree where it is exposed. We extend "Disposable"
  as this class will be disposed when the "App" component unmounts
*/
@Service()
export class HelloWorld extends Disposable {
    #message = signal('Hello World')
    get message() {
      return this.#message.value
    }
    upperCaseMessage() [
      this.#message.value = this.#message.value.toUpperCase()
    ]
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
    // Observe any signals consumed
    using _ = observe()
    
    /*
      Use the "useService" hook to inject a class into a
      component. The class will be instantiated if it has
      not been instantied already. If it has not been
      provided, it will throw an error
    */
    const helloWorld = useService(HelloWorld)
    
    return <h1 onClick={() => helloWorld.upperCaseMessage()}>{helloWorld.message}</h1>
}
```
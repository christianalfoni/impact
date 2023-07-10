# Hello World

```tsx
import { InjectionProvider, useInject, injectable } from 'impact-app'

/*
  Use the "injectable" decorator on a class so that the InjectionProvider will only instantiate
  one instance of this class when injected by a component or an other class
*/
@injectable()
class HelloWorld {
    message = 'Hello World'
}

const HelloWorldComponent = () => {
    /*
      Use the "useInject" hook to inject a class into a component. The class will be instantiated if it has
      not been instantied already. Any injected classes in "HelloWorld" would get the same treatment
    */
    const helloWorld = useInject(HelloWorld)
    
    return <h1>{helloWorld.message}</h1>
}

/*
  Use the "InjectionProvider" to provide a container. When a nested component injects a class, it will create the instance
  if it has not been created yet
*/
export const App = () => (
    <InjectionProvider classes={[HelloWorld]}>
      <HelloWorldComponent />
    </InjectionProvider>
)
```
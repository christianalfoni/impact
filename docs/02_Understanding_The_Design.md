# Understanding The Design

There are different ways you can expose an instantiated class to React:

```tsx
const someGlobalClass = new SomeGlobalClass()

export const SomeComponent = () => {
    return <div></div>
}
```

You can just create a class and instantiate it globally in your application. This works, but has a few drawbacks:

- There is really no way to dispose of any instantiated class and recreate it, as they are all global
- When one class depends on an other class you'll have to pass the instance manually
- There is no specific pattern on how to organise the classes and consuming them
- Testing can be difficult as there is no good way to access and mock the classes being exposed to the components

We could take a different approach and rather create a master `App` class and expose it through a context provider. Any other classes are instantiated within this master class:

```tsx
export const AppComponent = () => {
    const [app] = useState(() => new App())
    
    return (
        <context.Provider value={app}>
          <OtherComponents />
        </context.Provider>
    )
}
```

Now any component can consume the application state and logic through a hook. During testing you could test any component in isolation and provide a mocked version of the `App`. Though there are still some drawbacks here:

- You would still have to manually orchestrate disposal of classes and recreating them
- You would still have to manually create instances and passing dependencies down to other classes
- You hardwire new classes into an existing class structure, especially when providing instances of other classes
- Lazy loading state and logic becomes a challenge as everything is wired into a single root class

But there is a mechanism we can use to solve all these challenges. Dependency Injection is not a common mechanism used in the world of JavaScript, but there is no lack of solutions. [tsyringe]() is a library from Microsoft. Tsyringe is a general purpose dependency injector which takes advantage of features not yet fully available in the language, but it allows for an ergonomic experience and solves all the before mentioned issues.

Being a general purpose dependency injector `impact` creates an abstraction over Tsyringe, basically hiding it from you. It uses features from TSyringe to bind classes to React context providers which handles the resolvement and disposal of the classes. Binding to React context providers creates a natural way to organise your state and logic. An example of this is:

```
/src
  /global-services
    index.ts
    Api.ts
    Visibility.ts
    PostsCache.ts
  /posts
    /services
      index.ts
      Posts.ts
    /components
      Posts.tsx
    index.tsx
  index.tsx
```

Each `index.ts` services file defines an `InjectionProvider` where it registers all related classes. Then the `InjectionProvider` is mounted at the top level of the component tree representing a page, feature or whatever you want to scope state and logic to. Whenever this part of the component tree is unmounted, your classes will be disposed. This also creates a natural nesting behaviour where `GlobalServices` would be mounted at the very top level and `PostsServices` would be nested as a child on the Posts page for example.

This also simplifies lazy loading as you can lazy load the component exposing the related `InjectionProvider`. That means when lazy loading the entire Posts page component, you'll also lazy load all the state and logic related to it as well.

A hidden, but important, feature of this approach is that you by default write code that can easily be removed. You can create a class, start consuming other classes without any wiring and consume it. This puts you in a good position to prototype ideas, test features and by deleting the class TypeScript tells what else would need cleaning up.

**The tradefoff** made with this design is that you require more initial setup. Both TypeScript config and babel needs to be configured to enable the decorators and the metadata. There are dependency injection libraries that does not require this initial setup, but their APIs and typing is not as ergonomic. For example:

```ts
class SomeService {
    // Strings that are not typed, just magically mapped to certain properties
    static injects = ['logger']
    // As you do not instantiate the dependency in the constructor you have to use exclamation
    // to override that it really is, which typically breaks linting
    logger: Logger!
}
```

There are solutions that uses decorators without reflection:

```ts
@injectable()
class SomeService {
    // But still we have to override the typing with the exclamation likely to break linting
    @inject()
    logger: Logger!
}
```

Another design decision was to not allow automatic injection. With TSyringe you can inject any class and control the injection with different lifecyle options, but this implicit behaviour makes it difficult to control and understand the behaviour of injection at the point of where you do it, inside a component. So it was decided that the `InjectionProvider` throws if you try to inject a class that is not bound to a specific available `InjectionProvider` in the component tree. This makes you confident controlling where classes can and should be consumed.


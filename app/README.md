# impact-app

```bash
yarn add impact-app
```

## Description

Combines `impact-app` and `impact-signal` for automatic observability in components and documented best practices to build complex applications.

## Learn

### What is a context?

The Impact contexts differs from React by being reactive. That means a context function only runs once when it initializes and uses signals to expose reactive state. A context in isolation is a container for state and management of that state, but a context also gives you other benefits:

- It acts as a data fetching boundary, meaning that between your contexts you'll use React to perform data fetching and pass that data into contexts when they initialize
- They are typically accompanied by suspense and error boundaries, making the boundary of pages, features and other component co locating their state, error handling and loading state
- The lifetime of the context determines the lifetime of all the state within it. When the provider of a context unmounts, so does all the state
- It is often initialized with fetched data and makes that data reactive to any level of granularity you need

### Organising contexts

A context is exposed on a component tree. When navigating your file tree it is beneficial...
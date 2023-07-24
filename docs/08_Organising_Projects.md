# Organising Projects

There are many kinds of services you can build. Some services represents a connection to the API and some other service might expose reactivity to the visibility of the browser. Some services supports other services, while others are to be consumed by components. Exactly how you choose to organise these services is up to you, but to give you some guidance we recommend doing a feature based approach. That means you organise your application by features.

```bash
/dashboard
  /services
  /components
  index.tsx
/projects
  /services
  /components
  index.tsx
```

Some services, just like components, are used globally in the application. You would expose this at the root component of your application. Typical services would be APIs, configuration and other non feature specific services.

```bash
/global-services
/ui-components
/features
    /dashboard
        /services
        /components
        index.tsx
    /projects
        /services
        /components
        index.tsx
index.tsx
```
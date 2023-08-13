# Creating A Feature

A feature is considered a set of components and services that are bound. The feature would be mounted by a component, let's say a `ProjectPage`. This component is responsible for providing any services consumed by a component and any values consumed by related services. An example of this could be:

```tsx
import { ServiceProvider } from 'impact-app'
import { useProjectsCache } from 'services/ProjectsCache'

export function ProjectPage({ id }: { id: string }) {
    const projectsCache = useProjectsCache()
    const projectData = projectsCache.getProject(id).use()

    return (
        <ServiceProvider services={[Project]} values={[['PROJECT_DATA', projectData]]}>
            <Search />
            <Activity />
            <Overview />
        </ServiceProvider>
    )
}
```

You would typically group these services and components in a folder structure where the above content would exist in the `index.tsx` file:

```bash
/src
  /features
    /project
      /services
        Project.ts
      /components
        Search.tsx
        Activity.tsx
        Overview.tsx
      index.tsx
```

If you want to lazy load this feature you can simply lazy load the `index.tsx` file and all related services are also lazy loaded.
# Data Fetching

In rich single page applications you want low level control of data fetching. When data is fetched, how much and when to consider the data expired can vary a lot between applications.

In this guide we look at what kinds of classes you can build to fetch data, cache it, update it and finally consume it in components.

## Data fetching

It is generally a good idea to separate your data fetching into a class that only does the actual fetching. Any caching behaviour is the responsibility of a different class.

Now you have a class which knows how to fetch data and type it correctly.

```ts
import { Service } from 'impact-app'
import { Environment } from './Environment'

export interface PostDTO {
    id: string
    title: string
}

@Service()
export class Api {
    private _baseUrl: string
    constructor(env: EnvironmentService) {
        this._baseUrl = env.API_BASE_URL
    }
    getPost(id: string): Promise<PostDTO> {
        return fetch(`${this._baseUrl}/posts/${id}`)
    }
}
```

## Caching

You might consider caching certain data coming from your API. Maybe you are using a tool that already does this caching. Maybe you have offline support, maybe you can subscribe. Maybe the experience is collaborative, maybe not. In these example we will just look at different scenarios and how you get full control to determine how the caching behaviour works.

Caching data can be very straight forward:

```ts
import { Service } from 'impact-app'
import { Api, PostDTO } from './Api'

@Service()
export class PostsCacheService {
    private _cache: Record<string, Promise<PostDTO>> = {}
    constructor(private api: Api) {}
    getPost(id: string) {
        let existingCache = this._cache[id]

        if (!existingCache) {
            this._cache[id] = existingCache = this.api.getPost(id)
        }

        return existingCache
    }
}
```

Now we have a service responsible for caching posts. This can be fine for some type of data, but you might have data that you want to expire:

```ts
import { Service } from 'impact-app'
import { Api, PostDTO } from './Api'

const EXPIRATION_MS = 60_000

@Service()
export class PostsCacheService {
    private _cache: Record<string, { lastFetched: number, data: Promise<PostDTO> }> = {}
    constructor(private api: Api) {}
    getPost(id: string) {
        let existingCache = this._cache[id]

        if (!existingCache || existingCache.lastFetched + EXPIRATION_MS < Date.now()) {
            this._cache[id] = existingCache = {
                data: this.api.getPost(id),
                lastFetched: Date.now()
            }
        }

        return existingCache
    }
}
```

Now we introduced a mechanism which ensures that that we refetch the post if it is older than a minute. But you might have an application where you optimstically want to keep the cache up to date, even though you are not explicitly looking at posts in the UI:

```ts
import { Service, Disposable } from 'impact-app'
import { Api, PostDTO } from './Api'

@Service()
export class PostsCacheService extends Disposable {
    private _cache: Record<string, Promise<PostDTO>> = {}
    constructor(private api: Api) {
        this.onDispose(api.subscribeNewPosts((post) => {
            this._cache[post.id] = Promise.resolve(post)
        }))
    }
    getPost(id: string) {
        let existingCache = this._cache[id]

        if (!existingCache) {
            this._cache[id] = existingCache = this.api.getPost(id)
        }

        return existingCache
    }
}
```

Now we have a cache which optimistically puts new posts into the cache, ready to be consumed. But you might have an application where you want to subscribe to every post fetched to keep them up to date, as they update very often and you want to always have a fresh version ready:

```ts
import { Service, Disposable } from 'impact-app'
import { Api, PostDTO } from './Api'

@Service()
export class PostsCacheService extends Disposable {
    private _cache: Record<string, Promise<PostDTO>> = {}
    constructor(private api: Api) {}
    getPost(id: string) {
        let existingCache = this._cache[id]

        if (!existingCache) {
            this._cache[id] = existingCache = this.api.getPost(id)
            this.onDispose(
                this.api.subscribePost(id, (updatedPost) => {
                    this._cache[id] = Promise.resolve(updatedPost)
                })
            )
        }

        return existingCache
    }
}
```

And now we we subscribe to any post we have tried to fetch to always have a version up to date.

## Synchronize between services

If you decide to create a service which caches data, you might want to consume that data in a different service. An example of this would be that you have a `ProjectService` which is the service exposing the current project in the application. Lets say you decide to keep the cache up to date as projects change quite often and users often navigate between projects.

In this scenario the user might make changes to the project, but we might also get updates from the API which are either from this user or some other user. First lets look at the cache:

```ts
import { Service, Disposable, emitter, SuspensePromise, useService } from 'impact-app'
import { Api, ProjectDTO } from './Api'

@Service()
export class ProjectsCache extends Disposable {
    private _cache: Record<string, SuspensePromise<ProjectDTO>> = {}
    private _updateEmitter = emitter<ProjectDTO>()
    onUpdate = this._updateEmitter.on
    constructor(private api: Api) {}
    getProject(id: string) {
        let existingCache = this._cache[id]

        if (!existingCache) {
            this._cache[id] = existingCache = SuspensePromise.from(this.api.getProject(id))
            this.onDispose(
                this.api.subscribeProject(id, (updatedProject) => {
                    this._cache[id] = SuspensePromise.resolve(updatedProject)
                    this._updateEmitter.emit(updatedProject)
                })
            )
        }

        return existingCache
    }
}

export const useProjectsCache = () => useService(ProjectsCache)
```

This cache will keep its internal state up to date, but also now emit an event whenever a project is updated.

Our application wants to provide a service representing the current project. That means we will create a `ProjectService` which is tied to the component lifecycle of a Project component. Since there is nothing to render until we have the initial data for the project we added the `SuspensePromise` to allow the following:

```tsx
import { ServiceProvider } from 'impact-app'
import { useProjectsCache } from 'services/ProjectsCache'
import { Project } from 'services/Project'
import { Project as ProjectComponent } from 'components/Project' 

export const ProjectPage = ({ id }: { id: string }) => {
    const projectsCache = useProjectsCache()
    const projectData = projectsCache.getProject(id).use()
    
    return (
        <ServiceProvider services={[Project]} values={[['PROJECT_DATA', projectData]]}>
            <ProjectComponent />
        </ServiceProvider>
    )
}
```

We are now providing a Project service bound to the lifecycle of the `ProjectPage`, where we can access the initial `PROJECT_DATA` as well:

```ts
import { Service, Value, Disposable, Signal } from 'impact-app'
import { ProjectDTO } from 'services/Api'
import { ProjectsCache } from 'services/ProjectsCache'

@Service()
export class Project extends Disposable {
    @Signal()
    private _data: ProjectDTO
    get name() {
        return this._data.name
    }
    constructor(@Value('PROJECT_DATA') data: ProjectDTO, projectsCache: ProjectsCache) {
        this._data = data
        this.onDispose(
            projectsCache.onUpdate((updatedProject) => {
                if (updatedProject.id === this._data.id) {
                    this._data = updatedProject
                }
            })
        )
    }
}
```

Our `Project` service is now initializing with the current cache and then subscribes to any updates. The subscription to the cache is disposed when the `ProjectPage` is unmounted.

## Signal scoping

A project might have a lot of data used in different parts of the application. Currently any change to any piece of project data will cause the signal to trigger. We can make the `Project` service more granular on how it updates.

```ts
import { Service, Value, Disposable, Signal, signal } from 'impact-app'
import { ProjectDTO } from 'services/Api'
import { ProjectsCache } from 'services/ProjectsCache'

@Service()
export class Project extends Disposable {
    private _id: string
    get () {
        return this._id
    }
    @Signal()
    private _name: string
    get name() {
        return this._name
    }
    constructor(@Value('PROJECT_DATA') data: ProjectDTO, projectsCache: ProjectsCache) {
        this._id = data.id
        this._name = data.name
        this.onDispose(
            projectsCache.onUpdate((updatedProject) => {
                if (updatedProject.id === this._data.value.id) {
                    this._name = updatedProject.name
                }
            })
        )
    }
}
```

Now we rather update each signal property of the `Project` service.


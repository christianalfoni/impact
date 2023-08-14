# Sessions

When a user authenticates with an application, the result of that is what we call a session. Some applications allow anonymous sessions. Regardless there needs to be some asynchronous flows in place and a session object available to your application.

With **Impact** we can create a service representing the session:

```ts
import { Service, useService } from 'impact-app'

@Service()
export class SessionService {}

export const useSession = () => useService(SessionService)
```

The question now becomes, how do you perform the initial authentication of the user? They might already be signed in. Given that you do not expose the session as part of data rehydration from the server, we'll need to handle the actual authenticating before creating the session.

```ts
import { Service, usService, SuspensePromise, Disposable } from 'impact-app'
import { ApiService } from 'services/ApiService'

@Service()
export class AuthenticatorService extends Disposable {
    constructor(private _api: ApiService) {}
    authenticate() {
        return SuspensePromise.from(this._api.authenticate())
    }
}

export const useAuthenticator = () => useService(AuthenticatorService)
```

We assume here that you have an `ApiService` where the endpoint for authentication exists. By returning a `SuspensePromise` we are now able to:

```tsx
import { useAuthenticator } from 'services/AuthenticatorService'
import { SessionService } from 'services/SessionService'

export function AppFeature {
    const authenticator = useAuthenticator()
    const user = authenticator.authenticate().use()

    return (
        <ServiceProvider services={[SessionService]} value={[['USER', user]]}>
            <App />
        </ServiceProvider>
    )
}
```

We are now making sure our `SessionService` is instantiated with a fulfilled authentication. That means any component consuming the `SessionService` will not have to validate if the authentication is done, pending or failed:

```ts
import { Service, useService, Signal, Disposable } from 'impact-app'
import { User, ApiService } from 'services/ApiService'

export type SessionEvent = {
    status: 'AUTHENTICATED'
} | {
    status: 'SIGNING_IN'
} | {
    status: 'SIGNED_OUT'
} | {
    status: 'ERROR',
    error: string
}

@Service()
export class SessionService extends Disposable {
    @Signal()
    private _state: SessionState = {
        status: 'AUTHENTICATED'
    }
    get state() {
        return this._state
    }

    @Signal()
    private _user: User | null
    get user() {
        return this._user
    }

    get isAnonymous() {
        return !this._user
    }

    constructor(@Value('USER') user: User | null, private _api: ApiService) {
        this._user = user
    }   
    signIn() {
        this._state = { status: 'SIGNING_IN' }

        return this._api.signIn()
            .then((user) => {
                this._state = { status: 'AUTHENTICATED' }
                this._user = user

                return user
            })
            .catch((error) => {

            })
    }
    signOut() {
        return Suspse
    }
}

export const useSession = () => useService(SessionService)
```
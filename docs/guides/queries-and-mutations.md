# Queries and Mutations

::: warning

This guide is specifically for the **Impact** signal primitives!

:::

One of the most common things you do in any web application is fetching data from the server and changing data on the server. Under the hood, this is typically based on promises. The [new use hook](https://blixtdev.com/all-about-reacts-new-use-hook) allows you to consume promises directly in components in combination with suspense and error boundaries. This is great, but there is more to queries and mutations than just a promise.

## Simple data fetching

When it is a matter of just fetching some initial data, a `signal` can manage that:

```ts
function AppStore() {
  const [data] = signal(fetchData());

  return { data };

  function fetchData() {
    return fetch("/data").then((response) => response.json());
  }
}
```

This `data` is now an observable promise that can be declaratively consumed in components using suspense or the state of the promise:

```ts
function MyComponent() {
  using _ = useObserver();

  const { data } = useAppStore();

  const currentData = use(data());
}
```

And also in stores:

```ts
function AppStore() {
  const [data] = signal(fetchData());

  return {
    data,
    async logData() {
      const currentData = await data();

      console.log(currentData);
    },
  };

  function fetchData() {
    return fetch("/data").then((response) => response.json());
  }
}
```

## Refetching data

A pattern popularised by [react-query](https://tanstack.com/query/latest/docs/framework/react/overview) and [swr](https://swr.vercel.app/) is to use a [stale-while-revalidate](https://tools.ietf.org/html/rfc5861). **Impact** enables this pattern with its `query` primitive.

```ts
function AppStore() {
  const [dataQuery, invalidateDataQuery] = query(() => fetchData());

  return {
    dataQuery,
    invalidateDataQuery,
  };

  function fetchData() {
    return fetch("/data").then((response) => response.json());
  }
}
```

Now components and stores will still consume an observable promise, but they can also access the current state of the query. By _invalidating_ the query a background process will run the query again and update the promise only when resolved or rejected.

```tsx
function MyComponent() {
  using _ = useObserver();

  const { dataQuery, invalidateDataQuery } = useAppStore();

  return (
    <div>
      <h1>Query state is: {dataQuery().state}</h1>
      <h2>Promise state is: {dataQuery().promise.status}</h2>
      <button onClick={invalidateDataQuery}>Refetch</button>
    </div>
  );
}
```

## Caching queries

When you want to fetch data and cache it you can use a simple record in a store mounted at the level of the component tree where the caching should live. If you want the caching to live only on a single page, within a feature or for the whole session of the user, you choose the store that reflects that.

```ts
function AppStore() {
  const itemQueries: Record<string, Query<ItemDTO>> = {};

  return {
    queryItem(id: string) {
      itemQueries[id] = itemQueries[id] || query(() => getItem(id));

      return itemQueries[id];
    },
  };

  function getItem(id: string) {
    return fetch("/items/" + id).then((response) => response.json());
  }
}
```

Now we rather create a method to dynamically create queries for different items when needed.

## Simple mutation

Just like data fetching, you can also perform mutations with a `signal`.

```ts
function AppStore() {
  const [mutation, setMutation] = signal<Promise<void> | undefined>(undefined);

  return {
    mutation,
    mutate() {
      setMutation(putData());
    },
  };

  async function putData() {
    await fetch("/data", {
      method: "PUT",
    });
  }
}
```

In a component or other stores you can consume this mutation signal as an observable promise.

```tsx
function MyComponent() {
  using _ = useObserver();

  const { mutation, mutate } = useAppStore();

  return (
    <div>
      <h1>Mutation status: {mutation()?.status}</h1>
      <button onClick={mutate}>Run mutation</button>
    </div>
  );
}
```

This gives you full control of how the mutation behaves, but just like `query` giving you a good pattern for handling data fetching, the `mutation` primitive will give you a good pattern for handling mutation.

## Optimistic invalidating mutation

**Impact** provides a primitive called `mutation` which simplifies mutations, optimistic updates and refetching. This example considers all the states related to querying an item and changing its title. Handling optimistic UI and any errors.

```ts
function ItemStore(props) {
  const [itemQuery, invalidateItemQuery] = query(getItem);
  const [titleMutation, mutateTitle] = mutation((title: string) =>
    putItemTitle(title).then(invalidateItemQuery),
  );
  const [editedTitle, setEditedTitle] = signal<string | null>(null);

  return {
    itemQuery,
    titleMutation,
    mutateTitle(title: string) {
      mutateTitle(title);
      setEditedTitle(null);
    },
    editedTitle,
    setEditedTitle,
  };

  function getItem() {
    return fetch("/items/" + props.id()).then((response) => response.json());
  }

  async function putItemTitle(title: string) {
    await fetch("/items/" + props.id(), {
      method: "PUT",
      body: JSON.stringify({ title }),
    });
  }
}
```

We can now manage all of this complexity declaratively in a component:

```tsx
function Item() {
  using _ = useObserver();

  const itemStore = useItemStore();
  const currentItemQuery = itemStore.itemQuery();
  const item = use(currentItemQuery.promise);
  const currentEditedTitle = itemStore.editedTitle();
  const currentTitleMutation = itemStore.titleMutation();

  let title: React.ReactNode;

  if (currentTitleMutation) {
    title = (
      <>
        {currentTitleMutation.promise.status === "rejected" ? (
          <div>
            Something went wrong saving the title{" "}
            <button
              onClick={() => itemStore.mutateTitle(currentTitleMutation.data)}
            >
              Try again
            </button>
          </div>
        ) : null}
        <h1
          style={{
            opacity:
              currentTitleMutation.promise.status === "pending"
                ? 0.5
                : currentItemQuery.state === "refetching"
                ? 0.75
                : 1,
          }}
        >
          {currentTitleMutation.data}
        </h1>
      </>
    );
  } else if (currentEditedTitle !== null) {
    title = (
      <input
        value={currentEditedTitle}
        onChange={(event) => itemStore.setEditedTitle(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            itemStore.mutateTitle(currentEditedTitle);
          }
        }}
      />
    );
  } else {
    title = (
      <h1>
        {item.title}{" "}
        <i onClick={() => itemStore.setEditedTitle(itemt.title)}>edit</i>
      </h1>
    );
  }

  return (
    <div>
      {title}
      <p>{item.description}</p>
    </div>
  );
}
```

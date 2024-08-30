# Mutation

Handle mutation states and optimistic data.

```ts
function ItemStore(props) {
  const { api } = context<GlobalStorecontext>();
  const [itemQuery, invalidateItemQuery] = query(() => api.getItem(props.id));
  const [titleMutation, mutateTitle] = mutation((title: string) =>
    api.putItem(props.id, { title }).then(invalidateItemQuery),
  );

  return {
    itemQuery,
    titleMutation,
    mutateTitle,
  };
}
```

The `mutation` callback can take a single argument, which will act as the optimistic data when consuming the mutation.

```ts
const itemStore = useItemStore();
const titleMutation = itemStore.titleMutation();

titleMutation?.promise; // The observable promise of the mutation
titleMutation?.data; // The data passed to the mutation
```

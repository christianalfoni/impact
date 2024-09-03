# Mutation

Handle mutation states and optimistic data.

```ts
import { query, mutation, context } from "@impact-react/signals";
import { GlobalStoreContext } from "./GlobalStore";

function ItemStore(props) {
  const { api } = context<GlobalStoreContext>();
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

::: info

If the mutation is rejected it will stay in a rejected promise state with its optimistic data. If the mutation is fulfilled the mutation is reset to `undefined` again.

:::

# Query

A popular pattern popularised by [react-query](https://tanstack.com/query/latest/docs/framework/react/overview) and [swr](https://swr.vercel.app/) is to use a [stale-while-revalidate](https://tools.ietf.org/html/rfc5861) pattern. **Impact** enables this pattern with its `query` primitive.

```ts
import { query } from "impact-react";
import { createApi } from "./api";

function AppStore() {
  const api = createApi();
  const [itemsQuery, invalidateItems] = query(() => api.getItems());

  return {
    itemsQuery,
    invalidateItems,
  };
}
```

The `itemsQuery` is a signal of the promise and state of the query:

```ts
const appStore = useAppStore();
const items = appStore.itemsQuery();

items.promise; // The observable promise
item.state; // idle, fetching or refetching
```

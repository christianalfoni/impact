---
codeCaption: Working with lists
code: |
  import { memo } from 'react'
  import { useStore, signal, cleanup, createStoreProvider } from 'impact-react'

  function ListStore({ initialItems }) {
    // We create a dictionary to reference items
    const items = initialItems.reduce((acc, item) => {
      // We turn every item into a signal
      acc[item.id] = signal(item)

      return acc
    }, {})

    // We create a signal for managing what to display in the list. It
    // only contains ids to items
    const listById = signal(Object.keys(items))

    cleanup(() => {
      // Subscribe to item updates and update each individual item.
      // Update the "listById" if necessary
    })

    return {
      get listById() {
        return listById.value
      },
      getItemById(id) {
        return items[id].value
      }
    }
  }

  const useListStore = () => useStore(ListStore)
  const ListStoreProvider = createStoreProvider(ListStore)

  // You memoize so that when the list changes the component does
  // not need to reconcile
  const Item = memo(function Item({ id }) {
    using listStore = useListStore()
    // You consume the specific item directly from the store
    const item = listStore.getItemById(id)

    return (
      <li>
        {item.title}
      </li>
    )
  })

  function List() {
    using listStore = useListStore()

    return <ul>{listStore.listById.map((id) => <Item key={id} id={id} />)}</ul>
  }

  export default function App() {
    return (
      <ListStoreProvider initialItems={[{ id: '123', title: "woop" }]}>
        <List />
      </ListStoreProvider>
    )
  }
---

# Lists

Creating observable lists in **Impact** is straightforward. They are essentially a signal with an array.

```ts
import { store } from "impact-react";

function ListStore() {
  const list = store({
    items: [],
  });

  return list;
}
```

Since signal values are considered immutable (like in React), you update that list by:

```ts
import { store } from "impact-react";

function ListStore() {
  const list = store({
    items: [],
    addToList(item) {
      list.items = [item, ...list.items];
    },
  });

  return list;
}
```

But sometimes lists need to update complex objects within that list. In this scenario, it can be a good idea to use something like [immer](https://immerjs.github.io/immer/):

```ts
import { store } from "impact-react";
import { produce } from "immer";

function ListStore() {
  const list = store({
    items: [],
    addToList(item) {
      list.items = produce(list.items, (draft) => {
        draft.unshift(item);
      });
    },
    changeTitle(index, newTitle) {
      list.items = produce(list.items, (draft) => {
        draft[index].title = newTitle;
      });
    },
  });

  return list;
}
```

Most simple lists can be managed this way. However, you might have much bigger lists with sorting, filters and other states. In those cases, you want to ensure maximum performance so that the component managing the list does not reconcile when items in the list update. Plus, you will want full control of what items are shown in the list at any moment.

<ClientOnly>
 <Playground />
</ClientOnly>

Now you are free to choose how to produce the list to display. By iterating the `items` record, you can sort, filter or even add items to the list based on certain interactions. Each item is memoized on its id and the item is only consumed from within the `Item` component, isolating updates.

If each individual item is complex, you can consider providing a store around each list item. However, at this point it would be surprising if each list item could not depend on normal props passing and memoization of nested components to optimise reconciliation.

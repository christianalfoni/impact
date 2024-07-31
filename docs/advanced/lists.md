---
codeCaption: Working with lists
code: |
  import { memo } from 'react'
  import { signal, observer, useStore, createStoreProvider } from 'impact-react'

  function ItemsStore(initialItems) {
    // We create a dictionary to reference items
    const items = initialItems.reduce((acc, item) => {
      // We turn every item into a signal, but we could also do
      // "createItem(item)" if the item and related logic was complex enough
      acc[item.id] = signal(item)

      return acc
    }, {})

    // We create a signal for managing what to display in the list. It
    // only contains ids to items
    const listById = signal(Object.keys(items))

    // TODO: Subscribe to item updates and update each individual item.
    // Update the "listById" if necessary

    return {
      get listById() {
        return listById()
      },
      getItemById(id) {
        return items[id]()
      }
    }
  }

  const useItemsStore = () => useStore(ItemsStore)
  const ItemsStoreProvider = createStoreProvider(ItemsStore)

  // You observe and memoize so that when the App reconciles
  // the component does not need to reconcile, but if the
  // item changes it will reconcile
  const Item = memo(
    observer(({ id }) => {
      // You consume the specific item directly from the app
      const item = app.getItemById(id)

      return (
        <li>
          {item.title}
        </li>
      )
    })
  )

  const Items = observer(() => {
    const itemsStore = useItemsStore()

    return (
      <ul>
        {itemsStore.listById.map((id) => <Item key={id} id={id} />)}
      </ul>
    )
  })

  const App = () => (
    <ItemsStoreProvider initialItems={[{ id: '123', title: "woop" }]}>
      <Items />
    </ItemsStoreProvider>
  )

  export default App
---

# Lists

Creating observable lists in **Impact** is straightforward. They are essentially a signal with an array.

```ts
import { signal } from "impact-react";

function ItemsStore() {
  const list = signal([]);

  return {
    get list() {
      return list();
    },
  };
}
```

Since signal values are considered immutable (like in React), you update that list by:

```ts
import { signal } from "impact-react";

function ItemsStore() {
  const list = signal([]);

  return {
    get list() {
      return list();
    },
    addToList(item) {
      // Immer allows us to use the mutation API to create
      // a new array
      list((current) => {
        current.push(item);
      });
    },
  };
}
```

Most simple lists can be managed this way. However, you might have much bigger lists with sorting, filters and other states. In those cases, you want to ensure maximum performance so that the component managing the list does not reconcile when items in the list update. Plus, you will want full control of what items are shown in the list at any moment.

<ClientOnly>
 <Playground />
</ClientOnly>

Now you are free to choose how to produce the list to display. By iterating the `items` record, you can sort, filter or even add items to the list based on certain interactions. Each item is memoized on its id and the item is only consumed from within the `Item` component, isolating updates.

---
codeCaption: Working with lists
code: |
  import { memo } from 'react'
  import { signal, createStore, useObserver, emitter } from 'impact-react'

  function createItem(item, UPDATE) {
    const [title, setTitle] = signal(item.title)
    
    return {
      id: item.id,
      title,
      [UPDATE](updatedItem) {
        setTitle(updatedItem.title)
      }
    }
  }

  function ItemsStore(props) {
    // We create a symbol that only this store knows about. It will
    // allow the store to update items, but components can not
    const UPDATE = Symbol('UPDATE')
    
    // We want to emit an event to a parent store to subscribe to
    // items
    const emit = emitter()
    
    // We create a dictionary to reference items
    const items = {}
    
    // We populate the items
    for (let item of props.items) {
      items[item.id] = createItem(item, UPDATE)
    }

    // We create a signal for managing what to display in the list. It
    // only contains ids to items
    const listById = signal(Object.keys(items))

    // We subscribe to item updates from some parent store and
    // keep items up to date
    cleanup(emit.subscribeItems((item) => {
      items[item.id][UPDATE](item)
    }))
    
    return {
      items,
      listById
    }
  }

  const useItemsStore = createStore(ItemsStore)

  // We memoize so that when the Items reconciles
  // this component does not need to reconcile, but if the
  // observed item changes it will reconcile
  const Item = memo(function Item({ item }) {
    return (
      <li>
        // We use the Observable component to pinpoint exact positions of observations, optimising
        // exactly where updates should happen
        <Observable>{item.title}</Observable>
      </li>
    )
  })

  function Items() {
    using _ = useObserver()
    
    const { listById, items } = useItemsStore()

    return (
      <ul>
        {listById().map((id) => <Item key={id} item={items[id]} />)}
      </ul>
    )
  }

  export default function App() {
    return (
      <useItemsStore.Provider items={[{ id: '123', title: "woop" }]}>
        <Items />
      </useItemsStore.Provider>
    )
  }
---

# Lists

Creating lists in **Impact** is no different than in React.

```ts
import { signal } from "impact-react";

function ItemsStore() {
  const [list, setList] = signal([]);

  return {
    list,
  };
}
```

Since signal values are considered immutable (like in React), you update that list by:

```ts
import { signal } from "impact-react";

function ItemsStore() {
  const [list, setList] = signal([]);

  return {
    list,
    addToList(item) {
      setList((current) => [...current, item]);
    },
  };
}
```

If the items are complex objects, that often change its properties, you can optimise this by creating signals of the item properties instead of the item itself.

```ts
import { signal } from "impact-react";

function createItem(item) {
  const [title, setTitle] = signal(item.title);
  const [description, setDescription] = signal(item.description);

  return {
    id: item.id,
    title,
    description,
    setTitle,
    setDescription,
  };
}

function ItemsStore() {
  const [list, setList] = signal([]);

  return {
    list,
    addToList(item) {
      setList((current) => [...current, createItem(item)]);
    },
  };
}
```

Since the item object itself never changes, we can now optimise this rendering by passing the item as a prop to a memoed `Item` component.

```tsx
function Items() {
  using _ = useObserver();

  const { list } = useStore(ItemsStore);

  return (
    <ul>
      {list().map((item) => (
        <Item key={item.id} item={item} />
      ))}
    </ul>
  );
}

const Item = memo(function Item(props) {
  using _ = useObserver();

  return (
    <li>
      {props.item.title()} - {props.item.description()}
    </li>
  );
});
```

Now the `Item` never reconciles from changes to the list, only the signals accessed in the component. Most simple lists can be managed this way. However, you might have much bigger lists with sorting, filters, pagination, subscriptions and other states. Here is an example that covers a lot of complexity:

<ClientOnly>
 <Playground />
</ClientOnly>

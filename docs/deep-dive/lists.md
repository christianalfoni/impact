---
codeCaption: Working with lists
code: |
  import { memo } from 'react'
  import { signal, useStore, createStoreProvider, useObserver } from 'impact-react'

  function createItem(item) {
    const title = signal(item.title)
    
    return {
      id: item.id,
      get title() {
        return title()
      }
    }
  }

  function ItemsStore(props) {
    // We create a dictionary to reference items
    const items = {}
    
    // We populate the items
    for (let item of props.items) {
      items[item.id] = createItem(item)
    }

    // We create a signal for managing what to display in the list. It
    // only contains ids to items
    const listById = signal(Object.keys(items))

    // TODO: Subscribe to item updates and update each individual item.
    // Update the "listById" if necessary

    return {
      get items() {
        return items
      },
      get listById() {
        return listById()
      }
    }
  }

  const ItemsStoreProvider = createStoreProvider(ItemsStore)

  // We memoize so that when the Items reconciles
  // this component does not need to reconcile, but if the
  // observed item changes it will reconcile
  const Item = memo(function Item({ item }) {
    using _ = useObserver()
    
    return (
      <li>
        {item.title}
      </li>
    )
  })

  function Items() {
    using _ = useObserver()
    
    const { listById, items } = useStore(ItemsStore)

    return (
      <ul>
        {listById.map((id) => <Item key={id} item={items[id]} />)}
      </ul>
    )
  }

  export default function App() {
    return (
      <ItemsStoreProvider items={[{ id: '123', title: "woop" }]}>
        <Items />
      </ItemsStoreProvider>
    )
  }
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
      list((current) => [...current, item]);
    },
  };
}
```

If the items are complex objects, that often change its properties, you can optimise this by creating signals of the item properties.

```ts
import { signal } from "impact-react";

function createItem(item) {
  const title = signal(item.title);
  const description = signal(item.description);

  return {
    id: item.id,
    get title() {
      return title();
    },
    get description() {
      return description();
    },
  };
}

function ItemsStore() {
  const list = signal([]);

  return {
    get list() {
      return list();
    },
    addToList(item) {
      list((current) => [...current, createItem(item)]);
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
      {list.map((item) => (
        <Item key={item.id} item={item} />
      ))}
    </ul>
  );
}

const Item = memo(function Item(props) {
  using _ = useObserver();

  return (
    <li>
      {props.item.title} - {props.item.description}
    </li>
  );
});
```

Most simple lists can be managed this way. However, you might have much bigger lists with sorting, filters, pagination and other states. In those cases you will want full control of what items are shown in the list at any moment.

<ClientOnly>
 <Playground />
</ClientOnly>

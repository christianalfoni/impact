"use client";

import { useEffect, useRef, useState } from "react";
import { receiver, emitter, createStore, signal, observer } from "impact-react";
import { connectBridge } from "impact-react-debugger";
// import { observable } from "mobx";
// import { observer } from "mobx-react-lite";

type AppStoreEvents = {
  addGrocery(grocery: string): void;
};

function createGrocery(_name: string) {
  const [name] = signal(_name);

  return {
    id: String(Math.random()),
    name,
  };
}

type Grocery = ReturnType<typeof createGrocery>;

function AppStore() {
  const [groceries, setGroceries] = signal<Grocery[]>([]);

  receiver<AppStoreEvents>({
    addGrocery(name) {
      setGroceries((current) => [...current, createGrocery(name)]);
    },
  });

  return {
    groceries,
  };
}

const useAppStore = createStore(AppStore);

function GroceriesStore(props: { groceries: () => Grocery[] }) {
  const emit = emitter<AppStoreEvents>();

  return {
    groceries: props.groceries,
    addGrocery(grocery: string) {
      emit.addGrocery(grocery);
    },
  };
}

const useGrocieresStore = createStore(GroceriesStore);

function ConditionalStore() {
  const [show, setShow] = signal(false);

  return {
    show,
    setShow,
  };
}

const useConditionalStore = createStore(ConditionalStore);

const App = observer(function App() {
  const appStore = useAppStore();

  return (
    <useGrocieresStore.Provider groceries={appStore.groceries()}>
      <Groceries />
    </useGrocieresStore.Provider>
  );
});

const Groceries = observer(function Groceries() {
  const [grocery, setGrocery] = useState("");
  const { groceries, addGrocery } = useGrocieresStore();

  return (
    <div>
      <input
        value={grocery}
        style={{
          color: "black",
        }}
        onChange={(event) => setGrocery(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            addGrocery(grocery);
            setGrocery("");
          }
        }}
      />
      <ul>
        {groceries().map((grocery, index) => (
          <li key={index}>{grocery.name()}</li>
        ))}
      </ul>
    </div>
  );
});

export function Counter() {
  const iframe = useRef<HTMLIFrameElement>(null);
  const [showConditionalStore, setShowConditionalStore] = useState(false);

  useEffect(() => {
    const delayToAvoidCallTwice = setTimeout(() => {
      if (iframe.current?.contentWindow) {
        connectBridge(iframe.current.contentWindow);
      }
    }, 1000);

    return () => {
      clearTimeout(delayToAvoidCallTwice);
    };
  }, [iframe]);

  return (
    <useAppStore.Provider>
      <App />

      <button onClick={() => setShowConditionalStore(!showConditionalStore)}>
        Toggle conditional store
      </button>

      {showConditionalStore && (
        <useConditionalStore.Provider>
          <p>Hello</p>
        </useConditionalStore.Provider>
      )}

      <div className="rounded overflow-hidden m-5">
        <iframe ref={iframe} width="100%" height="500px" src="/debugger" />
      </div>
    </useAppStore.Provider>
  );
}

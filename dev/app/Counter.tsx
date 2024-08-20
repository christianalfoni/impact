"use client";

import React, { useState } from "react";

import { createStoreProvider, Signal, signal, useStore } from "impact-react";
import { Component, ErrorInfo } from "react";

class ErrorCatcher extends Component {
  state = {
    error: null,
  };
  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div>
          Ohoh, error
          <button onClick={() => this.setState({ error: null })}>
            Continue
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function CounterStore(props: { initialCount: Signal<number> }) {
  const count = props.initialCount;

  return {
    get count() {
      return count();
    },
    increase() {
      count((current) => current + 1);
    },
  };
}

const CounterStoreProvider = createStoreProvider(CounterStore);

export function Counter() {
  const [count, setCount] = useState(0);

  return (
    <>
      <button onClick={() => setCount((current) => current + 1)}>
        Change initial
      </button>
      <CounterStoreProvider initialCount={count}>
        <CounterContent />
      </CounterStoreProvider>
    </>
  );
}

function CounterContent() {
  using counterStore = useStore(CounterStore);

  return (
    <div>
      <h1>Count is: {counterStore.count}</h1>
      <button onClick={counterStore.increase}>Increase</button>
    </div>
  );
}

"use client";

import { createStore, effect, signal, use } from "@impact-react/signals";
import { Suspense, useState } from "react";

const useCounterStore = createStore(() => {
  const [count, setCount] = signal(15);

  return {
    count,
  };
});

export const Counter = useCounterStore.provider(function Counter() {
  const state = useCounterStore();

  return <h1>Count {state.count() + 5}</h1>;
});

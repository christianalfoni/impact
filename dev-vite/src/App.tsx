import { createStore } from "@impact-react/mobx";
import { observable } from "mobx";

const useCounterStore = createStore(() => {
  const state = observable({ user: { name: "BlippetiBo" } });

  return {
    custom: {
      state,
    },
  };
});

export const Counter = useCounterStore.provider(function Counter() {
  const state = useCounterStore();

  return (
    <h1 onClick={() => (state.custom.state.user.name = "BlappatiBlapp")}>
      Count {state.custom.state.user.name}
    </h1>
  );
});

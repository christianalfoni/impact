// usage-example.ts
import { transform } from "@swc/core";
import { createTransformer } from "./dist/cjs/index.cjs";

const code = `
const Counter = () => {
  const state = useCounterStore();

  return <h1>Hello</h1>
}

const Counter2 = useCounterStore.provider(() => {
  const state = useCounterStore();

  return <h1>Hello</h1>
})
  
const Counter3 = useCounterStore.provider(function Counter3() {
  const state = useCounterStore();

  return <h1>Hello</h1>
})
  
function Counter4() {
  const state = useCounterStore();

  return <h1>Hello</h1>
}
  
function Counter5() {
  const state = useCounterStore();
  const state2 = useAppStore();

  return <h1>Hello</h1>
}
  
const Counter6 = observer(function Counter6() {
  const state = useCounterStore()
  
  return <h1>Hello</h1>
})

`;

transform(code, {
  jsc: {
    parser: {
      syntax: "typescript",
      tsx: true,
    },
    transform: {},
  },
  plugin: createTransformer("@impact-react/signals"),
}).then((output) => {
  console.log(output.code);
});

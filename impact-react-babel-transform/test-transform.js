import { transformSync } from "@babel/core";

async function main() {
  const result = transformSync(
    `
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

`,
    {
      plugins: [
        "@babel/plugin-syntax-jsx",
        [
          (await import("./dist/cjs/index.cjs")).transform,
          {
            filename: process.cwd() + "/test.tsx",
            packageName: "@impact-react/signals",
          },
        ],
      ],
    },
  );

  console.log(result.code);
}

main();

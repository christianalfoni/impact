import { transformSync } from "@babel/core";

async function main() {
  const result = transformSync(
    `
const Counter = useCounterStore.provider(function Counter() {
  const state = useCounterStore();

  
  })


`,
    {
      plugins: [
        (await import("./dist/cjs/transform.cjs")).createTransformer(
          "@impact-react/signals",
        ),
      ],
    },
  );

  console.log(result.code);
}

main();

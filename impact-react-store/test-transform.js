import { transformSync } from "@babel/core";

const result = transformSync(
  `
    import React from 'react'    

    export default provideStore(function App()  {
        const test = useStore()

        
})
`,
  {
    plugins: ["./dist/cjs/transform.cjs"],
  },
);

console.log(result.code);

import { useState } from "react";

export const App = function Counter() {
  const [count] = useState(50);

  return <h1>Count {count}</h1>;
};

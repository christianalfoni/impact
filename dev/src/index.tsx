import React, { Suspense, memo } from "react";
import { createRoot } from "react-dom/client";

import { derived, observe, signal, use } from "impact-react";

function createApp() {
  const count = signal(0);
  const double = derived(() => count() * 2);
  const time = signal(
    new Promise<string>((resolve) => setTimeout(() => resolve("foo"), 1000)),
  );

  return {
    get count() {
      return count();
    },
    get double() {
      return double();
    },
    get time() {
      return time();
    },
    increase() {
      count((current) => current + 1);
    },
  };
}

const app = createApp();

const Test = observe(() => <h1>Hi {use(app.time)}</h1>);

const Test2 = memo(observe(() => <h1>Hi {app.double}</h1>));

export default function App() {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <Test />
        <Test2 />
      </Suspense>
      <button onClick={app.increase}>Increase</button>;
    </div>
  );
}

const root = createRoot(document.getElementById("root")!);
root.render(<App />);

import Image from "next/image";
// import { SignalsExample } from "./SignalsExample";
import { MobxExample } from "./MobxExample";
// import { PreactExample } from "./PreactExample";
// import { LegendExample } from "./LegendExample";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <hr />
      <h4>Signals</h4>
      {/*<SignalsExample />*/}
      <hr />
      <h4>Mobx</h4>
      <MobxExample />
      <hr />
      <h4>Preact</h4>
      {/*<PreactExample />*/}
      <hr />
      <h4>Legend</h4>
      {/*<LegendExample />*/}
      <hr />
    </main>
  );
}

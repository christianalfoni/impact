import Image from "next/image";
import { Counter } from "./Counter";

export default function Home() {
  return (
    <>
      <Counter />

      <br />

      <div className="rounded overflow-hidden m-5">
        <iframe width="100%" height="500px" src="/debugger" />
      </div>
    </>
  );
}

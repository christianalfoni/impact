import { context, derived, effect, signal } from "impact-app";

function Store() {
  const foo = signal("bar");
  const upperFoo = derived(function UpperFoo() {
    return foo.value.toUpperCase();
  });

  effect(function LogFoo() {
    console.log(foo.value);
  });

  return {
    get foo() {
      return foo.value;
    },
    get upperFoo() {
      return upperFoo.value;
    },
    changeFoo() {
      foo.value += "!";
    },
  };
}

export const useStore = context(Store);

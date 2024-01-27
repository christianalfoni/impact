import { context, derived, effect, signal } from "impact-app";

function Store() {
  const foo = signal("bar");
  const obj = signal({});
  const upperFoo = derived(function UpperFoo() {
    return foo.value.toUpperCase();
  });

  const reallyLongFunctionNameForTesting = derived(
    function reallyLongFunctionNameForTestingTest() {
      obj.value["foo"] = "bar";

      return obj.value;
    },
  );

  effect(function LogFoo() {
    console.log(foo.value, reallyLongFunctionNameForTesting);
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
      const newObjt = { ...obj.value, anotherValue: "baz" };
      obj.value = newObjt;
    },
  };
}

export const useStore = context(Store);

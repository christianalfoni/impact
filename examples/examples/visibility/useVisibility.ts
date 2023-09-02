import { cleanup, createHook, emitter, signal } from "impact-app";

function Visibility() {
  const isVisible = signal(document.visibilityState === "visible");
  const visibilityEmitter = emitter<boolean>();
  const visibilityListener = () => {
    isVisible.value = document.visibilityState === "visible";
    visibilityEmitter.emit(isVisible.value);
  };

  document.addEventListener("visibilitychange", visibilityListener);

  cleanup(() => {
    document.removeEventListener("visibilitychange", visibilityListener);
  });

  return {
    get isVisible() {
      return isVisible.value;
    },
    onChange: visibilityEmitter.on,
  };
}

export const useVisbility = createHook(Visibility);

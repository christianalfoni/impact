import StackFrame from "stackframe";
import {
  ObserverContext,
  ObserverContextType,
  SignalNotifier,
  debugHooks,
} from "impact-react";
import {
  DebugData as _DebugData,
  CONNECT_DEBUG_MESSAGE,
  DEBUG_SOURCE,
  DebugDataPayload,
} from "./types";
import { SerialQueue } from "./SerialQueue";
import {
  createSourceMappedStackFrame,
  createStackFrameData,
} from "./stackFrameUtils";
import { cleanFilePath, cleanFunctionName, createDebugId } from "./utils";
import { Store } from "impact-react-store";

const cache: { [url: string]: Promise<StackFrame> } = {};
const observedSignals = new WeakMap<
  SignalNotifier,
  { [cacheKey: string]: ObserverContextType }
>();

let promiseResolver: (value: Window) => void;
const awaitBridge = new Promise<Window>((resolve) => {
  promiseResolver = resolve;
});

export type DebugData = _DebugData;

export function connectBridge(target: Window) {
  target.postMessage(CONNECT_DEBUG_MESSAGE, "*");
  promiseResolver(target);
}

async function sendMessage(payload: DebugDataPayload) {
  const targetWindow = await awaitBridge;

  const message: DebugData = {
    source: DEBUG_SOURCE,
    payload,
  };

  targetWindow.postMessage(message, "*");
}

const queue = new SerialQueue();

function createGetterDebugEntry(
  context: ObserverContext,
  signal: SignalNotifier,
) {
  let stack = new Error().stack!;

  // This cleans the stack to remove anything happening before running the effect, as
  // when resolving contexts will run effects immediately, also showing the component
  // stack trace
  if (context.type === "effect") {
    const contextStackEffect = context.stackTrace.split("\n")[3];
    const debugStack = stack.split("\n");
    const debugStacEffectIndex = debugStack.findIndex(
      (line) => line === contextStackEffect,
    );

    stack = debugStack.slice(0, debugStacEffectIndex).join("\n");
  }

  const stackFrameDataList = createStackFrameData(stack);
  const stackFrameData =
    context.type === "derived"
      ? stackFrameDataList.shift()
      : stackFrameDataList.pop();

  if (!stackFrameData) {
    return;
  }

  const { file, line, column, functionName } = stackFrameData;

  const cacheKey = file + line + column;

  cache[cacheKey] =
    cache[cacheKey] ||
    createSourceMappedStackFrame(file, functionName, line, column).catch(
      (error) => {
        delete cache[cacheKey];
        console.error({ file, stack });
        throw error;
      },
    );

  const observedSignal = observedSignals.get(signal);

  if (observedSignal) {
    observedSignal[cacheKey] = context.type;
  } else {
    observedSignals.set(signal, {
      [cacheKey]: context.type,
    });
  }
}

function createSetterDebugEntry(
  signal: SignalNotifier,
  value: unknown,
  isDerived = false,
) {
  const id = createDebugId();
  const stack = new Error().stack!;
  const stackFrameData = createStackFrameData(stack);
  const sourceFrame = stackFrameData.pop()!;
  const targetFrame = stackFrameData.shift() || sourceFrame;

  if (!sourceFrame) {
    return;
  }

  const sourceCacheKey =
    sourceFrame.file + sourceFrame.line + sourceFrame.column;

  cache[sourceCacheKey] =
    cache[sourceCacheKey] ||
    createSourceMappedStackFrame(
      sourceFrame.file,
      sourceFrame.functionName,
      sourceFrame.line,
      sourceFrame.column,
    );

  const targetCacheKey =
    targetFrame.file + targetFrame.line + targetFrame.column;

  cache[targetCacheKey] =
    cache[targetCacheKey] ||
    createSourceMappedStackFrame(
      targetFrame.file,
      targetFrame.functionName,
      targetFrame.line,
      targetFrame.column,
    );

  queue.add(() =>
    cache[sourceCacheKey].then(
      (stackFrame) => {
        const { functionName } = stackFrame;
        const observedSignal = observedSignals.get(signal)!;

        const observers = observedSignal ? Object.keys(observedSignal) : [];

        const setterPromise = targetCacheKey
          ? cache[targetCacheKey]
          : Promise.resolve(null);

        return Promise.all(observers.map((cacheKey) => cache[cacheKey])).then(
          (observingStackFrames) => {
            return setterPromise.then((targetFrame) => {
              sendMessage({
                [isDerived ? "derived_updated" : "signal_updated"]: {
                  ref: id,
                  value,
                  observers: observingStackFrames.map(
                    (observingStackFrame, index) => ({
                      type: observedSignal[observers[index]],
                      name: cleanFunctionName(observingStackFrame.functionName),
                      path: cleanFilePath(observingStackFrame),
                    }),
                  ),
                  source: {
                    name: cleanFunctionName(functionName),
                    path: cleanFilePath(stackFrame),
                  },
                  target: {
                    name: cleanFunctionName(
                      targetFrame?.functionName || "ANONYMOUS",
                    ),
                    path: cleanFilePath(targetFrame),
                  },
                },
              } as DebugDataPayload);

              return;
            });
          },
        );
      },
      (error) => {
        console.log("ERROR SETTER", error, sourceCacheKey);
      },
    ),
  );
}

// We cache the initial effects stacktrace as that is what
// we want to use for reference whenever the effect triggers
const effectsCachedStackFrame = new Map<() => void, Promise<StackFrame>>();

function createEffectDebugEntry(effect: () => void) {
  const id = createDebugId();

  let stackFramePromise = effectsCachedStackFrame.get(effect);

  if (!stackFramePromise) {
    const stack = new Error().stack!;

    // We need to figure out where effect is being called from
    const stackFrameData = createStackFrameData(stack);
    const targetFrame = stackFrameData.shift();

    if (!targetFrame) {
      return;
    }

    stackFramePromise = createSourceMappedStackFrame(
      targetFrame.file,
      targetFrame.functionName,
      targetFrame.line,
      targetFrame.column,
    );

    effectsCachedStackFrame.set(effect, stackFramePromise);
  }

  queue.add(() =>
    stackFramePromise!.then((stackFrame) => {
      sendMessage({
        effect_updated: {
          ref: id,
          name: effect.name,
          target: {
            name: cleanFunctionName(stackFrame?.functionName || "ANONYMOUS"),
            path: cleanFilePath(stackFrame),
          },
        },
      });
    }),
  );
}

function createStoreMountedEntry(store: Store<any, any>, parentName?: string) {
  sendMessage({
    store_mounted: {
      store,
      parentStore: parentName,
      props: {},
      observables: [],
    },
  });
}

// Set up debug hooks
debugHooks.onGetValue = createGetterDebugEntry;
debugHooks.onSetValue = createSetterDebugEntry;
debugHooks.onEffectRun = createEffectDebugEntry;
debugHooks.onStoreMounted = createStoreMountedEntry;

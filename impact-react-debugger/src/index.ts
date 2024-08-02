import StackTraceGPS from "stacktrace-gps";
import StackFrame from "stackframe";
import {
  ObserverContext,
  ObserverContextType,
  SignalInstance,
  signalDebugHooks,
} from "impact-react";
import { mount, unmount, addDebugData } from "./ui";

const cache: {
  [url: string]: Promise<StackFrame>;
} = {};

const observedSignals = new WeakMap<
  SignalInstance,
  {
    [cacheKey: string]: ObserverContextType;
  }
>();

let isHoldingShift = false;
let lastShiftPress = Date.now();
let isActive = localStorage.getItem("impact.debugger.isActive") === "true";

if (isActive) {
  mount();
} else {
  console.log(
    "The Impact debugger is initialized, hit SHIFT twice toggle activation",
  );
}
document.addEventListener("keyup", (event) => {
  if (isHoldingShift && !event.shiftKey) {
    lastShiftPress = Date.now();
    isHoldingShift = false;
  }
});

document.addEventListener("keydown", (event) => {
  if (!event.shiftKey) {
    return;
  }

  isHoldingShift = true;

  const now = Date.now();

  if (now - lastShiftPress < 300) {
    isActive = !isActive;
    console.log(
      isActive
        ? "Signal debugging is active"
        : "Signal debugging is deactivated",
    );
    if (isActive) {
      localStorage.setItem("impact.debugger.isActive", "true");
      mount();
    } else {
      localStorage.setItem("impact.debugger.isActive", "false");
      unmount();
    }
  }
});

class SerialQueue {
  private queue: Array<() => Promise<void>> = [];
  private processNextItem() {
    const nextItem = this.queue[0];

    if (!nextItem) {
      return;
    }

    nextItem().finally(() => {
      this.queue.shift();
      this.processNextItem();
    });
  }
  add(processItem: () => Promise<void>) {
    this.queue.push(processItem);

    if (this.queue.length === 1) {
      this.processNextItem();
    }
  }
}

const queue = new SerialQueue();

function createStackFrameData(stack: string) {
  if (window.navigator.userAgent.includes("Chrome")) {
    const callSites = stack
      .split("\n")
      .slice(1)
      .filter(
        (line) =>
          !line.includes("node_modules") &&
          line.includes(window.location.origin) &&
          !line.includes("createSetterDebugEntry") &&
          !line.includes("createGetterDebugEntry") &&
          !line.includes("impact-app") &&
          // Vite
          !line.includes("@fs"),
      );

    const stackFrameData: Array<{
      file: string;
      line: number;
      column: number;
      functionName: string;
    }> = [];

    for (const callSite of callSites) {
      try {
        let functionName =
          callSite.match(/.*at (.*)?\(/)?.[1]?.trim() ?? "ANONYMOUS";
        functionName = functionName.split(".").pop()!;

        let file = callSite.substring(callSite.indexOf(location.origin));

        file = file.substring(0, file.length - 1);

        const parts = file.split(":");

        const column = Number(parts.pop());
        const line = Number(parts.pop());

        file = parts.join(":");

        file = file.includes("?") ? file.substring(0, file.indexOf("?")) : file;

        stackFrameData.push({ file, line, column, functionName });
      } catch (error) {
        console.log(error);
      }
    }

    return stackFrameData;
  }

  return [];
}

function createSourceMappedStackFrame(
  file: string,
  functionName: string,
  line: number,
  column: number,
) {
  const stackframe = new StackFrame({
    fileName: file,
    functionName,
    lineNumber: line,
    columnNumber: column,
  });

  const gps = new StackTraceGPS();

  return gps.pinpoint(stackframe).then((result) => {
    // console.log("Pinpointed stackframe", functionName, stackframe, result);
    result.setFunctionName(functionName);

    return result;
  });
}

export function createGetterDebugEntry(
  context: ObserverContext,
  signal: SignalInstance,
) {
  if (!isActive) {
    return;
  }

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

function cleanFunctionName(functionName?: string) {
  if (!functionName) {
    return "ANONYMOUS";
  }

  // Remove "[as current]" etc.
  functionName = functionName.replace(/\s\[.*\]/, "");

  // Only return last part, as getters has a "get " in front
  return functionName.split(" ").pop()!;
}

function cleanFilePath(stackFrame: StackFrame | null) {
  if (!stackFrame || !stackFrame.fileName) {
    return "UNKNOWN";
  }

  let path = stackFrame.fileName.replace(window.location.origin, "");

  if (stackFrame.lineNumber) {
    path += ":" + stackFrame.lineNumber;
  }

  if (stackFrame.columnNumber) {
    path += ":" + stackFrame.columnNumber;
  }

  return path;
}

let debugDataId = 0;
export function createSetterDebugEntry(
  signal: SignalInstance,
  value: unknown,
  isDerived = false,
) {
  if (!isActive) {
    return;
  }

  const id = debugDataId++;
  const stack = new Error().stack!;
  const stackFrameData = createStackFrameData(stack);
  const sourceFrame = stackFrameData.pop()!;
  const targetFrame = stackFrameData.shift() || sourceFrame;

  if (!sourceFrame) {
    console.log("Unable to create setter debug entry");
    console.log(stack);
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
              addDebugData({
                id,
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
                type: isDerived ? "derived" : "signal",
              });

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
  if (!isActive) {
    return;
  }

  const id = debugDataId++;

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
    // Not sure why TS yells here, we always assign a promise to this variable, hm
    stackFramePromise!.then((stackFrame) => {
      addDebugData({
        id,
        type: "effect",
        name: effect.name,
        target: {
          name: cleanFunctionName(stackFrame?.functionName || "ANONYMOUS"),
          path: cleanFilePath(stackFrame),
        },
      });
    }),
  );
}

signalDebugHooks.onGetValue = createGetterDebugEntry;
signalDebugHooks.onSetValue = createSetterDebugEntry;
signalDebugHooks.onEffectRun = createEffectDebugEntry;

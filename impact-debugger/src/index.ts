import StackTraceGPS from "stacktrace-gps";
import StackFrame from "stackframe";
import {
  ObserverContextType,
  SignalTracker,
  signalDebugHooks,
} from "impact-app";
import { mount, unmount, addDebugData } from "./ui";

console.log("The Impact debugger is initialized, hit SHIFT twice to activate");

const cache: {
  [url: string]: Promise<StackFrame>;
} = {};

const observedSignals = new WeakMap<
  SignalTracker,
  {
    type: ObserverContextType;
    cache: Set<string>;
  }
>();

let lastShiftPress = Date.now();
let isActive = localStorage.getItem("impact.debugger.isActive") === "true";

if (isActive) {
  mount();
}

document.addEventListener("keydown", (event) => {
  if (!event.shiftKey) {
    return;
  }
  const now = Date.now();

  if (now - lastShiftPress < 750) {
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
  } else {
    lastShiftPress = now;
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
          !line.includes("impact-app"),
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
    result.setFunctionName(functionName);

    return result;
  });
}

export function createGetterDebugEntry(
  type: ObserverContextType,
  signal: SignalTracker,
) {
  if (!isActive) {
    return;
  }

  const stack = new Error().stack!;

  const stackFrameData = createStackFrameData(stack).pop();

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
    observedSignal.cache.add(cacheKey);
  } else {
    observedSignals.set(signal, {
      type,
      cache: new Set([cacheKey]),
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

export function createSetterDebugEntry(
  signal: SignalTracker,
  value: unknown,
  isDerived = false,
) {
  if (!isActive) {
    return;
  }

  const stack = new Error().stack!;
  const stackFrameData = createStackFrameData(stack);
  const sourceFrame = stackFrameData.pop()!;
  const targetFrame = stackFrameData.shift();

  if (!sourceFrame) {
    return;
  }

  const sourceCacheKey =
    sourceFrame.file + sourceFrame.line + sourceFrame.column;
  let targetCacheKey: string | undefined;

  cache[sourceCacheKey] =
    cache[sourceCacheKey] ||
    createSourceMappedStackFrame(
      sourceFrame.file,
      sourceFrame.functionName,
      sourceFrame.line,
      sourceFrame.column,
    );

  if (
    targetFrame &&
    (targetFrame.file !== sourceFrame.file ||
      targetFrame.line !== sourceFrame.line ||
      targetFrame.column !== sourceFrame.column)
  ) {
    targetCacheKey = targetFrame.file + targetFrame.line + targetFrame.column;
    cache[targetCacheKey] =
      cache[targetCacheKey] ||
      createSourceMappedStackFrame(
        targetFrame.file,
        targetFrame.functionName,
        targetFrame.line,
        targetFrame.column,
      );
  }

  queue.add(() =>
    cache[sourceCacheKey].then(
      (stackFrame) => {
        const { fileName, lineNumber, columnNumber, functionName } = stackFrame;
        const observedSignal = observedSignals.get(signal)!;
        const observers = Array.from(observedSignal.cache);

        const setterPromise = targetCacheKey
          ? cache[targetCacheKey]
          : Promise.resolve(null);

        return Promise.all(observers.map((cacheKey) => cache[cacheKey])).then(
          (observingStackFrames) => {
            return setterPromise.then((targetFrame) => {
              if (isDerived) {
                addDebugData({
                  value,
                  observers: observingStackFrames.map(
                    (observingStackFrame) => ({
                      type: observedSignal?.type,
                      name: cleanFunctionName(observingStackFrame.functionName),
                      path: cleanFilePath(observingStackFrame),
                    }),
                  ),
                  source: {
                    name: cleanFunctionName(functionName),
                    path: cleanFilePath(stackFrame),
                  },
                  type: "derived",
                });
              } else {
                addDebugData({
                  value,
                  observers: observingStackFrames.map(
                    (observingStackFrame) => ({
                      type: observedSignal?.type,
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
                  type: "signal",
                });
              }

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

signalDebugHooks.onGetValue = createGetterDebugEntry;
signalDebugHooks.onSetValue = createSetterDebugEntry;

import StackTraceGPS from "stacktrace-gps";
import StackFrame from "stackframe";
import { SignalTracker, signalDebugHooks } from "impact-app";

console.log("The Impact debugger is initialized, hit SHIFT twice to activate");

const cache: {
  [url: string]: Promise<StackFrame>;
} = {};

const observedSignals = new WeakMap<SignalTracker, Set<string>>();

let lastShiftPress = Date.now();
let isActive = false;
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
          !line.includes("createGetterDebugEntry"),
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
      } catch {
        // Do not care
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

export function createGetterDebugEntry(signal: SignalTracker) {
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
    observedSignal.add(cacheKey);
  } else {
    observedSignals.set(signal, new Set([cacheKey]));
  }
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

  if (!sourceFrame || !targetFrame) {
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
    targetFrame.file !== sourceFrame.file &&
    targetFrame.line !== sourceFrame.line &&
    targetFrame.column !== sourceFrame.column
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
        const observers = Array.from(
          observedSignals.get(signal) || new Set<string>(),
        );
        const setterPromise = targetCacheKey
          ? cache[targetCacheKey]
          : Promise.resolve(null);

        return Promise.all(observers.map((cacheKey) => cache[cacheKey])).then(
          (observingStackFrames) => {
            return setterPromise.then((targetFrame) => {
              console.groupCollapsed(
                `%c# ${
                  isDerived ? "DERIVE" : "SET"
                } SIGNAL at ${functionName}:`,
                isDerived
                  ? "background-color: rgb(209 250 229);color: rgb(6 78 59);padding:0 4px 0 4px;"
                  : "background-color: rgb(224 242 254);color: rgb(22 78 99);padding:0 4px 0 4px;",
                value,
              );

              if (isDerived) {
                const derivedFrame = targetFrame || {
                  functionName,
                  fileName,
                  lineNumber,
                  columnNumber,
                };
                console.log("%Derived at:", "font-weight:bold;");
                console.log(
                  derivedFrame.functionName,
                  derivedFrame.fileName +
                    ":" +
                    derivedFrame.lineNumber +
                    ":" +
                    derivedFrame.columnNumber,
                );
              } else {
                console.log(
                  `${targetFrame ? "%cCalled from:" : "%cChanged at:"}`,
                  "font-weight:bold;",
                );
                console.log(
                  functionName,
                  fileName + ":" + lineNumber + ":" + columnNumber,
                );

                if (targetFrame) {
                  console.log("%cChanged at:", "font-weight:bold;");
                  console.log(
                    targetFrame.functionName,
                    targetFrame.fileName +
                      ":" +
                      targetFrame.lineNumber +
                      ":" +
                      targetFrame.columnNumber,
                  );
                }
              }

              console.log("%cObservers:", "font-weight:bold;");
              observingStackFrames.forEach((observingStackFrame) => {
                console.log(
                  observingStackFrame.functionName,
                  observingStackFrame.fileName +
                    ":" +
                    observingStackFrame.lineNumber +
                    ":" +
                    observingStackFrame.columnNumber,
                );
              });
              console.groupEnd();
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

import StackTraceGPS from "stacktrace-gps";
import StackFrame from "stackframe";

export function createStackFrameData(stack: string) {
  const stackFrameData: Array<{
    file: string;
    line: number;
    column: number;
    functionName: string;
  }> = [];

  const isNextJs = "next" in window;
  const isChrome = window.navigator.userAgent.includes("Chrome");

  if (isNextJs) {
    processNextJsStack(stack, stackFrameData);
  } else if (isChrome) {
    processChromeStack(stack, stackFrameData);
  }

  return stackFrameData;
}

function processNextJsStack(stack: string, stackFrameData: Array<any>) {
  const callSites = filterCallSites(stack, [
    "node_modules",
    "createSetterDebugEntry",
    "createGetterDebugEntry",
    "impact-react",
    "webpack.js",
    "chrome-extension://",
    "(<anonymous>)",
  ]);

  for (const callSite of callSites) {
    try {
      const { functionName, file, line, column } =
        parseNextJsCallSite(callSite);
      stackFrameData.push({ file, line, column, functionName });
    } catch (error) {
      console.log(error);
    }
  }
}

function processChromeStack(stack: string, stackFrameData: Array<any>) {
  const callSites = filterCallSites(
    stack,
    [
      "node_modules",
      "createSetterDebugEntry",
      "createGetterDebugEntry",
      "impact-app",
      "@fs",
    ],
    true,
  );

  for (const callSite of callSites) {
    try {
      const { functionName, file, line, column } =
        parseChromeCallSite(callSite);
      stackFrameData.push({ file, line, column, functionName });
    } catch (error) {
      console.log(error);
    }
  }
}

function filterCallSites(
  stack: string,
  excludePatterns: string[],
  includeOrigin = false,
) {
  return stack
    .split("\n")
    .slice(1)
    .filter((line) => {
      const shouldExclude = excludePatterns.some((pattern) =>
        line.includes(pattern),
      );
      const includesOrigin = includeOrigin
        ? line.includes(window.location.origin)
        : true;
      return !shouldExclude && includesOrigin;
    });
}

function parseNextJsCallSite(callSite: string) {
  let functionName = callSite.match(/.*at (.*)?\(/)?.[1]?.trim() ?? "ANONYMOUS";
  functionName = functionName.replace(" (webpack-internal:///", "");

  let file = callSite.substring(
    callSite.indexOf("webpack-internal:///(app-pages-browser)/"),
  );

  file = file.substring(0, file.length - 1);

  const parts = file.split(":");

  const column = Number(parts.pop());
  const line = Number(parts.pop());

  file = parts.join(":");

  file = file.includes("?") ? file.substring(0, file.indexOf("?")) : file;

  return { file, line, column, functionName };
}

function parseChromeCallSite(callSite: string) {
  let functionName = callSite.match(/.*at (.*)?\(/)?.[1]?.trim() ?? "ANONYMOUS";
  functionName = functionName.split(".").pop()!;

  let file = callSite.substring(callSite.indexOf(location.origin));

  file = file.substring(0, file.length - 1);

  const parts = file.split(":");

  const column = Number(parts.pop());
  const line = Number(parts.pop());

  file = parts.join(":");

  file = file.includes("?") ? file.substring(0, file.indexOf("?")) : file;

  return { functionName, file, line, column };
}

export function createSourceMappedStackFrame(
  file: string,
  functionName: string,
  line: number,
  column: number,
): Promise<StackFrame> {
  // @ts-expect-error
  if (window.next) {
    const nextjsStackFrameUrl = `__nextjs_original-stack-frame?file=${encodeURIComponent(
      file,
    )}&methodName=${functionName}&lineNumber=${line}&column=${column}`;

    return fetch(nextjsStackFrameUrl).then(async (response) => {
      const payload = await response.json();

      return {
        fileName: payload.originalStackFrame.file,
        functionName: payload.originalStackFrame.methodName,
        lineNumber: payload.originalStackFrame.lineNumber,
        columnNumber: payload.originalStackFrame.column,
      } as StackFrame;
    });
  } else {
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
}

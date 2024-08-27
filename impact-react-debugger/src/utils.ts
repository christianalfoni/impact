export function cleanFilePath(stackFrame: StackFrame | null) {
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

export function cleanFunctionName(functionName?: string) {
  if (!functionName) {
    return "ANONYMOUS";
  }

  // Remove "[as current]" etc.
  functionName = functionName.replace(/\s\[.*\]/, "");

  // Only return last part, as getters has a "get " in front
  return functionName.split(" ").pop()!;
}

export function createDebugId() {
  return Math.random().toString(36).substring(2, 15);
}

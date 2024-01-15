export function isObject(value: unknown) {
  return typeof value === "object" && !Array.isArray(value) && value !== null;
}

export function isArray(value: unknown) {
  return Array.isArray(value);
}

export function isBoolean(value: unknown) {
  return typeof value === "boolean";
}

export function isString(value: unknown) {
  return typeof value === "string";
}

export function isNumber(value: unknown) {
  return typeof value === "number";
}

export function isNull(value: unknown) {
  return value === null;
}

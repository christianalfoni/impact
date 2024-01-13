export const isValidJson = (payload) => {
    try {
        // eslint-disable-next-line
        JSON.stringify(eval(`(function () { return ${payload} })()`));
        return true;
    }
    catch (e) {
        return false;
    }
};
export function isObject(value) {
    return typeof value === "object" && !Array.isArray(value) && value !== null;
}
export function isArray(value) {
    return Array.isArray(value);
}
export function isBoolean(value) {
    return typeof value === "boolean";
}
export function isString(value) {
    return typeof value === "string";
}
export function isNumber(value) {
    return typeof value === "number";
}
export function isNull(value) {
    return value === null;
}
//# sourceMappingURL=utils.js.map
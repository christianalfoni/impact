import decamelize from "decamelize";
let nextCssClassId = 0;
export const styleTag = document.createElement("style");
styleTag.innerHTML = `
.impact-debugger-tooltip {
  position: relative;
}
.impact-debugger-tooltip > *:first-child {
  display: none;
}
.impact-debugger-tooltip:hover > *:first-child {
  display: block;
}
`;
export function css(style) {
    const className = `impact-debugger-${nextCssClassId++}`;
    const string = Object.keys(style).reduce((aggr, key) => aggr + ` ${decamelize(key, { separator: "-" })}:${style[key]};\n`, "");
    styleTag.innerHTML += `.${className} {
${string}}`;
    return className;
}
export const colors = {
    purple: "rgb(192 132 252)",
    yellow: "rgb(250 204 21)",
    green: "rgb(163 230 53)",
    blue: "rgb(96 165 250)",
    red: "rgb(248 113 113)",
    // activityBar-background
    foreground: "hsl(206, 57%, 17%)",
    // editor-background
    background: "hsl(206, 57%, 13%)",
    // dropdown-border
    border: "hsl(206, 57%, 16%)",
    // editor-foreground
    text: "rgb(107, 114, 128)",
    // focusForeground
    highlight: "rgb(17, 24, 39)",
};
export const wrapper = css({
    paddingTop: "1rem",
    paddingBottom: "3rem",
    backgroundColor: "white",
    fontFamily: `Inter var, ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"`,
    fontFeatureSettings: `"cv02", "cv03", "cv04", "cv11"`,
    webkitFontSmoothing: "antialiased",
    boxShadow: "rgb(255, 255, 255) 0px 0px 0px 0px, rgba(15, 23, 42, 0.1) 0px 0px 0px 1px, rgba(0, 0, 0, 0) 0px 0px 0px 0px",
    borderBottomLeftRadius: "0.5rem",
});
export const innerWrapper = css({
    paddingLeft: "1.5rem",
    paddingRight: "1.5rem",
    width: "28rem",
    marginLeft: "auto",
    marginRight: "auto",
});
export const flowRoot = css({ display: "flow-root" });
export const list = css({
    marginBottom: "-2rem",
    listStyle: "none",
    margin: 0,
    padding: 0,
});
export const itemWrapper = css({
    paddingBottom: "2rem",
    position: "relative",
});
export const line = css({
    backgroundColor: "rgb(229 231 235)",
    width: "0.125rem",
    height: "100%",
    marginLeft: "-1px",
    top: "1rem",
    left: "1rem",
    position: "absolute",
});
export const itemContentWrapper = css({
    display: "flex",
    position: "relative",
});
export const circle = css({
    boxShadow: "rgb(255, 255, 255) 0px 0px 0px 0px, rgb(255, 255, 255) 0px 0px 0px 8px, rgba(0, 0, 0, 0) 0px 0px 0px 0px",
    backgroundColor: colors.yellow,
    borderRadius: "9999px",
    justifyContent: "center",
    alignItems: "center",
    width: "2rem",
    height: "2rem",
    display: "flex",
    color: "white",
});
export const itemContent = css({
    paddingTop: "0.375rem",
    justifyContent: "space-between",
    marginLeft: "12px",
    marginRight: 0,
    flex: "1 1 0%",
    minWidth: 0,
    display: "flex",
});
export const itemTextContent = css({
    color: colors.text,
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
});
export const itemLink = css({
    color: colors.highlight,
    fontWeight: "500",
    textDecoration: "none",
});
export const itemValue = css({
    position: "relative",
    boxShadow: "rgb(255, 255, 255) 0px 0px 0px 0px inset, rgb(229, 231, 235) 0px 0px 0px 1px inset, rgba(0, 0, 0, 0) 0px 0px 0px 0px",
    fontWeight: "500",
    fontSize: "0.75rem",
    lineHeight: "1rem",
    paddingTop: "0.25rem",
    paddingBottom: "0.25rem",
    paddingLeft: "0.5rem",
    paddingRight: "0.5rem",
    borderRadius: "15px",
    alignItems: "center",
    display: "inline-flex",
});
/**
 * INSPECTOR
 */
export const inspectorWrapper = css({
    fontFamily: "'Source Code Pro', monospace",
    fontSize: 16,
    lineHeight: "24px",
    color: colors.highlight,
});
export const smallWrapper = css({
    fontFamily: "'Source Code Pro', monospace",
    fontSize: 12,
    lineHeight: "16px",
});
export const key = css({
    marginRight: 5,
    color: colors.text,
    cursor: "pointer",
    /*
    ":hover": {
      opacity: 0.75,
    },
    */
});
export const toolIcon = css({
    margin: "0 0.75rem",
});
export const inlineNested = css({
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
});
export const bracket = (pointer) => css({
    display: "flex",
    alignItems: "center",
    cursor: pointer ? "pointer" : "default",
});
export const stringValue = css({
    display: "flex",
    alignItems: "center",
    color: colors.yellow,
});
export const otherValue = css({
    display: "flex",
    alignItems: "center",
    color: colors.purple,
});
export const inlineClass = css({
    color: colors.purple,
    marginRight: "0.5rem",
});
export const genericValue = css({
    display: "flex",
    alignItems: "center",
    color: colors.blue,
});
export const nestedChildren = css({
    paddingLeft: "1rem",
});
export const keyCount = css({
    fontsize: 14,
    color: colors.highlight,
});
export const editValueWrapper = css({
    position: "relative",
});
export const editValuePopup = css({
    position: "absolute",
    width: 400,
    height: 100,
    top: 0,
    left: 0,
    boxShadow: "0px 10px 13px 0px rgba(0,0,0,0.1)",
});
export const newState = css({
    fontFamily: "inherit",
    fontSize: 16,
    border: "2px solid transparent",
    backgroundColor: colors.text,
    color: colors.foreground,
    outline: "none",
    borderRadius: 3,
    width: "100%",
    height: "100%",
    boxSizing: "border-box",
});
export const ok = css({
    position: "absolute",
    cursor: "pointer",
    top: 0,
    right: 0,
    fontSize: 10,
    border: 0,
    outline: "none",
    padding: "0.25rem 0.5rem",
    opacity: 0.5,
    color: colors.background,
});
export const tooltip = css({
    backgroundColor: colors.highlight,
    position: "absolute",
    color: colors.text,
    top: "-2rem",
    right: "-2rem",
    paddingLeft: "0.5rem",
    paddingRight: "0.5rem",
    paddingTop: "0.25rem",
    paddingBottom: "0.25rem",
    borderRadius: "9999px",
    display: "block",
    whiteSpace: "nowrap",
});
export const workspaceWrapper = css({
    padding: "2rem",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
});
export const workspaceInnerWrapper = css({
    maxWidth: "20rem",
    width: "100%",
    marginLeft: "auto",
    marginRight: "auto",
});
export const workspaceLabel = css({
    color: colors.highlight,
    lineHeight: "1.5rem",
    fontWeight: "500",
    fontSize: "0.875rem",
    display: "block",
    marginBottom: "0.5rem",
});
export const workspaceInput = css({
    paddingTop: "0.375rem",
    paddingBottom: "0.375rem",
    borderWidth: "0",
    borderRadius: "0.375rem",
    width: "100%",
    paddingLeft: "0.75rem",
    paddingRight: "0.75rem",
    display: "block",
    color: colors.text,
    fontSize: "1rem",
    lineHeight: "1.5rem",
    boxShadow: "rgb(255, 255, 255) 0px 0px 0px 0px inset, rgb(209, 213, 219) 0px 0px 0px 1px inset, rgba(0, 0, 0, 0.05) 0px 1px 2px 0px",
});
//# sourceMappingURL=styles.js.map
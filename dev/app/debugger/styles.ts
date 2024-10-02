import { CSSProperties } from "react";

export const palette = {
  // Backgrounds
  0: "#111110",
  1: "#191918",

  // Interactive components
  3: "#222221",
  4: "#2A2A28",
  5: "#31312E",

  // Borders and separators
  6: "#3B3A37",
  7: "#494844",
  8: "#62605B",

  // Solid colors
  9: "#6F6D66",
  10: "#7C7B74",

  // Accessible text
  11: "#B5B3AD",
  12: "#EEEEEC",
};
export const css = (style: CSSProperties) => style;

export const colors = Object.entries(palette).reduce(
  (acc, [key, color]) => {
    // @ts-ignore
    acc[key] = css({ color });

    return acc;
  },
  {} as Record<keyof typeof palette, CSSProperties>,
);

export const inspector = {
  inspectorWrapper: css({
    fontFamily: "'Source Code Pro', monospace",
    fontSize: 12,
    lineHeight: "24px",
    color: palette[9],
  }),
  smallWrapper: css({
    fontFamily: "'Source Code Pro', monospace",
    fontSize: 12,
    lineHeight: "16px",
  }),
  key: css({
    marginRight: 5,
    color: palette[9],
    cursor: "pointer",
  }),
  inlineNested: css({
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
  }),
  bracket: (pointer: boolean) =>
    css({
      display: "flex",
      alignItems: "center",
      cursor: pointer ? "pointer" : "default",
    }),
  stringValue: css({
    display: "flex",
    alignItems: "center",
    color: palette[12],
  }),
  otherValue: css({
    display: "flex",
    alignItems: "center",
    color: palette[9],
  }),
  inlineClass: css({
    color: palette[9],
    marginRight: "0.5em",
  }),
  genericValue: css({
    display: "flex",
    alignItems: "center",
    color: palette[9],
  }),
  nestedChildren: css({
    paddingLeft: "1em",
  }),
  keyCount: css({
    fontSize: 14,
    color: palette[9],
  }),
};

export const path = css({
  overflow: "hidden",
  whiteSpace: "nowrap",
  textOverflow: "ellipsis",
  color: palette[7],
  cursor: "pointer",
});

import { CSSProperties } from "preact/compat";

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

export const impactBoundary = css({
  all: "unset",
  fontFamily: "monospace",
  fontSize: 12,
});

export const impactButton = css({
  position: "absolute",
  right: 10,
  top: 10,
  height: 26,
  width: 26,
  background: palette[1],
  border: `1px solid ${palette[3]}`,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  boxShadow:
    "0px 36px 67px rgba(0, 0, 0, 0.3), 0px 15.0399px 32.7193px rgba(0, 0, 0, 0.215656), 0px 8.04107px 19.4751px rgba(0, 0, 0, 0.178832), 0px 4.50776px 11.7861px rgba(0, 0, 0, 0.15), 0px 2.39404px 6.68816px rgba(0, 0, 0, 0.121168), 0px 0.996212px 2.97177px rgba(0, 0, 0, 0.0843437)",
  borderRadius: "4px",
  cursor: "pointer",
});

export const body = css({
  boxSizing: "border-box",
  position: "absolute",
  width: 300,
  height: 460,
  right: 10,
  top: 10,

  padding: "16px",
  display: "flex",
  flexDirection: "column",

  background: palette[1],
  border: `1px solid ${palette[3]}`,

  boxShadow:
    "0px 36px 67px rgba(0, 0, 0, 0.3), 0px 15.0399px 32.7193px rgba(0, 0, 0, 0.215656), 0px 8.04107px 19.4751px rgba(0, 0, 0, 0.178832), 0px 4.50776px 11.7861px rgba(0, 0, 0, 0.15), 0px 2.39404px 6.68816px rgba(0, 0, 0, 0.121168), 0px 0.996212px 2.97177px rgba(0, 0, 0, 0.0843437)",
  borderRadius: "16px 4px 16px 16px",

  backgroundImage: `radial-gradient(${palette[4]} 1px, transparent 0)`,
  backgroundSize: "20px 20px",
});

export const header = css({
  display: "flex",
  gap: ".5em",
  whiteSpace: "nowrap",
  justifyContent: "space-between",
  marginBottom: "1em",
});

export const workspace = css({
  all: "unset",
  color: palette[7],
  width: 100,
});

export const list = {
  container: css({
    display: "flex",
    flexDirection: "column",
    gap: "1.2em",
    overflowY: "auto",
  }),
  startTimeline: css({
    display: "flex",
    flexDirection: "column",
    gap: 4,
  }),
  startTimelineItem: css({
    width: 3,
    height: 6,
    borderRadius: 2,
  }),
  header: css({
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    color: palette[12],
    gap: "1em",
  }),
  headerText: css({
    display: "flex",
    alignItems: "center",
    gap: "1em",
    minWidth: 0,
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
  }),
  headerLine: css({
    minWidth: 3,
    height: 22,
    background: palette[12],
    display: "block",
    boxShadow: "0 0 5px 1px rgb(255 255 255 / 0.4)",
    borderRadius: 2,
  }),
  contentLine: css({
    width: 3,
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    background: palette[7],
    display: "block",
    borderRadius: 2,
  }),
  contentItem: css({
    display: "flex",
    alignItems: "center",
    gap: "1em",
    color: palette[9],
    padding: ".4em 0 .4em 1.3em",
  }),
};

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
    color: palette[11],
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
    fontsize: 14,
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

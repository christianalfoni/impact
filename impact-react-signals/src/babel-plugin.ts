import { transform } from "@impact-react/babel-transform";

export default function createPlugin(): [
  typeof transform,
  Record<string, any>,
] {
  return [transform, { packageName: "@impact-react/legend" }];
}

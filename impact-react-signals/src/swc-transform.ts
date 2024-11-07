export default function createTransformer(): [string, Record<string, any>] {
  return [
    "@impact-react/swc-transform",
    { package_name: "@impact-react/signals" },
  ];
}

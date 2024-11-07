export default function createPlugin(): [string, Record<string, any>] {
  return [
    "@impact-react/swc-transform",
    { package_name: "@impact-react/mobx" },
  ];
}

# Getting Started

```bash
npm install impact-app
```

```bash
yarn add impact-app
```

## Configuration

**Impact** depends on [decorators](https://www.typescriptlang.org/docs/handbook/decorators.html) and [explicit resource management](https://github.com/tc39/proposal-explicit-resource-management). This requires some configuration of the project, but improves the developer experience.

<img align="center" src="https://github.com/christianalfoni/signalit/assets/3956929/5c4a8b43-27a2-4553-a710-146d94fbc612" width="25"/> **TypeScript 5.2**
```json
{
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true
}
```


<img align="center" src="https://github.com/christianalfoni/signalit/assets/3956929/eb74b1ea-0ff1-4d18-9ba5-97150408ae86" width="25"/> **Babel**
```bash
npm install babel-plugin-transform-typescript-metadata @babel/plugin-proposal-decorators @babel/plugin-proposal-explicit-resource-management @babel/plugin-transform-class-properties --dev
```
```bash
yarn add babel-plugin-transform-typescript-metadata @babel/plugin-proposal-decorators @babel/plugin-proposal-explicit-resource-management @babel/plugin-transform-class-properties -D
```

```json
{
    "plugins": [
        "babel-plugin-transform-typescript-metadata",
        ["@babel/plugin-proposal-decorators", { legacy: true }],
        "@babel/plugin-transform-class-properties",
        "@babel/plugin-proposal-explicit-resource-management"
    ]
}
```


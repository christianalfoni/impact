# Getting Started

<img align="center" src="https://github.com/christianalfoni/signalit/assets/3956929/11ee4851-4ebf-474f-a2d3-3b65ebf856a1" width="25" /> [Open template on CodeSandbox](https://codesandbox.io/p/sandbox/impact-vite-template-whz9qh) to use as starting point or

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
yarn add babel-plugin-transform-typescript-metadata @babel/plugin-proposal-decorators @babel/plugin-proposal-explicit-resource-management @babel/plugin-transform-class-properties -D
```

```json
{
    "plugins": [
        "babel-plugin-transform-typescript-metadata",
        ["@babel/plugin-proposal-decorators", { "legacy": true }],
        "@babel/plugin-transform-class-properties",
        "@babel/plugin-proposal-explicit-resource-management"
    ]
}
```

## Debug with VSCode

Make sure your project has a `.vscode/launch.json` file with the following contents:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "msedge",
      "request": "launch",
      "name": "Dev",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}"
    }
  ]
}
```

-  Make sure you have the [Edge](https://www.microsoft.com/en-us/edge?form=MA13FJ&exp=e00) browser installed (It is Chromium, so works just like Chrome)
- Start your dev server
- Use the Debug tool in VSCode and start it, this opens up Edge
- The first time Edge will ask you to set the the workspace folder. Navigate to the project folder on your computer and select it

**NOTE!** If it is not working and you are taken to the source tab, refresh the app
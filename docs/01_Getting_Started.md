# Getting Started

`npm install impact-app reflect-metadata`

## Configuration

**tsconfig.json**
```json
{
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
}
```


**.babelrc**
`npm install babel-plugin-transform-typescript-metadata @babel/plugin-proposal-decorators @babel/plugin-proposal-class-properties --dev`

```json
{
    plugins: [
        "babel-plugin-transform-typescript-metadata",
        ["@babel/plugin-proposal-decorators", { "legacy": true }],
        ["@babel/plugin-proposal-class-properties", { "loose": true }],
    ]
}
```

## Reflect Metadata

You will have to import the `reflect-metadata` package in your main entry point, before resolving any dependencies:

```ts
import 'reflect-metadata'
```


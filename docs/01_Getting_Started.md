# Getting Started

`npm install impact-app`

## Configuration

**tsconfig.json**
```json
{
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
}
```


**babel**
`npm install babel-plugin-transform-typescript-metadata @babel/plugin-proposal-decorators --dev`

```json
{
    plugins: [
        "babel-plugin-transform-typescript-metadata",
        ["@babel/plugin-proposal-decorators", { "legacy": true }]
    ]
}
```


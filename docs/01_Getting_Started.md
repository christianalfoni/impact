# Getting Started

## From template

<img align="center" src="https://github.com/christianalfoni/signalit/assets/3956929/11ee4851-4ebf-474f-a2d3-3b65ebf856a1" width="25" /> [Open template on CodeSandbox](https://codesandbox.io/p/sandbox/impact-vite-template-whz9qh). You can fork and continue playing around there or download as zip to get started.

## Install

```bash
yarn add impact-app
```

## Configuration

<img align="center" src="https://github.com/christianalfoni/signalit/assets/3956929/5c4a8b43-27a2-4553-a710-146d94fbc612" width="25"/> **TypeScript 5.2**

Note that [ESLint](https://eslint.org/) and [Prettier](https://prettier.io/) also needs to be updated to latest versions to support this version of TypeScript.

<br />

<img align="center" src="https://github.com/christianalfoni/signalit/assets/3956929/eb74b1ea-0ff1-4d18-9ba5-97150408ae86" width="25"/> **Babel**

```bash
yarn add @babel/plugin-proposal-explicit-resource-management -D
```

```json
{
    "plugins": [
        "@babel/plugin-proposal-explicit-resource-management"
    ]
}
```

This is a **Stage 3** proposal and is coming to JavaScript.


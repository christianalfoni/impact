# Debugger

Impact has its own signals debugger as a separate package.

```sh
npm install impact-debugger
```

Dynamically load it for development:

```ts
if (process.env.NODE_ENV === 'development') {
    import('impact-debugger')
}
```

Follow the instructions in the console.
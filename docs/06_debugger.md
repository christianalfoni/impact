# Debugger

Impact has its own signals debugger as a separate package.

```sh
npm install impact-debugger
```

Dynamically load it for development, for example:

```ts
if (process.env.NODE_ENV === 'development') {
    import('impact-debugger')
}
```

## FAQ

### What does it do?
The debugger tracks *getters* and *setters* on signals related to observer contexts. It does this using source maps. That means the debugger can give you exact information on where signals change and what observing code is affected by it. With the source maps it knows the exact file and line of code.

### How do I start it?
A console message notifies when the debugger is loaded and you can use a quick double press on **SHIFT** to activate it. A small indicator in the top right highlights when signals trigger and by clicking it you open the timeline, and configuration.

### Can I open files directly in my editor?
Yes, you can. If you are using [VSCode](https://code.visualstudio.com) you can select the root of your workspace, right click and **copy path**. Paste this path in the debugger and the links will now open files in VSCode directly from the debugger.

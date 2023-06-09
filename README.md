# @codesandbox/impact

> Bridging object oriented code with React.

## Background

At [CodeSandbox](https://codesandbox.io) we write most of our code in an object oriented paradigm. This includes projects like **pitcher**, **VSCode extension**, **@codesandbox/pitcher-client** and **@codesandbox/api**. To make it easier for us to move between these projects, reuse existing tools and practices and work more effeciently, we use Impact to bridge the gap between this paradigm and Reacts paradigm.

## For what kinds of apps?

This tool is designed for rich single page applications. These applications has a high degree of client side managed state, where most state is considered "global" to the application. The library is even more ideal if the team/company uses an object oriented paradigm already or wants Mobx/Mobx-State-Tree kind of solution, but stick to plain classes and built in dependency injection.

## Documentation

[Getting Started](./docs/01_Getting_Started.md)
[Hello World](./docs/02_Hello_World.md)
[Reactivity](./docs/03_Reactivity.md)
[Promises](./docs/04_Promises.md)

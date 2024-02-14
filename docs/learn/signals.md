---
layout: playground
code: |
    import { globalStore } from 'impact-react'
prev: /
next: /signals
---

# Signals

The `globalStore` is an abstraction over lower level primitives of **Impact**. Under the hood our `count` is actually a [signal](../api#signal). **Impact** exposes these higher level abstractions as some applications are simple and does not need the level of granularity that **Impact** provides to more complex applications. As you move through this tutorial you will learn about these lower level abstractions, and how to use them in more complex applications.
# Deriving UI

**Impact** is the functionality of your application. It does not matter what UI you build in front of it, all of them should be able to use the same functionality out of the box. That means the only state management you do in React is strictly related to the layout of the user interface.

That includes:

- Navigation / Routing
- Tabs
- Collapse / Expand
- Animations
- Transitions
- Drag and Drop

Input values are not considered React state. So things like forms, search inputs etc. is considered functionality. They are likely tied to validation and data and should be controlled by **Impact**.

Modals is just a way to display functionality. React chooses to use a modal based on state from **Impact**. That means **Impact** does not have any explicit concept of modals. A modal could be shown related to editing an item, or by returning confirmation from a method.

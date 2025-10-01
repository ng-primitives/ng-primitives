---
name: 'Focus Visible'
---

# Focus Visible

Determine whether focus should be visible based on user interaction. This is useful for accessibility and user experience, as it allows you to provide visual feedback when an element is focused using keyboard navigation, while not showing the focus outline when the user is using a mouse or touch device.

<docs-example name="focus-visible"></docs-example>

## Import

Import the Focus Visible primitives from `ng-primitives/interactions`.

```ts
import { NgpFocusVisible } from 'ng-primitives/interactions';
```

## Usage

Assemble the focus-visible directives in your template.

```html
<div (ngpFocusVisible)="onFocusVisible($event)"></div>
```

## API Reference

The following directives are available to import from the `ng-primitives/interactions` package:

### NgpFocusVisible

<api-docs name="NgpFocusVisible"></api-docs>

#### Data Attributes

The following data attributes are applied to the `ngpFocusVisible` directive:

| Attribute            | Description                                                  |
| -------------------- | ------------------------------------------------------------ |
| `data-focus-visible` | Applied when the element is focused via keyboard navigation. |

### Disabling Focus Visible Interaction

Many primitives automatically add focus handling to components. If you want to disable focus handling, either globally or on a per-component/per-directive basis, you can do so by registering the `provideInteractionConfig` provider and setting the `focusVisible` option to `false`.

```ts
import { provideInteractionConfig } from 'ng-primitives/interactions';

providers: [
  provideInteractionConfig({
    focusVisible: false,
  }),
],
```

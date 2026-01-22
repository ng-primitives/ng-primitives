---
name: 'Focus Visible'
sourceUrl: 'https://github.com/ng-primitives/ng-primitives/tree/next/packages/ng-primitives/interactions/src/focus-visible'
---

# Focus Visible

Determine whether an element should display a visible focus indicator and exposes the origin of that focus (keyboard, mouse, touch, program).
This is useful for accessibility and user experience, as it allows you to provides accessible visual feedback aligned with the `:focus-visible` standard.

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

| Attribute            | Description                                                        | Value                                   |
| -------------------- | ------------------------------------------------------------------ | --------------------------------------- |
| `data-focus-visible` | Applied when the element should display a visible focus indicator. | `keyboard \| mouse \| touch \| program` |

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

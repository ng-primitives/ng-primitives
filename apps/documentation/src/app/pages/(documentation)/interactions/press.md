---
name: 'Press'
---

# Press

Normalizes the press event across different browsers and devices.

<docs-example name="press"></docs-example>

## Import

Import the Press primitives from `ng-primitives/interactions`.

```ts
import { NgpPress } from 'ng-primitives/interactions';
```

## Usage

Assemble the press directives in your template.

```html
<div
  ngpPress
  (ngpPressStart)="onPressStart()"
  (ngpPressEnd)="onPressEnd()"
  (ngpPressChange)="onPressChange($event)"
></div>
```

## API Reference

The following directives are available to import from the `ng-primitives/interactions` package:

### NgpPress

<api-docs name="NgpPress"></api-docs>

#### Data Attributes

| Attribute    | Description                                |
| ------------ | ------------------------------------------ |
| `data-press` | Applied when the element is being pressed. |

### Disabling Press Interaction

Many primitives automatically add press handling to components. If you want to disable press handling, either globally or on a per-component/per-directive basis, you can do so by registering the `provideInteractionConfig` provider and setting the `press` option to `false`.

```ts
import { provideInteractionConfig } from 'ng-primitives/interactions';

providers: [
  provideInteractionConfig({
    press: false,
  }),
],
```

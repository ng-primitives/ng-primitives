---
name: 'Focus'
---

# Focus

Normalizes the focus event across different browsers and devices.

<docs-example name="focus"></docs-example>

## Import

Import the Focus primitives from `ng-primitives/interactions`.

```ts
import { NgpFocus } from 'ng-primitives/interactions';
```

## Usage

Assemble the focus directives in your template.

```html
<div (ngpFocus)="onFocusChange($event)"></div>
```

## API Reference

The following directives are available to import from the `ng-primitives/interactions` package:

### NgpFocus

<api-docs name="NgpFocus"></api-docs>

#### Data Attributes

The following data attributes are applied to the `ngpFocus` directive:

| Attribute    | Description                          |
| ------------ | ------------------------------------ |
| `data-focus` | Applied when the element is focused. |

### Disabling Focus Interaction

Many primitives automatically add focus handling to components. If you want to disable focus handling, either globally or on a per-component/per-directive basis, you can do so by registering the `provideInteractionConfig` provider and setting the `focus` option to `false`.

```ts
import { provideInteractionConfig } from 'ng-primitives/interactions';

providers: [
  provideInteractionConfig({
    focus: false,
  }),
],
```

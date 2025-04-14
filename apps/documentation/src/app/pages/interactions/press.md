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

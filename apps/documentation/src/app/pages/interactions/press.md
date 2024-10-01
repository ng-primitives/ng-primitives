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

The `ngpPress` directive listens for press events on an element. This is particularly useful for supporting press events on touch devices, where press events are not handled consistently.

- Selector: `[ngpPress]`
- Exported As: `ngpPress`

<response-field name="ngpPress" type="EventEmitter<boolean>">
  Event emitted when the press state changes.
</response-field>

<response-field name="ngpPressDisabled" type="boolean" default="false">
  Whether press events are disabled.
</response-field>

<response-field name="ngpPressStart" type="EventEmitter<void>">
  Event emitted when the press starts.
</response-field>

<response-field name="ngpPressEnd" type="EventEmitter<void>">
  Event emitted when the press ends.
</response-field>

#### Data Attributes

| Attribute    | Description                                |
| ------------ | ------------------------------------------ |
| `data-press` | Applied when the element is being pressed. |

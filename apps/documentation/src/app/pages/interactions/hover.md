---
name: 'Hover'
---

# Hover

Normalizes the hover event across different browsers and devices.

<docs-example name="hover"></docs-example>

## Import

Import the Hover primitive from `ng-primitives/interactions`.

```ts
import { NgpHover } from 'ng-primitives/interactions';
```

## Usage

Assemble the hover directives in your template.

```html
<div
  (ngpHover)="onHoverChange($event)"
  (ngpHoverStart)="onHoverStart()"
  (ngpHoverEnd)="onHoverEnd()"
></div>
```

## API Reference

The following directives are available to import from the `ng-primitives/interactions` package:

### NgpHover

- Selector: `[ngpHover]`
- Exported As: `ngpHover`

Apply the `ngpHover` directive to an element that you want to listen for hover events. This is particulaly useful for supporting hover events on touch devices, where hover events are not handled consistently. On iOS relying on the `:hover` pseudo-class can result in the hover state being stuck until the user taps elsewhere on the screen.

<response-field name="ngpHover" type="EventEmitter<boolean>">
  Event emitted when the hover state changes.
</response-field>

<response-field name="ngpHoverStart" type="EventEmitter<void>">
  Event emitted when the hover starts.
</response-field>

<response-field name="ngpHoverEnd" type="EventEmitter<void>">
  Event emitted when the hover ends.
</response-field>

<response-field name="ngpHoverDisabled" type="boolean" default="false">
  Whether hover events are disabled.
</response-field>

#### Data Attributes

| Attribute    | Description                                |
| ------------ | ------------------------------------------ |
| `data-hover` | Added to the element when hovering occurs. |

---
title: 'Button'
---

# Button

A button is a clickable element that can be used to trigger an action.

<docs-example name="button"></docs-example>

## Import

Import the Button primitives from `ng-primitives/button`.

```ts
import { NgpButton } from 'ng-primitives/button';
```

## Usage

Assemble the button directives in your template.

```html
<button ngpButton (ngpButtonPress)="onPress()">Button</button>
```

## API Reference

The following directives are available to import from the `ng-primitives/button` package:

### NgpButton

A directive that can be used to create a button.

- Selector: `[ngpButton]`
- Exported As: `ngpButton`

<response-field name="ngpButtonDisabled" type="boolean">
  A boolean value that determines if the button is disabled.
</response-field>

<response-field name="ngpPress" type="EventEmitter<boolean>">
  Event emitted when the press state changes.
</response-field>

<response-field name="ngpPressStart" type="EventEmitter<void>">
  Event emitted when the press starts.
</response-field>

<response-field name="ngpPressEnd" type="EventEmitter<void>">
  Event emitted when the press ends.
</response-field>

<response-field name="ngpFocusVisible" type="EventEmitter<boolean>">
  Event emitted when the focus visible state changes.
</response-field>

<response-field name="ngpHover" type="EventEmitter<boolean>">
  Event emitted when the hover state changes.
</response-field>

<response-field name="ngpHoverStart" type="EventEmitter<void>">
  Event emitted when the hover starts.
</response-field>

<response-field name="ngpHoverEnd" type="EventEmitter<void>">
  Event emitted when the hover ends.
</response-field>

#### Data Attributes

| Attribute            | Description                       | Value             |
| -------------------- | --------------------------------- | ----------------- |
| `data-hover`         | The hover state of the button.    | `true` \| `false` |
| `data-focus-visible` | The focus state of the button.    | `true` \| `false` |
| `data-press`         | The pressed state of the button.  | `true` \| `false` |
| `data-disabled`      | The disabled state of the button. | `true` \| `false` |

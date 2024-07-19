---
title: 'Switch'
---

# Switch

Perform state toggling.

<docs-example name="switch"></docs-example>

## Import

Import the Switch primitives from `ng-primitives/switch`.

```ts
import { NgpSwitch, NgpSwitchThumb } from 'ng-primitives/switch';
```

## Usage

Assemble the switch directives in your template.

```html
<button ngpSwitch [(ngpSwitchChecked)]="checked">
  <span ngpSwitchThumb></span>
</button>
```

## API Reference

The following directives are available to import from the `ng-primitives/switch` package:

### NgpSwitch

Apply the `ngpSwitch` directive to an element to manage the checked state.

- Selector: `[ngpSwitch]`
- Exported As: `ngpSwitch`

<response-field name="ngpSwitchChecked" type="boolean" default="false">
  Define the checked state.
</response-field>

<response-field name="ngpSwitchDisabled" type="boolean" default="false">
  Define the disabled state.
</response-field>

<response-field name="ngpSwitchCheckedChange" type="boolean">
  Event emitted when the state changes.
</response-field>

#### Data Attributes

The following data attributes are applied to the `ngpSwitch` directive:

| Attribute       | Description              | Value             |
| --------------- | ------------------------ | ----------------- |
| `data-checked`  | The state of the switch. | `true` \| `false` |
| `data-disabled` | The disabled state.      | `true` \| `false` |

### NgpSwitchThumb

Apply the `ngpSwitchThumb` directive to an element within a switch to represent the thumb.

- Selector: `[ngpSwitchThumb]`
- Exported As: `ngpSwitchThumb`

#### Data Attributes

The following data attributes are available to style the thumb:

| Attribute       | Description              | Value             |
| --------------- | ------------------------ | ----------------- |
| `data-checked`  | The state of the switch. | `true` \| `false` |
| `data-disabled` | The disabled state.      | `true` \| `false` |

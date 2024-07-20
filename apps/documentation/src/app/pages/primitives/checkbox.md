---
name: 'Checkbox'
---

# Checkbox

Perform state toggling.

<docs-example name="checkbox"></docs-example>

## Import

Import the Checkbox primitives from `ng-primitives/checkbox`.

```ts
import { NgpCheckbox, NgpCheckboxIndicator } from 'ng-primitives/checkbox';
```

## Usage

Assemble the checkbox directives in your template.

```html
<button ngpCheckbox [(ngpCheckboxChecked)]="checked">
  <ng-icon ngpCheckboxIndicator name="checkmark" />
</button>
```

## API Reference

The following directives are available to import from the `ng-primitives/checkbox` package:

### NgpCheckbox

Apply the `ngpCheckbox` directive to an element to that represents the checkbox, such as a `button`.

- Selector: `[ngpCheckbox]`
- Exported As: `ngpCheckbox`

<response-field name="ngpCheckboxChecked" type="boolean" default="false">
  Define the checked state.
</response-field>

<response-field name="ngpCheckboxIndeterminate" type="boolean" default="false">
  Define the interminate state.
</response-field>

<response-field name="ngpCheckboxDisabled" type="boolean" default="false">
  Define the disabled state.
</response-field>

<response-field name="ngpCheckboxCheckedChange" type="boolean">
  Event emitted when the state changes.
</response-field>

<response-field name="ngpCheckboxIndeterminateChange" type="boolean">
  Event emitted when the indeterminate state changes.
</response-field>

| Attribute            | Description                         | Value                                       |
| -------------------- | ----------------------------------- | ------------------------------------------- |
| `data-state`         | The state of the checkbox.          | `checked` \| `unchecked` \| `indeterminate` |
| `data-disabled`      | The disabled state of the checkbox. | `true` \| `false`                           |
| `data-hover`         | The hover state of the checkbox.    | `true` \| `false`                           |
| `data-focus-visible` | The focus state of the checkbox.    | `true` \| `false`                           |
| `data-press`         | The press state of the checkbox.    | `true` \| `false`                           |

### NgpCheckboxIndicator

Apply the `ngpCheckboxIndicator` directive to an element that represents the checkbox indicator (i.e. the checkmark).

- Selector: `[ngpCheckboxIndicator]`
- Exported As: `ngpCheckboxIndicator`

#### Data Attributes

The following data attributes are applied to the `ngpCheckboxIndicator` directive:

| Attribute            | Description                                | Value                                       |
| -------------------- | ------------------------------------------ | ------------------------------------------- |
| `data-state`         | The state of the checkbox.                 | `checked` \| `unchecked` \| `indeterminate` |
| `data-disabled`      | The disabled state of the checkbox.        | `true` \| `false`                           |
| `data-hover`         | The hover state of the checkbox indicator. | `true` \| `false`                           |
| `data-focus-visible` | The focus state of the checkbox indicator. | `true` \| `false`                           |
| `data-press`         | The press state of the checkbox indicator. | `true` \| `false`                           |

### NgpCheckboxInput

Apply the `ngpCheckboxInput` directive to an input element to bind the checkbox state.

- Selector: `[ngpCheckboxInput]`
- Exported As: `ngpCheckboxInput`

### NgpCheckboxLabel

Apply the `ngpCheckboxLabel` directive to an element that is a label for the checkbox.

- Selector: `[ngpCheckboxLabel]`
- Exported As: `ngpCheckboxLabel`

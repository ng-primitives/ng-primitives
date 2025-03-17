---
name: 'Checkbox'
---

# Checkbox

Perform state toggling.

<docs-example name="checkbox"></docs-example>

## Import

Import the Checkbox primitives from `ng-primitives/checkbox`.

```ts
import { NgpCheckbox } from 'ng-primitives/checkbox';
```

## Usage

Assemble the checkbox directives in your template.

```html
<span ngpCheckbox [(ngpCheckboxChecked)]="checked">
  <ng-icon name="checkmark" aria-hidden="true" />
</span>
```

## Reusable Component

Create a reusable component that uses the `NgpCheckbox` directive.

<docs-snippet name="checkbox"></docs-snippet>

## Schematics

Generate a checkbox component with the `NgpCheckbox` primitive preconfigured.

```bash npm
 ng g ng-primitives:checkbox
```

## Examples

Here are some additional examples of how to use the Checkbox primitives.

### Checkbox Form Field

The checkbox automatically integrates with the form field primitives.

<docs-example name="checkbox-form-field"></docs-example>

## API Reference

The following directives are available to import from the `ng-primitives/checkbox` package:

### NgpCheckbox

Apply the `ngpCheckbox` directive to an element to that represents the checkbox, such as a `button`.

- Selector: `[ngpCheckbox]`
- Exported As: `ngpCheckbox`
- Host Directives: [NgpFormControl](/primitives/form-field), [NgpHover](/interactions/hover), [NgpFocusVisible](/interactions/focus-visible), [NgpPress](/interactions/press)

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

| Attribute            | Description                                 |
| -------------------- | ------------------------------------------- |
| `data-checked`       | Applied when the checkbox is checked.       |
| `data-indeterminate` | Applied when the checkbox is indeterminate. |
| `data-disabled`      | Applied when the checkbox is disabled.      |
| `data-hover`         | Applied when the checkbox is hovered.       |
| `data-focus-visible` | Applied when the checkbox is focused.       |
| `data-press`         | Applied when the checkbox is pressed.       |

## Accessibility

Adheres to the [Tri-State Checkbox WAI-ARIA design pattern](https://www.w3.org/WAI/ARIA/apg/patterns/checkbox).

### Keyboard Interactions

- <kbd>Space</kbd> - Toggle the checked state.

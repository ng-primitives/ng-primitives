---
name: 'Number Field'
sourceUrl: 'https://github.com/ng-primitives/ng-primitives/tree/next/packages/ng-primitives/number-field'
---

# Number Field

A numeric input with increment and decrement buttons.

<docs-example name="number-field"></docs-example>

## Import

Import the Number Field primitives from `ng-primitives/number-field`.

```ts
import {
  NgpNumberField,
  NgpNumberFieldInput,
  NgpNumberFieldIncrement,
  NgpNumberFieldDecrement,
  NgpNumberFieldLabel,
  NgpNumberFieldGroup,
} from 'ng-primitives/number-field';
```

## Usage

Assemble the number field directives in your template.

```html
<div ngpNumberField>
  <label ngpNumberFieldLabel>Quantity</label>
  <div ngpNumberFieldGroup>
    <button ngpNumberFieldDecrement>−</button>
    <input ngpNumberFieldInput />
    <button ngpNumberFieldIncrement>+</button>
  </div>
</div>
```

## Reusable Component

<docs-snippet name="number-field"></docs-snippet>

## Schematics

Generate a reusable number field component using the Angular CLI.

```bash npm
ng g ng-primitives:primitive number-field
```

### Options

- `path`: The path at which to create the component file.
- `prefix`: The prefix to apply to the generated component selector.
- `component-suffix`: The suffix to apply to the generated component class name.
- `file-suffix`: The suffix to apply to the generated component file name. Defaults to `component`.
- `example-styles`: Whether to include example styles in the generated component file. Defaults to `true`.

## API Reference

The following directives are available to import from the `ng-primitives/number-field` package:

### NgpNumberField

The root directive that manages the number field state.

<api-docs name="NgpNumberField"></api-docs>

#### Data Attributes

| Attribute       | Description                                 | Value |
| --------------- | ------------------------------------------- | ----- |
| `data-disabled` | Applied when the number field is disabled.  | `-`   |
| `data-readonly` | Applied when the number field is readonly.  | `-`   |

### NgpNumberFieldLabel

Apply to a label element for the number field.

<api-docs name="NgpNumberFieldLabel"></api-docs>

### NgpNumberFieldGroup

A container for the input and buttons. Sets `role="group"`.

<api-docs name="NgpNumberFieldGroup"></api-docs>

### NgpNumberFieldInput

Apply to an `input` element within the number field.

<api-docs name="NgpNumberFieldInput"></api-docs>

#### Data Attributes

| Attribute            | Description                                 | Value |
| -------------------- | ------------------------------------------- | ----- |
| `data-disabled`      | Applied when the number field is disabled.  | `-`   |
| `data-readonly`      | Applied when the number field is readonly.  | `-`   |
| `data-hover`         | Applied when the input is hovered.          | `-`   |
| `data-focus-visible`  | Applied when the input is focused.          | `-`   |

### NgpNumberFieldIncrement

Apply to a button that increments the value.

<api-docs name="NgpNumberFieldIncrement"></api-docs>

#### Data Attributes

| Attribute            | Description                                        | Value |
| -------------------- | -------------------------------------------------- | ----- |
| `data-disabled`      | Applied when incrementing is not possible.         | `-`   |
| `data-hover`         | Applied when the button is hovered.                | `-`   |
| `data-focus-visible`  | Applied when the button is focused.                | `-`   |
| `data-press`         | Applied when the button is pressed.                | `-`   |

### NgpNumberFieldDecrement

Apply to a button that decrements the value.

<api-docs name="NgpNumberFieldDecrement"></api-docs>

#### Data Attributes

| Attribute            | Description                                        | Value |
| -------------------- | -------------------------------------------------- | ----- |
| `data-disabled`      | Applied when decrementing is not possible.         | `-`   |
| `data-hover`         | Applied when the button is hovered.                | `-`   |
| `data-focus-visible`  | Applied when the button is focused.                | `-`   |
| `data-press`         | Applied when the button is pressed.                | `-`   |

## Features

### Press-and-Hold Auto-Repeat

Pressing and holding the increment or decrement button will repeatedly change the value. After a 400ms initial delay, the value changes every 60ms. Auto-repeat stops when the pointer is released or when the value reaches the min/max boundary.

### Input Validation

Invalid characters are rejected as you type. Only digits, a single decimal point, and a leading minus sign (when `min < 0`) are allowed. On blur, the value is clamped to the min/max range and snapped to the nearest step.

### Floating Point Precision

Stepping operations use precision-aware rounding to avoid floating point issues (e.g., `0.1 + 0.2` correctly produces `0.3`).

### Dynamic Input Mode

The `inputmode` attribute is set dynamically based on the configuration:

- `numeric` — when `min >= 0` and `step` is an integer
- `decimal` — when `min >= 0` and `step` has decimal places
- `text` — when negative values are allowed (some mobile keyboards cannot show both minus and decimal)

## Accessibility

Adheres to the [Spinbutton WAI-ARIA design pattern](https://www.w3.org/WAI/ARIA/apg/patterns/spinbutton/).

### Keyboard Interactions

- <kbd>Arrow Up</kbd>: Increase the value by the step.
- <kbd>Arrow Down</kbd>: Decrease the value by the step.
- <kbd>Shift</kbd> + <kbd>Arrow Up</kbd>: Increase the value by the large step.
- <kbd>Shift</kbd> + <kbd>Arrow Down</kbd>: Decrease the value by the large step.
- <kbd>Home</kbd>: Set the value to the minimum (if finite).
- <kbd>End</kbd>: Set the value to the maximum (if finite).
- <kbd>Enter</kbd>: Commit the typed value.

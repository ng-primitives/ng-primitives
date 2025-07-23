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

Generate a reusable checkbox component using the Angular CLI.

```bash npm
ng g ng-primitives:primitive checkbox
```

### Options

- `path`: The path at which to create the component file.
- `prefix`: The prefix to apply to the generated component selector.
- `componentSuffix`: The suffix to apply to the generated component class name.
- `fileSuffix`: The suffix to apply to the generated component file name. Defaults to `component`.
- `exampleStyles`: Whether to include example styles in the generated component file. Defaults to `true`.

## Examples

Here are some additional examples of how to use the Checkbox primitives.

### Checkbox Form Field

The checkbox automatically integrates with the form field primitives.

<docs-example name="checkbox-form-field"></docs-example>

## API Reference

The following directives are available to import from the `ng-primitives/checkbox` package:

### NgpCheckbox

<api-docs name="NgpCheckbox"></api-docs>

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

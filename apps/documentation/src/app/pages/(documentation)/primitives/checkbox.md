---
name: 'Checkbox'
sourceUrl: 'https://github.com/ng-primitives/ng-primitives/tree/next/packages/ng-primitives/checkbox'
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
- `component-suffix`: The suffix to apply to the generated component class name.
- `file-suffix`: The suffix to apply to the generated component file name. Defaults to `component`.
- `example-styles`: Whether to include example styles in the generated component file. Defaults to `true`.

## Examples

Here are some additional examples of how to use the Checkbox primitives.

### Default Checked

Use `ngpCheckboxDefaultChecked` to set the initial checked state in uncontrolled mode.

Binding `[ngpCheckboxChecked]` makes it controlled; if omitted (`undefined`), it stays uncontrolled.

<docs-example name="checkbox-default-checked"></docs-example>

### Checkbox Form Field

The checkbox automatically integrates with the form field primitives.

<docs-example name="checkbox-form-field"></docs-example>

## API Reference

The following directives are available to import from the `ng-primitives/checkbox` package:

### NgpCheckbox

<api-docs name="NgpCheckbox"></api-docs>

<api-reference-props name="NgpCheckbox"></api-reference-props>

<api-reference-attributes>
  <api-attribute name="data-checked" description="Applied when the checkbox is checked." />
  <api-attribute name="data-indeterminate" description="Applied when the checkbox is indeterminate." />
  <api-attribute name="data-disabled" description="Applied when the checkbox is disabled." />
  <api-attribute name="data-hover" description="Applied when the checkbox is hovered." />
  <api-attribute name="data-focus-visible" description="Applied when the checkbox is focused." />
  <api-attribute name="data-press" description="Applied when the checkbox is pressed." />
</api-reference-attributes>

## Accessibility

Adheres to the [Tri-State Checkbox WAI-ARIA design pattern](https://www.w3.org/WAI/ARIA/apg/patterns/checkbox).

### Keyboard Interactions

- <kbd>Space</kbd> - Toggle the checked state.

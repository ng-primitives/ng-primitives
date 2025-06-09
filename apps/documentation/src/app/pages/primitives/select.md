---
name: 'Select'
---

# Select

A select is a form control that allows users to select options from a list. This primitive enhances the native select element with improved accessibility and interaction handling for hover and focus.

<docs-example name="select"></docs-example>

## Import

Import the Select primitives from `ng-primitives/select`.

```ts
import { NgpSelect } from 'ng-primitives/select';
```

## Usage

Assemble the select directives in your template.

```html
<select ngpSelect>
  <option value="24">24 hours</option>
  <option value="12">12 hours</option>
</select>
```

## Reusable Component

Create a reusable component that uses the `NgpSelect` directive.

<docs-snippet name="select"></docs-snippet>

## Schematics

Generate a reusable select component using the Angular CLI.

```bash npm
ng g ng-primitives:primitive select
```

### Options

- `path`: The path at which to create the component file.
- `prefix`: The prefix to apply to the generated component selector.
- `componentSuffix`: The suffix to apply to the generated component class name.
- `fileSuffix`: The suffix to apply to the generated component file name. Defaults to `component`.
- `exampleStyles`: Whether to include example styles in the generated component file. Defaults to `true`.

## Examples

Here are some additional examples of how to use the Select primitives.

### Select Form Field

The select automatically integrates with the form field primitives.

<docs-example name="select-form-field"></docs-example>

## API Reference

The following directives are available to import from the `ng-primitives/select` package:

### NgpSelect

<api-docs name="NgpSelect"></api-docs>

#### Data Attributes

| Attribute            | Description                           |
| -------------------- | ------------------------------------- |
| `data-hover`         | Applied when the element is hovered.  |
| `data-focus-visible` | Applied when the element is focused.  |
| `data-disabled`      | Applied when the element is disabled. |

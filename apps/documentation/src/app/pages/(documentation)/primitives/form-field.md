---
name: 'Form Field'
---

# Form Field

<docs-example name="form-field"></docs-example>

## Import

Import the FormField primitives from `ng-primitives/form-field`.

```ts
import {
  NgpFormField,
  NgpLabel,
  NgpDescription,
  NgpError,
  NgpFormControl,
} from 'ng-primitives/form-field';
```

## Usage

Assemble the form-field directives in your template.

```html
<div ngpFormField>
  <label ngpLabel>Label</label>
  <!-- Typically ngpFormControl would not be used directly, but a primitive like ngpInput would be used instead -->
  <input ngpFormControl />
  <p ngpDescription>Description</p>
  <p ngpError ngpErrorValidator="required">Error</p>
</div>
```

## Reusable Component

Create a reusable component that uses the `NgpFormField` directive.

<docs-snippet name="form-field"></docs-snippet>

## Schematics

Generate a reusable form-field component using the Angular CLI.

```bash npm
ng g ng-primitives:primitive form-field
```

### Options

- `path`: The path at which to create the component file.
- `prefix`: The prefix to apply to the generated component selector.
- `componentSuffix`: The suffix to apply to the generated component class name.
- `fileSuffix`: The suffix to apply to the generated component file name. Defaults to `component`.
- `exampleStyles`: Whether to include example styles in the generated component file. Defaults to `true`.

## API Reference

The following directives are available to import from the `ng-primitives/form-field` package:

### NgpFormField

<api-docs name="NgpFormField"></api-docs>

#### Data Attributes

| Attribute       | Description                                |
| --------------- | ------------------------------------------ |
| `data-invalid`  | Applied when the form control is invalid.  |
| `data-valid`    | Applied when the form control is valid.    |
| `data-touched`  | Applied when the form control is touched.  |
| `data-pristine` | Applied when the form control is pristine. |
| `data-dirty`    | Applied when the form control is dirty.    |
| `data-pending`  | Applied when the form control is pending.  |
| `data-disabled` | Applied when the form control is disabled. |

### NgpLabel

<api-docs name="NgpLabel"></api-docs>

#### Data Attributes

| Attribute       | Description                                | Value |
| --------------- | ------------------------------------------ | ----- |
| `data-invalid`  | Applied when the form control is invalid.  |
| `data-valid`    | Applied when the form control is valid.    |
| `data-touched`  | Applied when the form control is touched.  |
| `data-pristine` | Applied when the form control is pristine. |
| `data-dirty`    | Applied when the form control is dirty.    |
| `data-pending`  | Applied when the form control is pending.  |
| `data-disabled` | Applied when the form control is disabled. |

### NgpDescription

<api-docs name="NgpDescription"></api-docs>

#### Data Attributes

| Attribute       | Description                                | Value |
| --------------- | ------------------------------------------ | ----- |
| `data-invalid`  | Applied when the form control is invalid.  |
| `data-valid`    | Applied when the form control is valid.    |
| `data-touched`  | Applied when the form control is touched.  |
| `data-pristine` | Applied when the form control is pristine. |
| `data-dirty`    | Applied when the form control is dirty.    |
| `data-pending`  | Applied when the form control is pending.  |
| `data-disabled` | Applied when the form control is disabled. |

### NgpError

<api-docs name="NgpError"></api-docs>

#### Data Attributes

| Attribute        | Description                                                        | Value            |
| ---------------- | ------------------------------------------------------------------ | ---------------- |
| `data-validator` | Whether the validator specified in `ngpErrorValidator` is failing. | `fail` \| `pass` |
| `data-invalid`   | Applied when the form control is invalid.                          | `-`              |
| `data-valid`     | Applied when the form control is valid.                            | `-`              |
| `data-touched`   | Applied when the form control is touched.                          | `-`              |
| `data-pristine`  | Applied when the form control is pristine.                         | `-`              |
| `data-dirty`     | Applied when the form control is dirty.                            | `-`              |
| `data-pending`   | Applied when the form control is pending.                          | `-`              |
| `data-disabled`  | Applied when the form control is disabled.                         | `-`              |

### NgpFormControl

<api-docs name="NgpFormControl"></api-docs>

#### Data Attributes

| Attribute       | Description                                | Value |
| --------------- | ------------------------------------------ | ----- |
| `data-invalid`  | Applied when the form control is invalid.  |
| `data-valid`    | Applied when the form control is valid.    |
| `data-touched`  | Applied when the form control is touched.  |
| `data-pristine` | Applied when the form control is pristine. |
| `data-dirty`    | Applied when the form control is dirty.    |
| `data-pending`  | Applied when the form control is pending.  |
| `data-disabled` | Applied when the form control is disabled. |

## Accessibility

The label and description elements should be associated with the form control using the `aria-labelledby` and `aria-describedby` attributes, respectively. This will ensure that screen readers can provide the necessary context to users.

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

- `name`: The name of the component.
- `prefix`: The prefix to apply to the generated component selector.
- `directory`: The directory at which to create the component file.
- `style`: The file extension or preprocessor to use for style files.
- `inlineStyle`: Include styles inline in the component.ts file. Only CSS styles can be included inline.
- `inlineTemplate`: Include template inline in the component.ts file

## API Reference

The following directives are available to import from the `ng-primitives/form-field` package:

### NgpFormField

The `NgpFormField` directive is a container for form field elements. Any labels, form controls, or descriptions should be placed within this directive.

- Selector: `[ngpFormField]`
- Exported As: `ngpFormField`

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

The `NgpLabel` directive is used to mark a label element within a form field. Preferably, there should use an HTML `<label>` element.

- Selector: `[ngpLabel]`
- Exported As: `ngpLabel`

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

The `NgpDescription` directive is used to mark a description element within a form field. There may be multiple descriptions associated with a form control.

- Selector: `[ngpDescription]`
- Exported As: `ngpDescription`

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

The `NgpError` directive is used to mark an error message element within a form field. There may be multiple error messages associated with a form control.

- Selector: `[ngpError]`
- Exported As: `ngpError`

<response-field name="ngpErrorValidator" type="string">
  The name of the validator associated with this error message.
</response-field>

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

Typically this primitive would be not be used directly, but instead a more specific form control primitive would be used (e.g. `ngpInput`). All of our form control primitives use `ngpFormControl` internally so they will have the same accessibility features as described below.

The `NgpFormControl` directive is used to mark a form control element within a form field. This element will have an `aria-labelledby` attribute set to the ID of the label element within the form field and an `aria-describedby` attribute set to the ID of the description elements within the form field.

- Selector: `[ngpFormControl]`
- Exported As: `ngpFormControl`

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

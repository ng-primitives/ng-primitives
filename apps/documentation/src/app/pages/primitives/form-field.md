---
title: 'Form Field'
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
  <input ngpFormControl />
  <p ngpDescription>Description</p>
  <p ngpError ngpErrorValidator="required">Error</p>
</div>
```

## API Reference

The following directives are available to import from the `ng-primitives/form-field` package:

### NgpFormField

The `NgpFormField` directive is a container for form field elements. Any labels, form controls, or descriptions should be placed within this directive.

- Selector: `[ngpFormField]`
- Exported As: `ngpFormField`

#### Data Attributes

| Attribute       | Description                               | Value             |
| --------------- | ----------------------------------------- | ----------------- |
| `data-invalid`  | The `invalid` state of the form control.  | `true` \| `false` |
| `data-valid`    | The `valid` state of the form control.    | `true` \| `false` |
| `data-touched`  | The `touched` state of the form control.  | `true` \| `false` |
| `data-pristine` | The `pristine` state of the form control. | `true` \| `false` |
| `data-dirty`    | The `dirty` state of the form control.    | `true` \| `false` |
| `data-pending`  | The `pending` state of the form control.  | `true` \| `false` |
| `data-disabled` | The `disabled` state of the form control. | `true` \| `false` |

### NgpLabel

The `NgpLabel` directive is used to mark a label element within a form field. Preferably, there should use an HTML `<label>` element.

- Selector: `[ngpLabel]`
- Exported As: `ngpLabel`

#### Data Attributes

| Attribute       | Description                               | Value             |
| --------------- | ----------------------------------------- | ----------------- |
| `data-invalid`  | The `invalid` state of the form control.  | `true` \| `false` |
| `data-valid`    | The `valid` state of the form control.    | `true` \| `false` |
| `data-touched`  | The `touched` state of the form control.  | `true` \| `false` |
| `data-pristine` | The `pristine` state of the form control. | `true` \| `false` |
| `data-dirty`    | The `dirty` state of the form control.    | `true` \| `false` |
| `data-pending`  | The `pending` state of the form control.  | `true` \| `false` |
| `data-disabled` | The `disabled` state of the form control. | `true` \| `false` |

### NgpDescription

The `NgpDescription` directive is used to mark a description element within a form field. There may be multiple descriptions associated with a form control.

- Selector: `[ngpDescription]`
- Exported As: `ngpDescription`

#### Data Attributes

| Attribute       | Description                               | Value             |
| --------------- | ----------------------------------------- | ----------------- |
| `data-invalid`  | The `invalid` state of the form control.  | `true` \| `false` |
| `data-valid`    | The `valid` state of the form control.    | `true` \| `false` |
| `data-touched`  | The `touched` state of the form control.  | `true` \| `false` |
| `data-pristine` | The `pristine` state of the form control. | `true` \| `false` |
| `data-dirty`    | The `dirty` state of the form control.    | `true` \| `false` |
| `data-pending`  | The `pending` state of the form control.  | `true` \| `false` |
| `data-disabled` | The `disabled` state of the form control. | `true` \| `false` |

### NgpError

The `NgpError` directive is used to mark an error message element within a form field. There may be multiple error messages associated with a form control.

- Selector: `[ngpError]`
- Exported As: `ngpError`

<response-field name="ngpErrorValidator" type="string">
  The name of the validator associated with this error message.
</response-field>

#### Data Attributes

| Attribute        | Description                                                        | Value             |
| ---------------- | ------------------------------------------------------------------ | ----------------- |
| `data-validator` | Whether the validator specified in `ngpErrorValidator` is failing. | `fail` \| `pass`  |
| `data-invalid`   | The `invalid` state of the form control.                           | `true` \| `false` |
| `data-valid`     | The `valid` state of the form control.                             | `true` \| `false` |
| `data-touched`   | The `touched` state of the form control.                           | `true` \| `false` |
| `data-pristine`  | The `pristine` state of the form control.                          | `true` \| `false` |
| `data-dirty`     | The `dirty` state of the form control.                             | `true` \| `false` |
| `data-pending`   | The `pending` state of the form control.                           | `true` \| `false` |
| `data-disabled`  | The `disabled` state of the form control.                          | `true` \| `false` |

### NgpFormControl

The `NgpFormControl` directive is used to mark a form control element within a form field. This element will have an `aria-labelledby` attribute set to the ID of the label element within the form field and an `aria-describedby` attribute set to the ID of the description elements within the form field.

- Selector: `[ngpFormControl]`
- Exported As: `ngpFormControl`

#### Data Attributes

| Attribute       | Description                               | Value             |
| --------------- | ----------------------------------------- | ----------------- |
| `data-invalid`  | The `invalid` state of the form control.  | `true` \| `false` |
| `data-valid`    | The `valid` state of the form control.    | `true` \| `false` |
| `data-touched`  | The `touched` state of the form control.  | `true` \| `false` |
| `data-pristine` | The `pristine` state of the form control. | `true` \| `false` |
| `data-dirty`    | The `dirty` state of the form control.    | `true` \| `false` |
| `data-pending`  | The `pending` state of the form control.  | `true` \| `false` |
| `data-disabled` | The `disabled` state of the form control. | `true` \| `false` |

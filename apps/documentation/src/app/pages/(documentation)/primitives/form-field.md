---
name: 'Form Field'
sourceUrl: 'https://github.com/ng-primitives/ng-primitives/tree/next/packages/ng-primitives/form-field'
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
- `component-suffix`: The suffix to apply to the generated component class name.
- `file-suffix`: The suffix to apply to the generated component file name. Defaults to `component`.
- `example-styles`: Whether to include example styles in the generated component file. Defaults to `true`.

## API Reference

The following directives are available to import from the `ng-primitives/form-field` package:

### NgpFormField

<api-docs name="NgpFormField"></api-docs>

<api-reference-props name="NgpFormField"></api-reference-props>

<api-reference-attributes>
  <api-attribute name="data-invalid" description="Applied when the form control is invalid." />
  <api-attribute name="data-valid" description="Applied when the form control is valid." />
  <api-attribute name="data-touched" description="Applied when the form control is touched." />
  <api-attribute name="data-pristine" description="Applied when the form control is pristine." />
  <api-attribute name="data-dirty" description="Applied when the form control is dirty." />
  <api-attribute name="data-pending" description="Applied when the form control is pending." />
  <api-attribute name="data-disabled" description="Applied when the form control is disabled." />
</api-reference-attributes>

### NgpLabel

<api-docs name="NgpLabel"></api-docs>

<api-reference-props name="NgpLabel"></api-reference-props>

<api-reference-attributes>
  <api-attribute name="data-invalid" description="Applied when the form control is invalid." />
  <api-attribute name="data-valid" description="Applied when the form control is valid." />
  <api-attribute name="data-touched" description="Applied when the form control is touched." />
  <api-attribute name="data-pristine" description="Applied when the form control is pristine." />
  <api-attribute name="data-dirty" description="Applied when the form control is dirty." />
  <api-attribute name="data-pending" description="Applied when the form control is pending." />
  <api-attribute name="data-disabled" description="Applied when the form control is disabled." />
</api-reference-attributes>

### NgpDescription

<api-docs name="NgpDescription"></api-docs>

<api-reference-props name="NgpDescription"></api-reference-props>

<api-reference-attributes>
  <api-attribute name="data-invalid" description="Applied when the form control is invalid." />
  <api-attribute name="data-valid" description="Applied when the form control is valid." />
  <api-attribute name="data-touched" description="Applied when the form control is touched." />
  <api-attribute name="data-pristine" description="Applied when the form control is pristine." />
  <api-attribute name="data-dirty" description="Applied when the form control is dirty." />
  <api-attribute name="data-pending" description="Applied when the form control is pending." />
  <api-attribute name="data-disabled" description="Applied when the form control is disabled." />
</api-reference-attributes>

### NgpError

<api-docs name="NgpError"></api-docs>

<api-reference-props name="NgpError"></api-reference-props>

<api-reference-attributes>
  <api-attribute name="data-validator" description="Whether the validator specified in `ngpErrorValidator` is failing." value="fail | pass" />
  <api-attribute name="data-invalid" description="Applied when the form control is invalid." />
  <api-attribute name="data-valid" description="Applied when the form control is valid." />
  <api-attribute name="data-touched" description="Applied when the form control is touched." />
  <api-attribute name="data-pristine" description="Applied when the form control is pristine." />
  <api-attribute name="data-dirty" description="Applied when the form control is dirty." />
  <api-attribute name="data-pending" description="Applied when the form control is pending." />
  <api-attribute name="data-disabled" description="Applied when the form control is disabled." />
</api-reference-attributes>

### NgpFormControl

<api-docs name="NgpFormControl"></api-docs>

<api-reference-props name="NgpFormControl"></api-reference-props>

<api-reference-attributes>
  <api-attribute name="data-invalid" description="Applied when the form control is invalid." />
  <api-attribute name="data-valid" description="Applied when the form control is valid." />
  <api-attribute name="data-touched" description="Applied when the form control is touched." />
  <api-attribute name="data-pristine" description="Applied when the form control is pristine." />
  <api-attribute name="data-dirty" description="Applied when the form control is dirty." />
  <api-attribute name="data-pending" description="Applied when the form control is pending." />
  <api-attribute name="data-disabled" description="Applied when the form control is disabled." />
</api-reference-attributes>

## Accessibility

The label and description elements should be associated with the form control using the `aria-labelledby` and `aria-describedby` attributes, respectively. This will ensure that screen readers can provide the necessary context to users.

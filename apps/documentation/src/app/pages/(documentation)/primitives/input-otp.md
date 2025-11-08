---
name: 'Input OTP'
---

# Input OTP

One-Time Password (OTP) input component with individual character slots for secure authentication codes.

<docs-example name="input-otp"></docs-example>

## Import

Import the InputOtp primitives from `ng-primitives/input-otp`.

```ts
import { NgpInputOtp, NgpInputOtpInput, NgpInputOtpSlot } from 'ng-primitives/input-otp';
```

## Usage

Assemble the input-otp directives in your template.

```html
<div ngpInputOtp [(ngpInputOtpValue)]="otpValue">
  <input ngpInputOtpInput />

  <div>
    <div ngpInputOtpSlot></div>
    <div ngpInputOtpSlot></div>
    <div ngpInputOtpSlot></div>
  </div>
</div>
```

## Reusable Component

Create a reusable component that uses the `NgpInputOtp` directive.

<docs-snippet name="input-otp"></docs-snippet>

## Schematics

Generate a reusable input-otp component using the Angular CLI.

```bash npm
ng g ng-primitives:primitive input-otp
```

### Options

- `path`: The path at which to create the component file.
- `prefix`: The prefix to apply to the generated component selector.
- `componentSuffix`: The suffix to apply to the generated component class name.
- `fileSuffix`: The suffix to apply to the generated component file name. Defaults to `component`.
- `exampleStyles`: Whether to include example styles in the generated component file. Defaults to `true`.

## API Reference

The following directives are available to import from the `ng-primitives/input-otp` package:

### NgpInputOtp

The root container for the OTP input component.

<api-docs name="NgpInputOtp"></api-docs>

### NgpInputOtpInput

The hidden input element that captures user input.

<api-docs name="NgpInputOtpInput"></api-docs>

### NgpInputOtpSlot

A directive that represents individual character slots. Automatically registers with the parent input OTP and derives its index from registration order.

<api-docs name="NgpInputOtpSlot"></api-docs>

#### Data Attributes

| Attribute          | Description                                       |
| ------------------ | ------------------------------------------------- |
| `data-slot-index`  | The index of this slot.                           |
| `data-active`      | Added to the active (focused) slot.               |
| `data-filled`      | Added to slots that contain a character.          |
| `data-caret`       | Added to slots that show the cursor.              |
| `data-placeholder` | Added to slots that should show placeholder text. |

---
name: 'Input OTP'
sourceUrl: 'https://github.com/ng-primitives/ng-primitives/tree/next/packages/ng-primitives/input-otp'
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
- `component-suffix`: The suffix to apply to the generated component class name.
- `file-suffix`: The suffix to apply to the generated component file name. Defaults to `component`.
- `example-styles`: Whether to include example styles in the generated component file. Defaults to `true`.

## API Reference

The following directives are available to import from the `ng-primitives/input-otp` package:

### NgpInputOtp

The root container for the OTP input component.

<api-docs name="NgpInputOtp"></api-docs>

<api-reference-props name="NgpInputOtp"></api-reference-props>

### NgpInputOtpInput

The hidden input element that captures user input.

<api-docs name="NgpInputOtpInput"></api-docs>

<api-reference-props name="NgpInputOtpInput"></api-reference-props>

### NgpInputOtpSlot

A directive that represents individual character slots. Automatically registers with the parent input OTP and derives its index from registration order.

<api-docs name="NgpInputOtpSlot"></api-docs>

<api-reference-props name="NgpInputOtpSlot"></api-reference-props>

<api-reference-attributes>
  <api-attribute name="data-slot-index" description="The index of this slot." />
  <api-attribute name="data-active" description="Added to the active (focused) slot." />
  <api-attribute name="data-filled" description="Added to slots that contain a character." />
  <api-attribute name="data-caret" description="Added to slots that show the cursor." />
  <api-attribute name="data-placeholder" description="Added to slots that should show placeholder text." />
</api-reference-attributes>

## Accessibility

The input OTP primitive uses a hidden `<input>` element with `autocomplete="one-time-code"` for browser autofill and screen reader compatibility. The visual slot elements use `role="presentation"` and are purely decorative — screen readers interact only with the underlying input element.

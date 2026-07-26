---
title: Password | Angular Primitives
name: 'Password'
sourceUrl: 'https://github.com/ng-primitives/ng-primitives/tree/next/packages/ng-primitives/password'
---

# Password

The password primitive is a form control that lets users reveal and hide the contents of a password field with an accessible toggle button.

<docs-example name="password"></docs-example>

## Import

Import the Password primitives from `ng-primitives/password`.

```ts
import { NgpPassword, NgpPasswordInput, NgpPasswordToggle } from 'ng-primitives/password';
```

## Usage

Assemble the password directives in your template. `ngpPasswordInput` is a complete input (it composes `ngpInput` internally), so you do not add `ngpInput` separately. Keep `type="password"` on the field so it renders masked from the start; the toggle switches it to `text` and back.

```html
<div ngpFormField>
  <label ngpLabel>Password</label>
  <div ngpPassword #password="ngpPassword">
    <input ngpPasswordInput type="password" autocomplete="current-password" />
    <button ngpButton ngpPasswordToggle>
      <ng-icon [name]="password.isVisible() ? 'lucideEyeOff' : 'lucideEye'" />
    </button>
  </div>
</div>
```

## Reusable Component

Create a password component that uses the `NgpPassword` directive.

<docs-snippet name="password"></docs-snippet>

## Schematics

Generate a reusable password component using the Angular CLI.

```bash npm
ng g ng-primitives:primitive password
```

### Options

- `path`: The path at which to create the component file.
- `prefix`: The prefix to apply to the generated component selector.
- `component-suffix`: The suffix to apply to the generated component class name.
- `file-suffix`: The suffix to apply to the generated component file name. Defaults to `component`.
- `styles`: How component styles should be generated. `css` (default) includes the full example styles; `unstyled` omits them entirely so you can style the component yourself.

## Global Configuration

You can configure the default labels and announcements for all password primitives in your application by using the `providePasswordConfig` function in a providers array.

```ts
import { providePasswordConfig } from 'ng-primitives/password';

bootstrapApplication(AppComponent, {
  providers: [
    providePasswordConfig({
      showLabel: 'Show password',
      hideLabel: 'Hide password',
      shownAnnouncement: 'Your password is shown',
      hiddenAnnouncement: 'Your password is hidden',
      ignorePasswordManagers: false,
    }),
  ],
});
```

## API Reference

The following directives are available to import from the `ng-primitives/password` package:

### NgpPassword

<api-docs name="NgpPassword"></api-docs>

<api-reference-props name="NgpPassword"></api-reference-props>

<api-reference-attributes>
  <api-attribute name="data-visible" description="Applied when the password is visible." />
</api-reference-attributes>

### NgpPasswordInput

<api-docs name="NgpPasswordInput"></api-docs>

<api-reference-props name="NgpPasswordInput"></api-reference-props>

<api-reference-attributes>
  <api-attribute name="data-visible" description="Applied when the password is visible." />
</api-reference-attributes>

### NgpPasswordToggle

<api-docs name="NgpPasswordToggle"></api-docs>

<api-reference-props name="NgpPasswordToggle"></api-reference-props>

<api-reference-attributes>
  <api-attribute name="data-visible" description="Applied when the password is visible." />
</api-reference-attributes>

## Accessibility

The toggle button is a real `<button>` element with `type="button"` and `aria-controls` pointing at the input. Its accessible label swaps between "Show password" and "Hide password", and visibility changes are announced to screen readers via a live region rather than exposing the password itself.

For security, the input reverts to `type="password"` when its form is submitted, so browsers never cache a revealed password as an autocomplete suggestion.

---
title: Button | Angular Primitives
name: 'Button'
sourceUrl: 'https://github.com/ng-primitives/ng-primitives/tree/next/packages/ng-primitives/button'
---

# Button

A button is a clickable element that can be used to trigger an action. This primitive enhances the native button element with improved accessibility and interaction handling for hover, press and focus.

<docs-example name="button"></docs-example>

## Import

Import the Button primitives from `ng-primitives/button`.

```ts
import { NgpButton } from 'ng-primitives/button';
```

## Usage

Assemble the button directives in your template.

```html
<button ngpButton>Button</button>
```

## Reusable Component

Create a button component that uses the `NgpButton` directive.

<docs-snippet name="button"></docs-snippet>

## Schematics

Generate a reusable button component using the Angular CLI.

```bash npm
ng g ng-primitives:primitive button
```

### Options

- `path`: The path at which to create the component file.
- `prefix`: The prefix to apply to the generated component selector.
- `component-suffix`: The suffix to apply to the generated component class name.
- `file-suffix`: The suffix to apply to the generated component file name. Defaults to `component`.
- `styles`: How component styles should be generated. `css` (default) includes the full example styles; `unstyled` omits them entirely so you can style the component yourself.
- `example-styles` (deprecated): still supported for compatibility - `true` maps to `styles: css`, `false` maps to `styles: unstyled`.

## API Reference

The following directives are available to import from the `ng-primitives/button` package:

### NgpButton

<api-docs name="NgpButton"></api-docs>

<api-reference-props name="NgpButton"></api-reference-props>

<api-reference-attributes>
  <api-attribute name="data-hover" description="Added to the button when hovered." />
  <api-attribute name="data-focus-visible" description="Added to the button when focused." />
  <api-attribute name="data-press" description="Added to the button when pressed." />
  <api-attribute name="data-disabled" description="Added to the button when disabled. Empty string when fully disabled, or `soft` when soft-disabled." />
  <api-attribute name="data-pending" description="Added to the button while it is pending." />
</api-reference-attributes>

## Accessibility

Apply the primitive to native `&lt;button&gt;` elements to inherit built-in browser accessibility. With `disabled="'soft'"`, `aria-disabled` is used in place of the native `disabled` attribute so the element remains focusable.

### Pending State

Set `ngpButtonPending` while the request a button started is running. A pending button sets `aria-disabled="true"` and stays focusable, so focus does not fall back to the page. Its clicks are cancelled before your `(click)` handlers run, so a `type="submit"` button does not submit its form, including on <kbd>Enter</kbd> in a form field. Listeners that run before the button's own, such as a capture listener on an ancestor, and keyboard handlers you add to a non-native host still run, so check the pending state in those. A fully disabled button keeps its native `disabled` attribute while pending, so it is not focusable and has no `aria-disabled`. When pending starts or ends while the button has focus, its accessible name is announced through a live region, so a screen reader user hears that something is happening. Give the button a name that describes the pending state, for example a visually hidden "Saving" label next to a spinner.

The announcement is made only while the button has focus. Safari and Firefox on macOS, and Safari on iOS, do not focus a button on click or tap, so a pointer or touch activation there is not announced. A button inside a shadow root is not announced either, since the live region cannot reference an element across the shadow boundary. Nor is a button inside a native `<dialog>` opened with `showModal()`, which makes the live region outside it inert. `NgpDialog` does not have this limit.

### Keyboard Interactions

- <kbd>Enter</kbd>: Activate the button.
- <kbd>Space</kbd>: Activate the button.

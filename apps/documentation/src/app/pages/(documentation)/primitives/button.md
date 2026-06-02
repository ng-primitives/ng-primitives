---
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
- `example-styles`: Whether to include example styles in the generated component file. Defaults to `true`.

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
</api-reference-attributes>

## Accessibility

Apply the primitive to native `&lt;button&gt;` elements to inherit built-in browser accessibility. With `disabled="'soft'"`, `aria-disabled` is used in place of the native `disabled` attribute so the element remains focusable.

### Keyboard Interactions

- <kbd>Enter</kbd>: Activate the button.
- <kbd>Space</kbd>: Activate the button.

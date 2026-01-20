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

## Examples

### Button Sizes

You can add size support to your reusable button component. This is implemented at the component level rather than in the primitive to provide more flexibility for different design systems.

<docs-example name="button-sizes"></docs-example>

### Button Variants

You can add variant support to your reusable button component to indicate different purposes or importance levels.

<docs-example name="button-variants"></docs-example>

### Button with Icons

You can add icons to your buttons using any Angular icon library or simple SVG elements, but we recommend the [`@ng-icons`](https://github.com/ng-icons/ng-icons) library. This example shows how to create buttons with icons on the leading, trailing, or both sides using content projection slots.

<docs-example name="button-icon"></docs-example>

## Schematics

Generate a reusable button component using the Angular CLI.

```bash npm
ng g ng-primitives:primitive button
```

### Options

- `path`: The path at which to create the component file.
- `prefix`: The prefix to apply to the generated component selector.
- `componentSuffix`: The suffix to apply to the generated component class name.
- `fileSuffix`: The suffix to apply to the generated component file name. Defaults to `component`.
- `exampleStyles`: Whether to include example styles in the generated component file. Defaults to `true`.

## API Reference

The following directives are available to import from the `ng-primitives/button` package:

### NgpButton

<api-docs name="NgpButton"></api-docs>

#### Data Attributes

| Attribute            | Description                        |
| -------------------- | ---------------------------------- |
| `data-hover`         | Added to the button when hovered.  |
| `data-focus-visible` | Added to the button when focused.  |
| `data-press`         | Added to the button when pressed.  |
| `data-disabled`      | Added to the button when disabled. |

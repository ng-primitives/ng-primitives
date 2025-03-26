---
name: 'Button'
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
- `componentSuffix`: The suffix to apply to the generated component class name.
- `fileSuffix`: The suffix to apply to the generated component file name. Defaults to `component`.
- `exampleStyles`: Whether to include example styles in the generated component file. Defaults to `true`.

## API Reference

The following directives are available to import from the `ng-primitives/button` package:

### NgpButton

A directive that can be used to create a button.

- Selector: `[ngpButton]`
- Exported As: `ngpButton`
- Host Directives: [NgpHover](/interactions/hover), [NgpFocusVisible](/interactions/focus-visible), [NgpPress](/interactions/press)

#### Data Attributes

| Attribute            | Description                        |
| -------------------- | ---------------------------------- |
| `data-hover`         | Added to the button when hovered.  |
| `data-focus-visible` | Added to the button when focused.  |
| `data-press`         | Added to the button when pressed.  |
| `data-disabled`      | Added to the button when disabled. |

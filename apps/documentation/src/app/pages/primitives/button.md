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

## Schematics

Generate a button component with the `NgpButton` primitive preconfigured.

```bash npm
 ng g ng-primitives:button
```

### Options

- `name`: The name of the component.
- `prefix`: The prefix to apply to the generated component selector.
- `directory`: The directory at which to create the component file.
- `style`: The file extension or preprocessor to use for style files.
- `inlineStyle`: Include styles inline in the component.ts file. Only CSS styles can be included inline.
- `inlineTemplate`: Include template inline in the component.ts file

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

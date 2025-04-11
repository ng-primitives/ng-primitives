---
name: 'Toggle'
---

# Toggle

Toggle a button on and off.

<docs-example name="toggle"></docs-example>

## Import

Import the Toggle primitives from `ng-primitives/toggle`.

```ts
import { NgpToggle } from 'ng-primitives/toggle';
```

## Usage

Assemble the toggle directives in your template.

```html
<button ngpToggle [(ngpToggleSelected)]="selected">Toggle</button>
```

## Reusable Component

Create a reusable component that uses the toggle directives.

<docs-snippet name="toggle"></docs-snippet>

## Schematics

Generate a reusable toggle component using the Angular CLI.

```bash npm
ng g ng-primitives:primitive toggle
```

### Options

- `path`: The path at which to create the component file.
- `prefix`: The prefix to apply to the generated component selector.
- `componentSuffix`: The suffix to apply to the generated component class name.
- `fileSuffix`: The suffix to apply to the generated component file name. Defaults to `component`.
- `exampleStyles`: Whether to include example styles in the generated component file. Defaults to `true`.

## API Reference

The following directives are available to import from the `ng-primitives/toggle` package:

### NgpToggle

Apply the `ngpToggle` directive to an element to manage the toggle state. This must be applied to a `button` element.

- Selector: `[ngpToggle]`
- Exported As: `ngpToggle`

<prop-details name="ngpToggleSelected" type="boolean" default="false">
  Define the selected state.
</prop-details>

<prop-details name="ngpToggleDisabled" type="boolean" default="false">
  Define the disabled state.
</prop-details>

<prop-details name="ngpToggleSelectedChange" type="boolean">
  Event emitted when the selected state changes.
</prop-details>

#### Data Attributes

The following data attributes are applied to the `ngpToggle` directive:

| Attribute       | Description                          |
| --------------- | ------------------------------------ |
| `data-selected` | Applied when the toggle is selected. |
| `data-disabled` | Applied when the toggle is disabled. |

## Accessibility

### Keyboard Interaction

- <kbd>Space</kbd>: Toggles the selected state.
- <kbd>Enter</kbd>: Toggles the selected state.

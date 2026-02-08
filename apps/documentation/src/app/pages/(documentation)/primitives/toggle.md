---
name: 'Toggle'
sourceUrl: 'https://github.com/ng-primitives/ng-primitives/tree/next/packages/ng-primitives/toggle'
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
- `component-suffix`: The suffix to apply to the generated component class name.
- `file-suffix`: The suffix to apply to the generated component file name. Defaults to `component`.
- `example-styles`: Whether to include example styles in the generated component file. Defaults to `true`.

## API Reference

The following directives are available to import from the `ng-primitives/toggle` package:

### NgpToggle

<api-docs name="NgpToggle"></api-docs>

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

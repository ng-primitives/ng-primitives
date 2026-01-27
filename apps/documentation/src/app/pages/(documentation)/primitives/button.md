---
name: 'Button'
sourceUrl: 'https://github.com/ng-primitives/ng-primitives/tree/next/packages/ng-primitives/button'
---

# Button

Adds accessible button behavior to any element with automatic role assignment, keyboard activation, and interaction states. Supports disabled states with optional focusable-when-disabled for loading scenarios.

<docs-example name="button"></docs-example>

## Import

Import the Button primitive from `ng-primitives/button`.

```ts
import { NgpButton } from 'ng-primitives/button';
```

## Usage

Apply the directive to buttons or any element that should behave as a button.

```html
<button ngpButton>Native button</button>
<div ngpButton>Custom button (gets role="button")</div>
```

<docs-snippet name="button"></docs-snippet>

## Examples

### Button Sizes

Add size support to your reusable button component. This is implemented at the component level to provide flexibility for different design systems.

<docs-example name="button-sizes"></docs-example>

### Button Variants

Add variant support to indicate different purposes or importance levels.

<docs-example name="button-variants"></docs-example>

### Button with Icons

Add icons using any Angular icon library or SVG elements. We recommend [`@ng-icons`](https://github.com/ng-icons/ng-icons). This example shows icons on leading, trailing, or both sides using content projection.

<docs-example name="button-icon"></docs-example>

### Loading States

Use `focusableWhenDisabled` to maintain focus during async operations. Without it, keyboard users lose their place when the button becomes disabled.

<docs-example name="button-loading"></docs-example>

#### Reusable Component with Loading State

Create a reusable button component that supports both disabled and loading states.

<docs-example name="button-loading-reusable"></docs-example>

## Role Assignment

`NgpButton` automatically assigns `role="button"` to non-native elements for screen reader compatibility:

| Element Type                       | Role Assignment                     |
| ---------------------------------- | ----------------------------------- |
| `&lt;button&gt;`                   | None (implicit button role)         |
| `&lt;input type="button"&gt;`      | None (implicit button role)         |
| `&lt;a href="..."&gt;`             | None (implicit link role)           |
| `&lt;div&gt;`, `&lt;span&gt;`, etc | `role="button"` added automatically |

Override with a custom role or set to `null` to remove:

```html
<div ngpButton [role]="'menuitem'">Menu Item</div>
<div ngpButton [role]="null">No role attribute</div>
```

## Keyboard Support

Native buttons respond to Enter and Space automatically. For non-native elements (`div`, `span`, anchors without `href`), `NgpButton` adds:

| Key   | Behavior                                       |
| ----- | ---------------------------------------------- |
| Enter | Triggers click immediately                     |
| Space | Triggers click on key release (matches native) |

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

The following directive is available from the `ng-primitives/button` package:

### NgpButton

<api-docs name="NgpButton"></api-docs>

#### Data Attributes

| Attribute                 | Description                                  |
| ------------------------- | -------------------------------------------- |
| `data-hover`              | Present when the button is hovered.          |
| `data-focus-visible`      | Present when the button has keyboard focus.  |
| `data-press`              | Present when the button is pressed.          |
| `data-disabled`           | Present when the button is disabled.         |
| `data-disabled-focusable` | Present when disabled but remains focusable. |

```css
[data-hover] {
  background: var(--button-hover);
}
[data-press] {
  transform: scale(0.98);
}
[data-focus-visible] {
  outline: 2px solid var(--focus-ring);
}
[data-disabled] {
  opacity: 0.5;
  cursor: not-allowed;
}
```

## Accessibility

`NgpButton` ensures WCAG compliance:

| Guideline               | Requirement                     | How NgpButton Helps                            |
| ----------------------- | ------------------------------- | ---------------------------------------------- |
| 2.1.1 Keyboard          | Keyboard operability            | Enter/Space activation for non-native elements |
| 4.1.2 Name, Role, Value | Proper roles for assistive tech | Auto-assigns `role="button"` when needed       |
| 2.4.7 Focus Visible     | Visible focus indicator         | Provides `data-focus-visible` for styling      |

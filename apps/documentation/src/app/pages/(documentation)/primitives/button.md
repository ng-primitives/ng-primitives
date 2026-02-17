---
name: 'Button'
sourceUrl: 'https://github.com/ng-primitives/ng-primitives/tree/next/packages/ng-primitives/button'
---

# Button

Enhance any element with accessible button behavior, including keyboard support, interaction states, and proper ARIA semantics.

<docs-example name="button"></docs-example>

## Why use this?

The browser's native `&lt;button&gt;` element works great, but sometimes you need:

- **Consistent interaction states** across hover, press, and focus for styling
- **Anchors** with `href`/`routerLink` that need the accessibility and visual treatment of a button
- **Custom button components** with button accessibility and custom styling
- **Loading states** that keep focus on the button while it's temporarily disabled
- **Disabled tooltips** that explain why a button is disabled

This primitive handles all of that while following the [WAI-ARIA Button Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/button/).

## Import

```ts
import { NgpButton } from 'ng-primitives/button';
```

## Reusable Component

Create a button component that uses the `NgpButton` directive.

<docs-snippet name="button"></docs-snippet>

## Accessibility Features

NgpButton implements the [WAI-ARIA Button Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/button/):

| Feature           | Native `&lt;button&gt;` | Non-native elements                                           |
| ----------------- | ----------------------- | ------------------------------------------------------------- |
| **Role**          | Implicit                | Adds `role="button"` (in the absence of set or apparent role) |
| **Keyboard**      | Browser handles         | Enter activates immediately, Space activates on release       |
| **Disabled**      | `disabled` attr         | `aria-disabled="true"` + event blocking                       |
| **Tab order**     | `disabled` removes      | `tabindex="-1"` when disabled                                 |
| **Focus visible** | `:focus-visible`        | `data-focus-visible` attribute                                |

## Examples

### Button Sizes

Add size support to your reusable button component. This is implemented at the component level rather than in the primitive to provide flexibility for different design systems.

<docs-example name="button-sizes"></docs-example>

### Button Variants

Add variant support to indicate different purposes or importance levels.

<docs-example name="button-variants"></docs-example>

### Button with Icons

Add icons using any icon library (we recommend [`@ng-icons`](https://github.com/ng-icons/ng-icons)). This example shows leading, trailing, and icon-only buttons using content projection.

<docs-example name="button-icon"></docs-example>

### Button-Styled Links

Apply `ngpButton` to anchors with `href` or `routerLink` for button-styled links with full accessibility and interaction states. The anchor retains its native link role and keyboard behavior.

<docs-example name="button-link"></docs-example>

### Custom Button Component

Create reusable button components using `hostDirectives` to inherit all button behavior while adding your own styling and API.

<docs-example name="button-custom-component"></docs-example>

### Loading States

Use `focusableWhenDisabled` for buttons that enter a loading state after being clicked.

**Why?** When a button becomes disabled, it's removed from the tab order. Keyboard users lose their focus position and have to navigate back when loading completes. `focusableWhenDisabled` keeps focus on the button throughout the loading cycle.

<docs-example name="button-loading"></docs-example>

#### How it works

| Property                             | Behavior                                                    |
| ------------------------------------ | ----------------------------------------------------------- |
| `disabled` only                      | Uses native `disabled` attr, removed from tab order         |
| `disabled` + `focusableWhenDisabled` | Uses `aria-disabled`, stays in tab order, blocks activation |

This follows the [APG guidance on focusability of disabled controls](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/#focusabilityofdisabledcontrols).

#### Reusable Component with Loading State

Create a reusable button component that supports both disabled and loading states.

<docs-example name="button-loading-reusable"></docs-example>

### Disabled with Tooltip

When a button is disabled, users often need to know _why_. Using `focusableWhenDisabled` allows tooltips to appear on disabled buttons, helping users understand what's needed to enable the action.

<docs-example name="button-disabled-tooltip"></docs-example>

## Styling

Use data attributes to style different interaction states:

```css
[ngpButton] {
  /* Base styles */
}

[ngpButton][data-hover] {
  /* Hovered */
}

[ngpButton][data-press] {
  /* Being pressed */
}

[ngpButton][data-focus-visible] {
  /* Keyboard focused */
}

[ngpButton][data-disabled] {
  /* Disabled (focusable or not) */
}

[ngpButton][data-disabled-focusable] {
  /* Disabled and focusable (loading state) */
}
```

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

#### Data Attributes

| Attribute                 | Description                                                        |
| ------------------------- | ------------------------------------------------------------------ |
| `data-hover`              | Present when the button is hovered.                                |
| `data-focus-visible`      | Present when the button has keyboard focus.                        |
| `data-press`              | Present while the button is being pressed.                         |
| `data-disabled`           | Present when the button is disabled.                               |
| `data-disabled-focusable` | Present when disabled but still focusable (loading/tooltip state). |

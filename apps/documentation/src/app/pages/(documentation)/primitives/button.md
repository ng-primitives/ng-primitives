---
name: 'Button'
---

# Button

A button primitive that enhances any element with button-like behavior. It provides keyboard activation, proper ARIA semantics, and interaction states for accessible, interactive buttons.

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

### Loading States

For buttons that enter a loading state after being clicked, use the `focusableWhenDisabled` input to ensure focus remains on the button when it becomes disabled. This prevents focus from being lost and maintains the tab order. `NgpButton` uses the [`NgpFocusable`](/primitives/focusable) primitive to manage the focus and disabled states.

<docs-example name="button-loading"></docs-example>

### Non-Native Buttons

Create a non-native button component that supports an accessible disabled, but focusable loading state.

<docs-example name="button-loading-reusable"></docs-example>

## When to Use

Use `NgpButton` when you need:

- **Keyboard-accessible buttons**: Automatically handles Enter and Space key activation on any element
- **Non-native button elements**: Turn `&lt;div&gt;`, `&lt;span&gt;`, or custom elements into accessible buttons
- **Interaction states**: Get consistent hover, press, and focus-visible states via `data-*` attributes
- **Loading states**: Keep focus on buttons during async operations with `focusableWhenDisabled`

`NgpButton` builds on [`NgpFocusable`](/primitives/focusable) and adds:

| Feature                 | NgpFocusable | NgpButton |
| ----------------------- | ------------ | --------- |
| Focus management        | ✓            | ✓         |
| Disabled state handling | ✓            | ✓         |
| `focusableWhenDisabled` | ✓            | ✓         |
| Enter/Space activation  |              | ✓         |
| `role="button"`         |              | ✓         |
| `type="button"`         |              | ✓         |
| Click event blocking    |              | ✓         |

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

## Configuration

Configure button behavior globally using `provideButtonConfig`. The button config includes all [`NgpFocusable`](/primitives/focusable) options plus button-specific options.

### Configuration Options

| Option                   | Default | Description                                                                                |
| ------------------------ | ------- | ------------------------------------------------------------------------------------------ |
| `autoSetButtonRole`      | `false` | Automatically set `role="button"` on non-native, non-anchor elements                       |
| `autoSetButtonType`      | `false` | Automatically set `type="button"` on native buttons (prevents unintended form submissions) |
| `autoManageAriaDisabled` | `true`  | Automatically manage the `aria-disabled` attribute (inherited from NgpFocusable)           |
| `autoManageTabIndex`     | `true`  | Automatically manage the `tabindex` attribute (inherited from NgpFocusable)                |

Why `autoSetButtonRole` and `autoSetButtonType` Default to `false`?

These options are disabled by default for backwards compatibility. However, enabling them is recommended for new projects:

- **`autoSetButtonRole`**: Screen readers announce non-native elements as buttons, improving accessibility
- **`autoSetButtonType`**: Prevents native `&lt;button&gt;` elements from submitting forms unexpectedly (HTML defaults to `type="submit"`)

### Global Configuration

```ts
import { provideButtonConfig } from 'ng-primitives/button';

bootstrapApplication(AppComponent, {
  providers: [
    provideButtonConfig({
      autoSetButtonType: true, // Recommended: prevents unintended form submissions
      autoSetButtonRole: true, // Recommended: ensures screen readers announce non-native buttons
      autoManageAriaDisabled: true, // Default: manages aria-disabled automatically
      autoManageTabIndex: true, // Default: manages tabindex automatically
    }),
  ],
});
```

## API Reference

The following directives are available to import from the `ng-primitives/button` package:

### NgpButton

<api-docs name="NgpButton"></api-docs>

#### Data Attributes

| Attribute                      | Description                                                       |
| ------------------------------ | ----------------------------------------------------------------- |
| `data-disabled`                | Applied when the button is disabled.                              |
| `data-focusable-when-disabled` | Applied when the button remains focusable when disabled.          |
| `data-hover`                   | Applied when the button is hovered (via ngpInteractions).         |
| `data-press`                   | Applied when the button is pressed (via ngpInteractions).         |
| `data-focus-visible`           | Applied when the button has keyboard focus (via ngpInteractions). |

## Accessibility

`NgpButton` provides comprehensive accessibility features that address WCAG requirements:

### WCAG 2.1.1 - Keyboard Accessibility

All interactive elements must be operable via keyboard. `NgpButton` ensures this by:

- **Enter key activation**: Triggers click immediately on keydown (matches native button behavior)
- **Space key activation**: Triggers click on keyup, allowing users to cancel by moving focus away
- **Tab navigation**: Proper `tabindex` management ensures buttons are in the tab order

### Non-Native Element Support

When using `NgpButton` on elements like `&lt;div&gt;` or `&lt;span&gt;`:

- Adds `role="button"` for screen readers (when `autoSetButtonRole` is enabled)
- Makes element focusable via `tabindex="0"`
- Handles Enter and Space key activation that native `&lt;div&gt;` elements lack

### Disabled State Management

When a button is disabled:

- Click events are blocked via `preventDefault()` and `stopImmediatePropagation()`
- Keyboard interactions are blocked (except Tab when `focusableWhenDisabled` is true)
- Native `disabled` attribute is set on `&lt;button&gt;` elements
- `aria-disabled="true"` is set for screen readers

### Focus Retention with `focusableWhenDisabled`

For loading states, use `focusableWhenDisabled` to:

- Keep the button in the tab order when disabled
- Use `aria-disabled` instead of native `disabled` attribute
- Prevent focus from jumping unexpectedly during async operations

This is essential for submit buttons that disable during form submission. Without it, focus jumps away when the button becomes disabled, which is disorienting for keyboard and screen reader users.

### References

- [MDN: Button Role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/button_role)
- [WCAG 2.1.1 Keyboard](https://www.w3.org/WAI/WCAG21/Understanding/keyboard.html)
- [WAI-ARIA Button Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/button/)

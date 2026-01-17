---
name: 'Focusable'
---

# Focusable

The Focusable primitive makes any element focusable and properly handles disabled states. It's a foundational primitive that other components like [`NgpButton`](/primitives/button), menu items, and tabs build upon to ensure consistent accessibility behavior.

<docs-example name="focusable"></docs-example>

## When to Use

Use `NgpFocusable` when you need:

- **Focus management for custom elements**: Make non-native elements (like `&lt;div&gt;` or `&lt;span&gt;`) focusable via keyboard
- **Loading states that retain focus**: Keep focus on a button when it becomes disabled during an async operation
- **Disabled state management**: Properly block interactions while maintaining accessibility

For most button-like interactions, use [`NgpButton`](/primitives/button) instead, which builds on `NgpFocusable` and adds:

- Enter and Space key activation for non-native elements
- Automatic `role="button"` for screen readers
- Automatic `type="button"` to prevent unintended form submissions

Use `NgpFocusable` directly when building your own interactive primitives or when you only need focus and disabled state management without keyboard activation.

## Import

Import the Focusable primitives from `ng-primitives/focusable`.

```ts
import { NgpFocusable } from 'ng-primitives/focusable';
```

## Usage

The primary use case for `NgpFocusable` is managing loading states where focus must be retained. For general button-like elements, use [`NgpButton`](/primitives/button) instead.

### Loading State with Focus Retention

When a button enters a loading state, you typically want to disable it while keeping focus so the user knows where they are:

```html
<button
  ngpFocusable
  [ngpFocusableDisabled]="isLoading()"
  [ngpFocusableWhenDisabled]="isLoading()"
  (click)="submit()"
>
  {{ isLoading() ? 'Saving...' : 'Save' }}
</button>
```

### Building Custom Interactive Primitives

Use `NgpFocusable` as a foundation when building primitives that need focus management but handle their own keyboard interactions (like tabs using arrow keys or custom listbox items):

```html
<!-- A custom tab that uses arrow keys for navigation, not Enter/Space -->
<div
  role="tab"
  ngpFocusable
  [ngpFocusableDisabled]="disabled()"
  [attr.aria-selected]="selected()"
  (keydown)="handleArrowKeys($event)"
>
  {{ label() }}
</div>
```

## Programmatic API

For building custom primitives, use the `ngpFocusable()` function directly:

```ts
import { ngpFocusable } from 'ng-primitives/focusable';

@Directive({
  selector: '[myCustomButton]',
})
export class MyCustomButton {
  readonly disabled = input(false);

  protected readonly state = ngpFocusable({
    disabled: this.disabled,
    focusableWhenDisabled: signal(false),
  });

  // Imperatively update state
  disable(): void {
    this.state.setDisabled(true);
  }
}
```

The function returns a state object with:

- `disabled()` - Signal indicating if the element is disabled
- `focusableWhenDisabled()` - Signal indicating if element stays focusable when disabled
- `tabIndex()` - Signal with the current tabindex value
- `ariaDisabled()` - Signal with the current aria-disabled value
- `setDisabled(value)` - Imperatively set the disabled state
- `setFocusableWhenDisabled(value)` - Imperatively set focusable when disabled
- `setTabIndex(value)` - Imperatively override the tabindex
- `setAriaDisabled(value)` - Imperatively override aria-disabled

## Examples

### Button with Loading State

For buttons that enter a loading state after being clicked, use the focusable when disabled option to ensure focus remains on the button when it becomes disabled. This prevents focus from being lost and maintains the tab order.

<docs-example name="focusable-loading"></docs-example>

### Non-Native Buttons

[`NgpButton`](/primitives/button) uses `NgpFocusable` under the hood. Simply use the [`NgpButton`](/primitives/button) directive to make any element keyboard-accessible with Enter and Space key activation.

<docs-example name="focusable-non-native"></docs-example>

## Configuration

Configure the automatic attribute management globally or per-instance.

### Configuration Options

| Option                   | Default | Description                                        |
| ------------------------ | ------- | -------------------------------------------------- |
| `autoManageAriaDisabled` | `true`  | Automatically manage the `aria-disabled` attribute |
| `autoManageTabIndex`     | `true`  | Automatically manage the `tabindex` attribute      |

### Global Configuration

Use `provideFocusableConfig` to set defaults for all focusable elements:

```ts
import { provideFocusableConfig } from 'ng-primitives/focusable';

bootstrapApplication(AppComponent, {
  providers: [
    provideFocusableConfig({
      autoManageAriaDisabled: false, // Disable automatic aria-disabled management
      autoManageTabIndex: false, // Disable automatic tabindex management
    }),
  ],
});
```

### Per-Instance Configuration

When using the programmatic API, you can override configuration per instance:

```ts
const state = ngpFocusable({
  disabled: this.disabled,
  config: {
    autoManageAriaDisabled: false, // Override just for this instance
  },
});
```

## API Reference

The following directives are available to import from the `ng-primitives/focusable` package:

### NgpFocusable

<api-docs name="NgpFocusable"></api-docs>

#### Data Attributes

| Attribute                      | Description                                                        |
| ------------------------------ | ------------------------------------------------------------------ |
| `data-disabled`                | Applied when the element is disabled.                              |
| `data-focusable-when-disabled` | Applied when the element remains focusable when disabled.          |
| `data-hover`                   | Applied when the element is hovered (via ngpInteractions).         |
| `data-press`                   | Applied when the element is pressed (via ngpInteractions).         |
| `data-focus-visible`           | Applied when the element has keyboard focus (via ngpInteractions). |

## Accessibility

This primitive addresses several WCAG requirements:

### WCAG 2.1.1 - Keyboard Accessibility

All functionality must be operable through a keyboard interface. This primitive:

- Makes non-native elements focusable via `tabindex="0"`
- Blocks keyboard interactions (except Tab) when disabled but focusable

For Enter and Space key activation on non-native elements, use [`NgpButton`](/primitives/button) which builds on this primitive.

### Focus Management for Disabled States

When using native `disabled`, focus is lost if the element was focused. The `focusableWhenDisabled` option:

- Uses `aria-disabled` instead of `disabled` attribute
- Keeps element in tab order
- Blocks all interactions while appearing disabled
- Prevents focus from jumping unexpectedly

### ARIA Semantics

- Sets `aria-disabled="true"` for non-native elements or focusable disabled buttons
- Manages `tabindex` appropriately based on element type and disabled state
- Applies `data-*` attributes for CSS styling hooks

## References

- [MDN: Button Role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/button_role)
- [WCAG 2.1.1 Keyboard](https://www.w3.org/WAI/WCAG21/Understanding/keyboard.html)
- [MDN: aria-disabled](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-disabled)
- [WAI-ARIA Button Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/button/)

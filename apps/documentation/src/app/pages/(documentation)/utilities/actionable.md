---
name: 'Actionable'
---

# Actionable

Make any element keyboard-accessible and properly handle disabled states with focus retention.

<docs-example name="actionable"></docs-example>

## Why This Primitive Exists

Native HTML `button` elements have built-in keyboard support and disabled handling, but many UI patterns require using non-semantic elements (like `div` or `span`) as interactive controls. These elements lack:

- Keyboard operability (Enter/Space activation)
- Proper focus management
- Accessible disabled states

Additionally, the native `disabled` attribute has limitations:

- Removes elements from the tab order entirely, causing focus to be lost
- Prevents screen readers from announcing the element in some contexts
- Cannot be used for loading states where focus should be retained

## Import

Import the Actionable primitives from `ng-primitives/actionable`.

```ts
import { NgpActionable } from 'ng-primitives/actionable';
```

For programmatic usage:

```ts
import { ngpActionable } from 'ng-primitives/actionable';
```

## Usage

### Directive API

Apply the directive to any element to make it keyboard-accessible.

```html
<div ngpActionable (click)="handleClick()">Click me</div>
```

With disabled state:

```html
<div ngpActionable [ngpActionableDisabled]="isDisabled" (click)="handleClick()">Click me</div>
```

### Programmatic API

Use the `ngpActionable()` function for more control in custom directives or components.

```ts
import { ngpActionable } from 'ng-primitives/actionable';

// In your directive or component
const state = ngpActionable({
  disabled: this.disabled,
  focusableWhenDisabled: this.focusableWhenDisabled,
});

// Check state
if (state.disabled()) {
  // Handle disabled state
}

// Imperatively update
state.setDisabled(true);
```

## Examples

### Focusable When Disabled

For buttons that enter a loading state after being clicked, use `focusableWhenDisabled` to ensure focus remains on the button. This prevents focus from being lost and maintains the tab order, which is essential for keyboard and screen reader users.

<docs-example name="actionable-focusable"></docs-example>

## Accessibility

This primitive addresses several WCAG requirements:

### WCAG 2.1.1 - Keyboard Accessibility

All functionality is operable through a keyboard interface. This primitive adds Enter and Space key activation to non-native elements, matching native button behavior:

- **Enter** activates immediately on keydown
- **Space** activates on keyup (allowing cancellation by moving pointer away)

### Focus Management

When using native `disabled`, focus is lost if the element was focused. The `focusableWhenDisabled` option solves this by:

- Using `aria-disabled` instead of `disabled` attribute
- Keeping element in tab order
- Blocking all interactions while appearing disabled
- Preventing focus from jumping unexpectedly

### Keyboard Interactions

- <kbd>Enter</kbd> - Activates the element immediately
- <kbd>Space</kbd> - Activates the element on key release
- <kbd>Tab</kbd> - Moves focus to/from the element (works even when disabled with `focusableWhenDisabled`)

## API Reference

The following are available to import from the `ng-primitives/actionable` package:

### NgpActionable

<api-docs name="NgpActionable"></api-docs>

### ngpActionable()

The `ngpActionable()` function creates actionable behavior programmatically. Use this when building custom primitives or when you need more control over the state.

```ts
function ngpActionable(
  props?: NgpActionableProps,
  opts?: { injector?: Injector; element?: ElementRef<HTMLElement> },
): NgpActionableState;
```

#### NgpActionableProps

| Property                | Type                      | Description                                  |
| ----------------------- | ------------------------- | -------------------------------------------- |
| `disabled`              | `Signal<boolean>`         | Whether the element is disabled.             |
| `focusableWhenDisabled` | `Signal<boolean>`         | Keep element focusable when disabled.        |
| `ariaDisabled`          | `Signal<boolean \| null>` | Override automatic aria-disabled management. |
| `tabIndex`              | `Signal<number \| null>`  | Override automatic tabindex management.      |

#### NgpActionableState

| Property                   | Type                            | Description                            |
| -------------------------- | ------------------------------- | -------------------------------------- |
| `disabled`                 | `Signal<boolean>`               | Current disabled state.                |
| `focusableWhenDisabled`    | `Signal<boolean>`               | Current focusable when disabled state. |
| `ariaDisabled`             | `Signal<boolean \| null>`       | Current aria-disabled value.           |
| `tabIndex`                 | `Signal<number \| null>`        | Current tabindex value.                |
| `setDisabled`              | `SignalMethod<boolean>`         | Set disabled state.                    |
| `setFocusableWhenDisabled` | `SignalMethod<boolean>`         | Set focusable when disabled state.     |
| `setAriaDisabled`          | `SignalMethod<boolean \| null>` | Set aria-disabled value.               |
| `setTabIndex`              | `SignalMethod<number \| null>`  | Set tabindex value.                    |

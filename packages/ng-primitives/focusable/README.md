# ng-primitives/focusable

Make any element focusable and properly handle disabled states.

## Why This Package Exists

Native HTML `<button>` elements have built-in focus and disabled handling, but many UI patterns require using non-semantic elements (like `<div>` or `<span>`) as interactive controls. These elements lack:

- Proper focus management (need `tabindex` to be focusable)
- Accessible disabled states (native `disabled` removes from tab order)

Additionally, the native `disabled` attribute has limitations:

- Removes elements from tab order entirely, causing focus to be lost
- Cannot be used for loading states where focus should be retained

## Features

- **Focus management**: Makes non-native elements focusable via `tabindex`
- **Disabled state management**: Properly blocks interactions when disabled
- **Focus retention**: Optional `focusableWhenDisabled` keeps element in tab order
- **ARIA attributes**: Automatically manages `aria-disabled` and `tabindex`
- **Interaction states**: Integrates with `ngpInteractions` for hover, press, focus-visible
- **Configurable**: Fine-grained control over automatic attribute management

For Enter/Space key activation on non-native elements, use `NgpButton` which builds on this primitive.

## Installation

This package is a secondary entry point of `ng-primitives`. It can be used by importing from `ng-primitives/focusable`.

```typescript
import { NgpFocusable, ngpFocusable } from 'ng-primitives/focusable';
```

## Usage

The primary use case for `NgpFocusable` is managing loading states where focus must be retained. For general button-like elements, use `NgpButton` instead.

### Directive API

```html
<!-- Loading button that retains focus when disabled -->
<button
  ngpFocusable
  [ngpFocusableDisabled]="isLoading"
  [ngpFocusableWhenDisabled]="isLoading"
  (click)="submit()"
>
  {{ isLoading ? 'Saving...' : 'Save' }}
</button>

<!-- Custom tab that handles its own keyboard navigation -->
<div
  role="tab"
  ngpFocusable
  [ngpFocusableDisabled]="disabled"
  [attr.aria-selected]="selected"
  (keydown)="handleArrowKeys($event)"
>
  Tab Label
</div>
```

### Programmatic API

```typescript
import { ngpFocusable } from 'ng-primitives/focusable';

// In your directive or component
const state = ngpFocusable({
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

## Configuration

You can configure the automatic attribute management globally using `provideFocusableConfig`.

### Configuration Options

| Option                   | Default | Description                                        |
| ------------------------ | ------- | -------------------------------------------------- |
| `autoManageAriaDisabled` | `true`  | Automatically manage the `aria-disabled` attribute |
| `autoManageTabIndex`     | `true`  | Automatically manage the `tabindex` attribute      |

### Global Configuration

```typescript
import { provideFocusableConfig } from 'ng-primitives/focusable';

// In your app config
providers: [
  provideFocusableConfig({
    autoManageAriaDisabled: false, // Disable automatic aria-disabled management
    autoManageTabIndex: false, // Disable automatic tabindex management
  }),
];
```

## Data Attributes

The following data attributes are applied for CSS styling:

| Attribute                      | Applied When                                     |
| ------------------------------ | ------------------------------------------------ |
| `data-disabled`                | Element is disabled                              |
| `data-focusable-when-disabled` | Element remains focusable when disabled          |
| `data-hover`                   | Element is being hovered (via ngpInteractions)   |
| `data-press`                   | Element is being pressed (via ngpInteractions)   |
| `data-focus-visible`           | Element has keyboard focus (via ngpInteractions) |

## Accessibility

This primitive addresses several WCAG requirements:

- **WCAG 2.1.1 Keyboard**: All functionality is operable through keyboard
- **Focus Management**: Focus is not lost when elements become disabled
- **ARIA Semantics**: Proper `aria-disabled` and `tabindex` management

## References

- [MDN: Button Role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/button_role)
- [WCAG 2.1.1 Keyboard](https://www.w3.org/WAI/WCAG21/Understanding/keyboard.html)
- [MDN: aria-disabled](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-disabled)
- [WAI-ARIA Button Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/button/)

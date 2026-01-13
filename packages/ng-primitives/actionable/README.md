# ng-primitives/actionable

Make any element keyboard-accessible and properly handle disabled states.

## Why This Package Exists

Native HTML `<button>` elements have built-in keyboard support and disabled handling, but many UI patterns require using non-semantic elements (like `<div>` or `<span>`) as interactive controls. These elements lack:

- Keyboard operability (Enter/Space activation)
- Proper focus management
- Accessible disabled states

Additionally, the native `disabled` attribute has limitations:

- Removes elements from tab order entirely, causing focus to be lost
- Cannot be used for loading states where focus should be retained

## Features

- **Keyboard activation**: Adds Enter and Space key support to non-native elements
- **Disabled state management**: Properly blocks interactions when disabled
- **Focus retention**: Optional `focusableWhenDisabled` keeps element in tab order
- **ARIA attributes**: Automatically manages `aria-disabled` and `tabindex`
- **Interaction states**: Integrates with `ngpInteractions` for hover, press, focus-visible

## Installation

This package is a secondary entry point of `ng-primitives`. It can be used by importing from `ng-primitives/actionable`.

```typescript
import { NgpActionable, ngpActionable } from 'ng-primitives/actionable';
```

## Usage

### Directive API

```html
<!-- Basic usage on a div acting as a button -->
<div ngpActionable (click)="handleClick()">Click me</div>

<!-- With disabled state -->
<div ngpActionable [ngpActionableDisabled]="isDisabled" (click)="handleClick()">Click me</div>

<!-- Loading button that retains focus -->
<button
  ngpActionable
  [ngpActionableDisabled]="isLoading"
  [ngpActionableFocusableWhenDisabled]="true"
  (click)="submit()"
>
  {{ isLoading ? 'Loading...' : 'Submit' }}
</button>
```

### Programmatic API

```typescript
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

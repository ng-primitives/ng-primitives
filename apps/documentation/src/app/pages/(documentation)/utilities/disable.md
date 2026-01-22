---
name: 'Disable'
---

# Disable

Adds disabled behavior to any element with optional focusable-when-disabled support. This solves a critical accessibility problem: native `disabled` removes elements from focus, causing keyboard users to lose their place when buttons become disabled during async operations.

<docs-example name="disable"></docs-example>

## When to Use

**Most users won't need to import `NgpDisable` directly.** The [`NgpButton`](/primitives/button) directive already uses `NgpDisable` internally and exposes `disabled` and `focusableWhenDisabled` inputs.

```html
<!-- NgpButton includes disable behavior automatically -->
<button ngpButton [disabled]="loading()" [focusableWhenDisabled]="true">Submit</button>
```

Use `NgpDisable` directly when:

- You need disabled behavior on non-button elements (inputs, custom controls)
- You're building a custom primitive that doesn't extend `NgpButton`
- You want to compose disable behavior into a component via host directives

#### NgpButton Loading Example

Use `focusableWhenDisabled` to maintain focus during async operations. Without it, keyboard users lose their place when the button becomes disabled.

<docs-example name="button-loading"></docs-example>

## Import

Import the Disable primitive from `ng-primitives/disable`.

```ts
import { NgpDisable } from 'ng-primitives/disable';
```

## Usage

Apply the directive to any element that needs disabled behavior.

```html
<!-- When using in forms, ensure proper form validation handling -->
<button ngpDisable [disabled]="loading()" type="submit">Submit</button>
```

Keep the element focusable when disabled (useful for loading states):

```html
<button
  ngpDisable
  [disabled]="loading()"
  [focusableWhenDisabled]="true"
  (click)="load()"
  type="button"
>
  Loading...
</button>
```

<docs-snippet name="disable"></docs-snippet>

## Why This Exists

The native HTML `disabled` attribute removes elements from the tab order entirely. When a keyboard user activates a button that triggers an async operation:

1. User presses Enter on "Submit" button
2. Button becomes `disabled` during the API call
3. Focus is lost—user is now at an undefined position in the page
4. When the operation completes, user must re-navigate to continue

This violates WCAG 2.1.1 (Keyboard) because the user loses their navigation context.

### How Disable Solves This

| Behavior                             | Native `disabled` | NgpDisable           |
| ------------------------------------ | ----------------- | -------------------- |
| Blocks clicks and keyboard input     | ✅                | ✅                   |
| Communicates state to screen readers | ✅ (implicitly)   | ✅ (`aria-disabled`) |
| Remains in tab order                 | ❌                | ✅ (configurable)    |
| Preserves focus during state change  | ❌                | ✅                   |

## Common Use Cases

### Loading States

Maintain focus during async operations. See [Button Loading States](/primitives/button#loading-states) for complete examples.

```html
<button ngpButton [disabled]="loading()" [focusableWhenDisabled]="true" type="submit">
  {{ loading() ? 'Submitting...' : 'Submit' }}
</button>
```

### Error States with Context

Screen reader users may need to focus a disabled control to hear its associated error message.

```html
<input
  ngpDisable
  [disabled]="hasError()"
  [focusableWhenDisabled]="true"
  [attr.aria-describedby]="'error-' + fieldId"
  [attr.aria-invalid]="hasError()"
/>
<span [id]="'error-' + fieldId">This field is required</span>
```

### Temporary Unavailability

When an action is temporarily unavailable but users should understand why:

```html
<button
  ngpButton
  [disabled]="!canSubmit()"
  [focusableWhenDisabled]="true"
  aria-describedby="submit-help"
  type="submit"
>
  Submit
</button>
<span id="submit-help">Complete all required fields to enable submission</span>
```

## Host Directives

Use `NgpDisable` as a host directive to build reusable components with built-in loading state support.

```ts
@Component({
  selector: 'app-button',
  hostDirectives: [
    {
      directive: NgpDisable,
      inputs: ['disabled', 'focusableWhenDisabled', 'tabIndex'],
    },
  ],
  template: `
    <span class="spinner hidden data-disabled-focusable:inline-block"></span>
    <ng-content />
  `,
})
export class Button {}
```

Usage:

```html
<app-button [disabled]="formSubmitting()" [loading]="formSubmitting()">Submit</app-button>
```

## API Reference

The following directive is available from the `ng-primitives/disable` package:

### NgpDisable

<api-docs name="NgpDisable"></api-docs>

#### Data Attributes

Use these attributes in your CSS to style disabled states:

| Attribute                 | Description                                         |
| ------------------------- | --------------------------------------------------- |
| `data-disabled`           | Present when the element is disabled.               |
| `data-disabled-focusable` | Present when the element is disabled but focusable. |

```css
[data-disabled] {
  opacity: 0.6;
  cursor: not-allowed;
}

[data-disabled-focusable] {
  /* Loading indicator styles */
}
```

## Accessibility

This utility meets WCAG 2.1 requirements:

| Guideline               | Requirement                              | How NgpDisable Helps                              |
| ----------------------- | ---------------------------------------- | ------------------------------------------------- |
| 2.1.1 Keyboard          | All functionality available via keyboard | Element remains in tab order; Tab key still works |
| 2.4.7 Focus Visible     | Focus indicator visible                  | Focus styles apply normally to disabled elements  |
| 4.1.2 Name, Role, Value | State communicated to AT                 | Sets `aria-disabled="true"` for screen readers    |

### How It Works

When an element becomes disabled:

1. **`aria-disabled="true"`** is set, informing assistive technologies the element is non-interactive
2. **Events are blocked** in the capture phase: click, keydown (except Tab), pointerdown, and mousedown
3. **Tab navigation continues** when `focusableWhenDisabled` is true, allowing users to navigate away
4. **`tabindex` is managed** automatically—adjusted to `0` when focusable, `-1` when not focusable

When the element is no longer disabled, all values revert to their original state.

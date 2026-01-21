---
name: 'Soft Disabled'
---

# Soft Disabled

The Soft Disabled utility creates a synthetic disabled state that keeps elements focusable. This solves a critical accessibility problem: when users trigger an action (like submitting a form), the native `disabled` attribute removes the button from focus, causing keyboard users to lose their place in the page.

<docs-example name="soft-disabled"></docs-example>

## Import

Import the Soft Disabled primitive from `ng-primitives/soft-disabled`.

```ts
import { NgpSoftDisabled } from 'ng-primitives/soft-disabled';
```

## Usage

Apply the directive to any element that needs to be disabled while remaining focusable.

```html
<button ngpSoftDisabled [softDisabled]="loading()" softDisabledFocusable="true">Submit</button>
```

By default, `softDisabled` is `false` and `softDisabledFocusable` is `true`, so the simplest usage is:

```html
<button ngpSoftDisabled softDisabled>Disabled but Focusable</button>
```

<docs-snippet name="soft-disabled"></docs-snippet>

## Why Soft Disabled Exists

The native HTML `disabled` attribute has a significant accessibility limitation: it removes elements from the tab order entirely. While this is appropriate for permanently unavailable actions, it causes problems in several common scenarios.

### The Problem with Native Disabled

When a keyboard user activates a button that triggers an async operation:

1. User presses Enter on "Submit" button
2. Button becomes `disabled` during the API call
3. Focus is lost—the user is now at an undefined position in the page
4. When the operation completes, the user must re-navigate to continue

This violates WCAG 2.1.1 (Keyboard) because the user loses their navigation context.

### How Soft Disabled Solves This

`NgpSoftDisabled` creates a synthetic disabled state that:

| Behavior                             | Native `disabled` | Soft Disabled        |
| ------------------------------------ | ----------------- | -------------------- |
| Blocks clicks and keyboard input     | ✅                | ✅                   |
| Communicates state to screen readers | ✅ (implicitly)   | ✅ (`aria-disabled`) |
| Remains in tab order                 | ❌                | ✅ (configurable)    |
| Preserves focus during state change  | ❌                | ✅                   |

## Common Use Cases

### Loading States

The primary use case is maintaining focus during async operations. See [Button Loading States](/primitives/button#loading-states) for complete examples.

```html
<button ngpButton ngpSoftDisabled [softDisabled]="loading()" (click)="submit()">
  {{ loading() ? 'Submitting...' : 'Submit' }}
</button>
```

### Error States with Context

Screen reader users may need to focus a disabled control to hear its associated error message.

```html
<input
  ngpSoftDisabled
  [softDisabled]="hasError()"
  softDisabledFocusable="true"
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
  ngpSoftDisabled
  [softDisabled]="!canSubmit()"
  softDisabledFocusable="true"
  aria-describedby="submit-help"
>
  Submit
</button>
<span id="submit-help">Complete all required fields to enable submission</span>
```

## Avoiding Conflicting States

Do not combine native `disabled` with `NgpSoftDisabled` on the same element. These represent fundamentally different behaviors, and using both creates undefined behavior.

```html
<!-- ❌ Conflicting states - avoid this -->
<button ngpSoftDisabled softDisabled disabled>Undefined Behavior</button>

<!-- ✅ Use native disabled for permanently unavailable actions -->
<button ngpSoftDisabled softDisabled="false" disabled>Not Allowed</button>

<!-- ✅ Use soft disabled for temporary states -->
<button ngpSoftDisabled [softDisabled]="loading()">{{ loading() ? 'Saving...' : 'Save' }}</button>
```

**When to use which:**

- **Native `disabled`**: The action will never be available to this user (permissions, completed workflows)
- **Soft disabled**: The action is temporarily unavailable (loading, validation pending, rate limiting)

## Preserving Attribute Values

The `tabIndex` and `ariaDisabled` inputs initialize from the element's current properties and attributes. This allows you to set baseline values that are preserved and restored when the soft disabled state changes.

```html
<!-- tabindex="-1" is preserved when not soft disabled -->
<button ngpSoftDisabled [softDisabled]="loading()" tabindex="-1">Hidden from Tab Order</button>

<!-- When loading becomes true, tabindex adjusts to 0 (focusable) -->
<!-- When loading becomes false, tabindex reverts to -1 -->
```

## Host Directives

Use `NgpSoftDisabled` as a host directive to build reusable components with built-in loading state support.

```ts
@Component({
  selector: 'app-button',
  hostDirectives: [
    {
      directive: NgpSoftDisabled,
      inputs: [
        'softDisabled:loading',
        'softDisabledFocusable:focusable',
        'tabIndex',
        'ariaDisabled',
      ],
    },
    {
      directive: NgpButton,
      inputs: ['disabled'],
    },
  ],
  template: `
    <!-- Via Tailwind: only show spinner when soft disabled -->
    <span class="spinner hidden data-soft-disabled:inline-block"></span>
    <ng-content />
  `,
})
export class Button {}
```

Usage:

```html
<app-button [loading]="formSubmitting()">Submit</app-button>
```

## API Reference

The following directive is available from the `ng-primitives/soft-disabled` package:

### NgpSoftDisabled

<api-docs name="NgpSoftDisabled"></api-docs>

#### Data Attributes

Use these attributes in your CSS to style soft disabled states:

| Attribute                      | Description                                 |
| ------------------------------ | ------------------------------------------- |
| `data-soft-disabled`           | Present when the element is soft disabled.  |
| `data-soft-disabled-focusable` | Present when the element remains focusable. |

```css
[data-soft-disabled] {
  opacity: 0.6;
  cursor: not-allowed;
}
```

## Accessibility

This utility is designed to meet WCAG 2.1 requirements:

| Guideline               | Requirement                              | How Soft Disabled Helps                               |
| ----------------------- | ---------------------------------------- | ----------------------------------------------------- |
| 2.1.1 Keyboard          | All functionality available via keyboard | Element remains in tab order; Tab key still works     |
| 2.4.7 Focus Visible     | Focus indicator visible                  | Focus styles apply normally to soft disabled elements |
| 4.1.2 Name, Role, Value | State communicated to AT                 | Sets `aria-disabled="true"` for screen readers        |

### How It Works

When an element becomes soft disabled:

1. **`aria-disabled="true"`** is set, informing assistive technologies the element is non-interactive
2. **Events are blocked** in the capture phase: click, keydown (except Tab), pointerdown, and mousedown
3. **Tab navigation continues** when `softDisabledFocusable` is true (default), allowing users to navigate away
4. **`tabindex` is managed** automatically—negative values are adjusted to `0` when focusable, positive values to `-1` when not focusable

When the element is no longer soft disabled, all values revert to their original state.

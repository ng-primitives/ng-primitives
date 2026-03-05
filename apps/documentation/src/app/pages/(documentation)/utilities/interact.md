---
name: 'Interact'
sourceUrl: 'https://github.com/ng-primitives/ng-primitives/tree/next/packages/ng-primitives/interact'
---

# Interact

A low-level utility that manages accessible disabled state for any element. It handles focusability, ARIA attributes, and keyboard blocking—but leaves click and pointer handling to the implementor.

<docs-example name="interact"></docs-example>

## When to Use

**Most users won't need this directly.** [`NgpButton`](/primitives/button) already includes full disable behavior with `disabled` and `focusableWhenDisabled` inputs:

```html
<button ngpButton [disabled]="loading()" [focusableWhenDisabled]="true">Submit</button>
```

Use `NgpInteract` directly when:

- Building custom primitives that need disable behavior (and will handle click/pointer blocking themselves)
- Adding accessible disabled state to non-button elements (custom controls, toolbar items)
- Composing disable behavior via host directives

## Import

```ts
import { NgpInteract } from 'ng-primitives/interact';
```

## Usage

```html
<!-- Basic disabled state -->
<button ngpInteract [disabled]="isDisabled()">Submit</button>

<!-- Focusable when disabled (for loading states) -->
<button ngpInteract [disabled]="loading()" [focusableWhenDisabled]="true">
  {{ loading() ? 'Saving...' : 'Save' }}
</button>
```

> **Important:** `NgpInteract` blocks keyboard events (except Tab) but does **not** block clicks or pointer events. Implementors are responsible for handling those.

## The Problem with Native `disabled`

Native `disabled` removes elements from the tab order. When a keyboard user activates a button that becomes disabled:

1. User presses Enter on "Submit"
2. Button becomes `disabled` during the API call
3. **Focus is lost**—user is at an undefined position
4. User must re-navigate when the operation completes

This violates WCAG 2.1.1 (Keyboard) because the user loses navigation context.

## How NgpInteract Solves This

| Behavior                      | Native `disabled` | NgpInteract                     |
| ----------------------------- | ----------------- | ------------------------------- |
| Blocks keyboard (except Tab)  | ✅                | ✅                              |
| Communicates state to AT      | ✅ (implicit)     | ✅ (aria-disabled)              |
| Remains in tab order          | ❌                | ✅ (configurable)               |
| Preserves focus during change | ❌                | ✅                              |
| Blocks clicks and pointers    | ✅                | ❌ (implementor responsibility) |

## What NgpInteract Does Not Do

`NgpInteract` is intentionally minimal. It manages **state and focusability** but does not block clicks, pointer events, or mouse events. This is by design—different primitives need different interaction handling:

- **Buttons** block click, mousedown, and pointerdown
- **Menu items** may need to close the menu on disabled click
- **Custom controls** may have unique interaction patterns

Primitives like [`NgpButton`](/primitives/button) build on `NgpInteract` and add their own event blocking. When using `NgpInteract` directly, you must handle click/pointer blocking yourself:

```ts
listener(element, 'click', event => {
  if (disabled()) {
    event.preventDefault();
    event.stopImmediatePropagation();
  }
});
```

## Common Patterns

### Loading States

Maintain focus during async operations:

```html
<button ngpButton [disabled]="loading()" [focusableWhenDisabled]="true">
  {{ loading() ? 'Submitting...' : 'Submit' }}
</button>
```

See [Button Loading States](/primitives/button#loading-states) for complete examples.

### Disabled with Explanation

Let screen reader users focus disabled controls to hear why they're unavailable:

```html
<button
  ngpButton
  [disabled]="!canSubmit()"
  [focusableWhenDisabled]="true"
  aria-describedby="submit-help"
>
  Submit
</button>
<span id="submit-help">Complete all required fields to enable submission</span>
```

### Host Directives

Compose disable behavior into custom components. Note that you still need to handle click/pointer blocking in your component:

```ts
@Component({
  selector: 'app-button',
  hostDirectives: [
    {
      directive: NgpInteract,
      inputs: ['disabled', 'focusableWhenDisabled', 'tabIndex'],
    },
  ],
  template: `
    <ng-content />
  `,
})
export class Button {}
```

## API Reference

### NgpInteract

<api-docs name="NgpInteract"></api-docs>

#### Data Attributes

| Attribute                 | Description                                  |
| ------------------------- | -------------------------------------------- |
| `data-disabled`           | Present when the element is disabled.        |
| `data-disabled-focusable` | Present when disabled but remains focusable. |

```css
[data-disabled] {
  opacity: 0.5;
  cursor: not-allowed;
}

[data-disabled-focusable] {
  /* Loading indicator styles */
}
```

## How It Works

When an element becomes disabled, `NgpInteract` handles:

1. **`aria-disabled="true"`** informs assistive technologies
2. **Keyboard events are blocked** (except Tab) to prevent focus traps
3. **`tabindex`** is adjusted based on `focusableWhenDisabled`
4. **`data-disabled`** and **`data-disabled-focusable`** attributes are set for styling

Native buttons also receive the `disabled` attribute (unless `focusableWhenDisabled` is true, which requires keeping the element focusable).

Click, pointer, and mouse events are **not** blocked by `NgpInteract`—implementors handle these based on their specific needs. For example, [`NgpButton`](/primitives/button) adds click, mousedown, and pointerdown blocking on top of `NgpInteract`.

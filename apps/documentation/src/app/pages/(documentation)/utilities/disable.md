---
name: 'Disable'
sourceUrl: 'https://github.com/ng-primitives/ng-primitives/tree/next/packages/ng-primitives/disable'
---

# Disable

Adds accessible disabled behavior to any element. Unlike native `disabled` which removes elements from the tab order, this utility optionally keeps elements focusable—critical for loading states and tooltips.

<docs-example name="disable"></docs-example>

## When to Use

**Most users won't need this directly.** [`NgpButton`](/primitives/button) already includes disable behavior with `disabled` and `focusableWhenDisabled` inputs:

```html
<button ngpButton [disabled]="loading()" [focusableWhenDisabled]="true">Submit</button>
```

Use `NgpDisable` directly when:

- Building custom primitives that don't extend `NgpButton`
- Adding disable behavior to non-button elements (inputs, custom controls)
- Composing disable behavior via host directives

## Import

```ts
import { NgpDisable } from 'ng-primitives/disable';
```

## Usage

```html
<!-- Basic disabled state -->
<button ngpDisable [disabled]="isDisabled()">Submit</button>

<!-- Focusable when disabled (for loading states) -->
<button ngpDisable [disabled]="loading()" [focusableWhenDisabled]="true">
  {{ loading() ? 'Saving...' : 'Save' }}
</button>
```

## The Problem with Native `disabled`

Native `disabled` removes elements from the tab order. When a keyboard user activates a button that becomes disabled:

1. User presses Enter on "Submit"
2. Button becomes `disabled` during the API call
3. **Focus is lost**—user is at an undefined position
4. User must re-navigate when the operation completes

This violates WCAG 2.1.1 (Keyboard) because the user loses navigation context.

## How NgpDisable Solves This

| Behavior                      | Native `disabled` | NgpDisable         |
| ----------------------------- | ----------------- | ------------------ |
| Blocks clicks and keyboard    | ✅                | ✅                 |
| Communicates state to AT      | ✅ (implicit)     | ✅ (aria-disabled) |
| Remains in tab order          | ❌                | ✅ (configurable)  |
| Preserves focus during change | ❌                | ✅                 |

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

Compose disable behavior into custom components:

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
    <ng-content />
  `,
})
export class Button {}
```

## API Reference

### NgpDisable

<api-docs name="NgpDisable"></api-docs>

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

When an element becomes disabled:

1. **`aria-disabled="true"`** informs assistive technologies
2. **Events are blocked**: click, keydown (except Tab), pointerdown, mousedown
3. **Tab always works** to prevent focus traps
4. **`tabindex`** is adjusted based on `focusableWhenDisabled`

Native buttons also receive the `disabled` attribute (unless `focusableWhenDisabled` is true, which requires keeping the element focusable).

---
name: 'Focus Trap'
---

# Focus Trap

The Focus Trap utility is a directive that traps focus within a specified element. This is useful for modals, dropdowns, and other components that require focus to be contained within a specific area.

<docs-example name="focus-trap"></docs-example>

## Import

Import the FocusTrap primitives from `ng-primitives/focus-trap`.

```ts
import { NgpFocusTrap } from 'ng-primitives/focus-trap';
```

## Usage

Assemble the focus-trap directives in your template.

```html
<div ngpFocusTrap></div>
```

## API Reference

The following directives are available to import from the `ng-primitives/focus-trap` package:

### NgpFocusTrap

The `NgpFocusTrap` directive traps focus within the host element.

- Selector: `[ngpFocusTrap]`
- Exported As: `ngpFocusTrap`

<response-field name="ngpFocusTrapDisabled" type="boolean">
  Disables the focus trap.
</response-field>

#### Data Attributes

| Attribute         | Description              | Value             |
| ----------------- | ------------------------ | ----------------- |
| `data-focus-trap` | Disables the focus trap. | `true` \| `false` |

## Accessibility

Adheres to the [WAI-ARIA design pattern](https://www.w3.org/TR/UNDERSTANDING-WCAG20/keyboard-operation-trapping.html).

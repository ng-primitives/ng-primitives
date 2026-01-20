---
name: 'Focus Trap'
sourceUrl: 'https://github.com/ng-primitives/ng-primitives/tree/main/packages/ng-primitives/utilities/focus-trap'
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

<api-docs name="NgpFocusTrap"></api-docs>

#### Data Attributes

| Attribute         | Description                    |
| ----------------- | ------------------------------ |
| `data-focus-trap` | Applied when focus is trapped. |

## Accessibility

Adheres to the [WAI-ARIA design pattern](https://www.w3.org/TR/UNDERSTANDING-WCAG20/keyboard-operation-trapping.html).

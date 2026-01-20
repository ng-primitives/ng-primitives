---
name: 'Roving Focus'
sourceUrl: 'https://github.com/ng-primitives/ng-primitives/tree/next/packages/ng-primitives/roving-focus'
---

# Roving Focus

Handle focus for a group of elements.

<docs-example name="roving-focus"></docs-example>

## Import

Import the Roving Focus primitives from `ng-primitives/roving-focus`.

```ts
import { NgpRovingFocusGroup, NgpRovingFocusItem } from 'ng-primitives/roving-focus';
```

## Usage

Assemble the roving focus directives in your template.

```html
<div ngpRovingFocusGroup>
  <button ngpRovingFocusItem>Item 1</button>
  <button ngpRovingFocusItem>Item 2</button>
  <button ngpRovingFocusItem>Item 3</button>
</div>
```

## API Reference

The following directives are available to import from the `ng-primitives/roving-focus` package:

### NgpRovingFocusGroup

<api-docs name="NgpRovingFocusGroup"></api-docs>

### NgpRovingFocusItem

<api-docs name="NgpRovingFocusItem"></api-docs>

## Accessibility

Adheres to the [WAI-ARIA Keyboard Interface Practices](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/).

### Keyboard Interactions

- <kbd>Tab</kbd> - Move focus to the first item.
- <kbd>ArrowLeft</kbd> - Move focus to the previous item (horizontal orientation).
- <kbd>ArrowUp</kbd> - Move focus to the previous item (vertical orientation).
- <kbd>ArrowRight</kbd> - Move focus to the next item (horizontal orientation).
- <kbd>ArrowDown</kbd> - Move focus to the next item (vertical orientation).
- <kbd>Home</kbd> - Move focus to the first item.
- <kbd>End</kbd> - Move focus to the last item.

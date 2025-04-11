---
name: 'Roving Focus'
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

Apply the `ngpRovingFocusGroup` directive to an element to manage focus for a group of child elements.

- Selector: `[ngpRovingFocusGroup]`
- Exported As: `ngpRovingFocusGroup`

<prop-details name="ngpRovingFocusGroupOrientation" type="'horizontal' | 'vertical'" default="horizontal">
  Define the orientation of the roving focus group.
</prop-details>

<prop-details name="ngpRovingFocusGroupWrap" type="boolean">
  Define whether the focus should wrap around the group.
</prop-details>

<prop-details name="ngpRovingFocusGroupHomeEnd" type="boolean">
  Define whether the focus should move to the first or last element when pressing the Home or End key.
</prop-details>

<prop-details name="ngpRovingFocusGroupDisabled" type="boolean">
  Define whether the roving focus group is disabled.
</prop-details>

### NgpRovingFocusItem

Apply the `ngpRovingFocusItem` directive to an element within a roving focus group to automatically manage focus.

- Selector: `[ngpRovingFocusItem]`
- Exported As: `ngpRovingFocusItem`

<prop-details name="ngpRovingFocusItemDisabled" type="boolean">
  Define whether the roving focus item is disabled.
</prop-details>

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

---
title: 'Roving Focus'
---

# Roving Focus

Handle focus for a group of elements.

<docs-example name="roving-focus"></docs-example>

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

<response-field name="ngpRovingFocusGroupOrientation" type="'horizontal' | 'vertical'" default="horizontal">
  Define the orientation of the roving focus group.
</response-field>

<response-field name="ngpRovingFocusGroupWrap" type="boolean">
  Define whether the focus should wrap around the group.
</response-field>

<response-field name="ngpRovingFocusGroupHomeEnd" type="boolean">
  Define whether the focus should move to the first or last element when pressing the Home or End key.
</response-field>

<response-field name="ngpRovingFocusGroupDisabled" type="boolean">
  Define whether the roving focus group is disabled.
</response-field>

### NgpRovingFocusItem

Apply the `ngpRovingFocusItem` directive to an element within a roving focus group to automatically manage focus.

- Selector: `[ngpRovingFocusItem]`
- Exported As: `ngpRovingFocusItem`

<response-field name="ngpRovingFocusItemDisabled" type="boolean">
  Define whether the roving focus item is disabled.
</response-field>

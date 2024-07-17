---
title: 'Radio'
---

# Radio

Selection within a group.

<docs-example name="radio"></docs-example>

## Import

Import the Radio primitives from `ng-primitives/radio`.

```ts
import { NgpRadioGroup, NgpRadioItem, NgpRadioIndicator } from 'ng-primitives/radio';
```

## Usage

Assemble the radio directives in your template.

```html
<div ngpRadioGroup [(ngpRadioGroupValue)]="value">
  <button ngpRadioItem ngpRadioItemValue="Option 1">
    <ng-icon ngpRadioIndicator name="dot" />
    Option 1
  </button>

  <button ngpRadioItem ngpRadioItemValue="Option 2">
    <ng-icon ngpRadioIndicator name="dot" />
    Option 2
  </button>

  <button ngpRadioItem ngpRadioItemValue="Option 3">
    <ng-icon ngpRadioIndicator name="dot" />
    Option 3
  </button>
</div>
```

## API Reference

The following directives are available to import from the `ng-primitives/radio` package:

### NgpRadioGroup

Apply the `ngpRadioGroup` directive to an element that represents the group of radio items.

- Selector: `[ngpRadioGroup]`
- Exported As: `ngpRadioGroup`

<response-field name="ngpRadioGroupValue" type="string | undefined">
  Define the selected value.
</response-field>

<response-field name="ngpRadioGroupDisabled" type="boolean" default="false">
  Define the disabled state.
</response-field>

<response-field name="ngpRadioGroupOrientation" type="'vertical' | 'horizontal'" default="horizontal"> Define the orientation.</response-field>

<response-field name="ngpRadioGroupValueChange" type="boolean">
  Event emitted when the selection changes.
</response-field>

### NgpRadioItem

Apply the `ngpRadioItem` directive to an element that represents a radio item. This would typically be a `button` element.

- Selector: `[ngpRadioItem]`
- Exported As: `ngpRadioItem`

<response-field name="ngpRadioItemValue" type="string" required="true">
  Define the value of this item.
</response-field>

<response-field name="ngpRadioItemDisabled" type="boolean" default="false">
  Define the disabled state.
</response-field>

### NgpRadioIndicator

Apply the `ngpRadioIndicator` directive to an element that represents the radio indicator (i.e. the dot).

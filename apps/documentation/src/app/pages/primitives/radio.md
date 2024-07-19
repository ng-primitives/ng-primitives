---
name: 'Radio'
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

#### Data Attributes

The following data attributes are applied to the `ngpRadioGroup` directive:

| Attribute          | Description                           | Value                      |
| ------------------ | ------------------------------------- | -------------------------- |
| `data-orientation` | The orientation of the radio group.   | `vertical` \| `horizontal` |
| `data-disabled`    | The disabled state of the radio item. | `true` \| `false`          |

#### Data Attributes

The following data attributes are applied to the `ngpRadioItem` directive:

| Attribute            | Description                           | Value             |
| -------------------- | ------------------------------------- | ----------------- |
| `data-checked`       | The checked state of the radio item.  | `true` \| `false` |
| `data-disabled`      | The disabled state of the radio item. | `true` \| `false` |
| `data-hover`         | The hover state of the radio item.    | `true` \| `false` |
| `data-focus-visible` | The focus state of the radio item.    | `true` \| `false` |
| `data-press`         | The press state of the radio item.    | `true` \| `false` |

### NgpRadioIndicator

Apply the `ngpRadioIndicator` directive to an element that represents the radio indicator (i.e. the dot).

#### Data Attributes

The following data attributes are applied to the `ngpRadioItem` directive:

| Attribute       | Description                             | Value             |
| --------------- | --------------------------------------- | ----------------- |
| `data-checked`  | The checked state of the radio item.    | `true` \| `false` |
| `data-disabled` | The disabled state of the radio item.   | `true` \| `false` |
| `data-hover`    | The hover state of the radio indicator. | `true` \| `false` |
| `data-press`    | The press state of the radio indicator. | `true` \| `false` |

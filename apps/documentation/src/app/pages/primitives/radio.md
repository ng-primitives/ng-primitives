---
title: 'Radio'
---

# Radio

Selection within a group.

<docs-example name="radio"></docs-example>

## Usage

Assemble the radio directives in your template.

```html
<div ngpRadioGroup [(ngpRadioGroupValue)]="value">
  <button ngpRadioItem ngpRadioItem="Option 1">
    <ng-icon ngpRadioIndicator name="dot" />
    Option 1
  </button>

  <button ngpRadioItem ngpRadioItem="Option 2">
    <ng-icon ngpRadioIndicator name="dot" />
    Option 2
  </button>

  <button ngpRadioItem ngpRadioItem="Option 3">
    <ng-icon ngpRadioIndicator name="dot" />
    Option 3
  </button>
</div>
```

## API Reference

The following directives are available to import from the `@ng-primitives/ng-primitives/radio` package:

### NgpRadioGroup

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

<response-field name="ngpRadioItemValue" type="string" required="true">
  Define the value of this item.
</response-field>

<response-field name="ngpRadioItemDisabled" type="boolean" default="false">
  Define the disabled state.
</response-field>

### NgpRadioIndicator

There are no inputs or outputs for this directive.

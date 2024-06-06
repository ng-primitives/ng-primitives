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

### NgpRadioGroupDirective

<ResponseField name="ngpRadioGroupValue" type="string | undefined">
  Define the selected value.
</ResponseField>

<ResponseField name="ngpRadioGroupDisabled" type="boolean" default="false">
  Define the disabled state.
</ResponseField>

<ResponseField
name="ngpRadioGroupOrientation"
type="'vertical' | 'horizontal'"
default="horizontal"

> Define the orientation.
> </ResponseField>

<ResponseField name="ngpRadioGroupValueChange" type="boolean">
  Event emitted when the selection changes.
</ResponseField>

### NgpRadioItemDirective

<ResponseField name="ngpRadioItemValue" type="string" required="true">
  Define the value of this item.
</ResponseField>

<ResponseField name="ngpRadioItemDisabled" type="boolean" default="false">
  Define the disabled state.
</ResponseField>

### NgpRadioIndicatorDirective

There are no inputs or outputs for this directive.

### Options

<ResponseField name="name" type="string">
  The name of the component.
</ResponseField>

<ResponseField name="project" type="string">
  The name of the project to add the component to.
</ResponseField>

<ResponseField name="path" type="string">
  The path to create the component.
</ResponseField>

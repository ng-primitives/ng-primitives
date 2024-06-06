---
title: 'Checkbox'
---

# Checkbox

Perform state toggling.

<docs-example name="checkbox"></docs-example>

## Usage

Assemble the checkbox directives in your template.

```html
<button ngpCheckbox [(ngpCheckboxChecked)]="checked">
  <ng-icon ngpCheckboxIndicator name="checkmark" />
</button>
```

## API Reference

The following directives are available to import from the `@ng-primitives/ng-primitives/checkbox` package:

### NgpCheckbox

<response-field name="ngpCheckboxChecked" type="boolean" default="false">
  Define the checked state.
</response-field>

<response-field name="ngpCheckboxIndeterminate" type="boolean" default="false">
  Define the interminate state.
</response-field>

<response-field name="ngpCheckboxDisabled" type="boolean" default="false">
  Define the disabled state.
</response-field>

<response-field name="ngpCheckboxCheckedChange" type="boolean">
  Event emitted when the state changes.
</response-field>

<response-field name="ngpCheckboxIndeterminateChange" type="boolean">
  Event emitted when the indeterminate state changes.
</response-field>

### NgpCheckboxIndicator

There are no inputs or outputs for this directive.

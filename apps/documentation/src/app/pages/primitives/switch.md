---
title: 'Switch'
---

# Switch

Perform state toggling.

<docs-example name="switch"></docs-example>

## Usage

Assemble the switch directives in your template.

```html
<button ngpSwitch [(ngpSwitchChecked)]="checked">
  <span ngpSwitchThumb></span>
</button>
```

## API Reference

The following directives are available to import from the `@ng-primitives/ng-primitives/switch` package:

### NgpSwitch

<response-field name="ngpSwitchChecked" type="boolean" default="false">
  Define the checked state.
</response-field>

<response-field name="ngpSwitchDisabled" type="boolean" default="false">
  Define the disabled state.
</response-field>

<response-field name="ngpSwitchCheckedChange" type="boolean">
  Event emitted when the state changes.
</response-field>

### NgpSwitchThumb

There are no inputs or outputs for this directive.

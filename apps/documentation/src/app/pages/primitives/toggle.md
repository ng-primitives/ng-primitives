---
title: 'Toggle'
---

# Toggle

Toggle a button on and off.

<docs-example name="toggle"></docs-example>

## Usage

Assemble the toggle directives in your template.

```html
<button ngpToggle>Toggle</button>
```

## API Reference

The following directives are available to import from the `@ng-primitives/ng-primitives/toggle` package:

### NgpToggle

Apply the `ngpToggle` directive to an element to manage the toggle state. This must be applied to a `button` element.

<response-field name="ngpTogglePressed" type="boolean" default="false">
  Define the pressed state.
</response-field>

<response-field name="ngpToggleDisabled" type="boolean" default="false">
  Define the disabled state.
</response-field>

#### Data Attributes

The following data attributes are available to apply to the `ngpToggle` directive:

| Attribute       | Description                     | Value             |
| --------------- | ------------------------------- | ----------------- |
| `data-state`    | Define the state of the toggle. | `on` \| `off`     |
| `data-disabled` | Define the disabled state.      | `true` \| `false` |

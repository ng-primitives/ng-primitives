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

### NgpSwitchDirective

<ResponseField name="ngpSwitchChecked" type="boolean" default="false">
  Define the checked state.
</ResponseField>

<ResponseField name="ngpSwitchDisabled" type="boolean" default="false">
  Define the disabled state.
</ResponseField>

<ResponseField name="ngpSwitchCheckedChange" type="boolean">
  Event emitted when the state changes.
</ResponseField>

### NgpSwitchThumbDirective

There are no inputs or outputs for this directive.

## Schematics

You can use our schematic to generate a new switch component.

<CodeGroup>

```bash Angular CLI
ng generate @ng-primitives/ng-primitives:switch
```

```bash Nx
nx generate @ng-primitives/ng-primitives:switch
```

</CodeGroup>

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

---
title: 'Roving Focus'
description: 'Handle focus for a group of elements.'
---

# Roving Focus

Handle focus for a group of elements.

<docs-example name="roving-focus"></docs-example>

## Usage

Assemble the roving focus directives in your template.

```html
<div ngpRovingFocus></div>
```

## API Reference

The following directives are available to import from the `@ng-primitives/ng-primitives/roving-focus` package:

### NgpRovingFocusDirective

There are no inputs or outputs for this directive.

## Schematics

You can use our schematic to generate a new roving-focus component.

<CodeGroup>

```bash Angular CLI
ng generate @ng-primitives/ng-primitives:roving-focus
```

```bash Nx
nx generate @ng-primitives/ng-primitives:roving-focus
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

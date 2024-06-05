---
title: 'Progress'
---

# Progress

Display an indicator representing the progress of a task.

<docs-example name="progress"></docs-example>

## Usage

Assemble the avatar directives in your template.

```html
<div ngpProgress [ngpProgressValue]="percentage">
  <div ngpProgressIndicator [style.width.%]="percentage"></div>
</div>
```

## API Reference

The following directives are available to import from the `@ng-primitives/ng-primitives/progress` package:

### NgpProgressDirective

<ResponseField name="ngpProgressValue" type="number">
  Define the progress value.
</ResponseField>

<ResponseField name="ngpProgressMax" type="number" default="100">
  Define the progress max value.
</ResponseField>

<ResponseField name="ngpProgressValueLabel" type="(value: number, max: number) => string">
  Define a function that returns the progress value label.
</ResponseField>

### NgpProgressIndicatorDirective

There are no inputs or outputs for this directive.

## Schematics

You can use our schematic to generate a new progress component.

<CodeGroup>

```bash Angular CLI
ng generate @ng-primitives/ng-primitives:progress
```

```bash Nx
nx generate @ng-primitives/ng-primitives:progress
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

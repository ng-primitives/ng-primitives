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

### NgpProgress

<response-field name="ngpProgressValue" type="number">
  Define the progress value.
</response-field>

<response-field name="ngpProgressMax" type="number" default="100">
  Define the progress max value.
</response-field>

<response-field name="ngpProgressValueLabel" type="(value: number, max: number) => string">
  Define a function that returns the progress value label.
</response-field>

### NgpProgressIndicator

There are no inputs or outputs for this directive.

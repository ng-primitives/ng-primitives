---
name: 'Progress'
---

# Progress

Display an indicator representing the progress of a task.

<docs-example name="progress"></docs-example>

## Import

Import the Progress primitives from `ng-primitives/progress`.

```ts
import { NgpProgress, NgpProgressIndicator } from 'ng-primitives/progress';
```

## Usage

Assemble the avatar directives in your template.

```html
<div ngpProgress [ngpProgressValue]="percentage">
  <div ngpProgressIndicator [style.width.%]="percentage"></div>
</div>
```

## Reusable Component

Create a reusable component that uses the progress directives.

<docs-snippet name="progress"></docs-snippet>

## Schematics

Generate a reusable progress component using the Angular CLI.

```bash npm
ng g ng-primitives:primitive progress
```

## API Reference

The following directives are available to import from the `ng-primitives/progress` package:

### NgpProgress

Apply the `ngpProgress` directive to an element that represents the progress bar.

- Selector: `[ngpProgress]`
- Exported As: `ngpProgress`

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

Apply the `ngpProgressIndicator` directive to an element that represents the current progress.
The width of this element can be set to the percentage of the progress value.

- Selector: `[ngpProgressIndicator]`
- Exported As: `ngpProgressIndicator`

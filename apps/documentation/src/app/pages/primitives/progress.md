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

### Options

- `path`: The path at which to create the component file.
- `prefix`: The prefix to apply to the generated component selector.
- `componentSuffix`: The suffix to apply to the generated component class name.
- `fileSuffix`: The suffix to apply to the generated component file name. Defaults to `component`.
- `exampleStyles`: Whether to include example styles in the generated component file. Defaults to `true`.

## API Reference

The following directives are available to import from the `ng-primitives/progress` package:

### NgpProgress

<api-docs name="NgpProgress"></api-docs>

### NgpProgressIndicator

<api-docs name="NgpProgressIndicator"></api-docs>

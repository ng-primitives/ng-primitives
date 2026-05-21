---
name: 'Progress'
sourceUrl: 'https://github.com/ng-primitives/ng-primitives/tree/next/packages/ng-primitives/progress'
---

# Progress

Display an indicator representing the progress of a task.

<docs-example name="progress"></docs-example>

## Import

Import the Progress primitives from `ng-primitives/progress`.

```ts
import {
  NgpProgress,
  NgpProgressTrack,
  NgpProgressLabel,
  NgpProgressValue,
  NgpProgressIndicator,
} from 'ng-primitives/progress';
```

## Usage

Assemble the avatar directives in your template.

```html
<div ngpProgress [ngpProgressValue]="percentage">
  <label ngpProgressLabel></label>
  <span ngpProgressValue></span>

  <div ngpProgressTrack>
    <div ngpProgressIndicator></div>
  </div>
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
- `component-suffix`: The suffix to apply to the generated component class name.
- `file-suffix`: The suffix to apply to the generated component file name. Defaults to `component`.
- `example-styles`: Whether to include example styles in the generated component file. Defaults to `true`.

## API Reference

The following directives are available to import from the `ng-primitives/progress` package:

### NgpProgress

<api-docs name="NgpProgress"></api-docs>

<api-reference-props name="NgpProgress"></api-reference-props>

<api-reference-attributes>
  <api-attribute name="data-progressing" description="Indicates that the progress is in progress." />
  <api-attribute name="data-indeterminate" description="Indicates that the progress is indeterminate." />
  <api-attribute name="data-complete" description="Indicates that the progress is complete." />
</api-reference-attributes>

### NgpProgressIndicator

<api-docs name="NgpProgressIndicator"></api-docs>

<api-reference-props name="NgpProgressIndicator"></api-reference-props>

<api-reference-attributes>
  <api-attribute name="data-progressing" description="Indicates that the progress is in progress." />
  <api-attribute name="data-indeterminate" description="Indicates that the progress is indeterminate." />
  <api-attribute name="data-complete" description="Indicates that the progress is complete." />
</api-reference-attributes>

### NgpProgressTrack

<api-docs name="NgpProgressTrack"></api-docs>

<api-reference-props name="NgpProgressTrack"></api-reference-props>

<api-reference-attributes>
  <api-attribute name="data-progressing" description="Indicates that the progress is in progress." />
  <api-attribute name="data-indeterminate" description="Indicates that the progress is indeterminate." />
  <api-attribute name="data-complete" description="Indicates that the progress is complete." />
</api-reference-attributes>

### NgpProgressLabel

<api-docs name="NgpProgressLabel"></api-docs>

<api-reference-props name="NgpProgressLabel"></api-reference-props>

<api-reference-attributes>
  <api-attribute name="data-progressing" description="Indicates that the progress is in progress." />
  <api-attribute name="data-indeterminate" description="Indicates that the progress is indeterminate." />
  <api-attribute name="data-complete" description="Indicates that the progress is complete." />
</api-reference-attributes>

### NgpProgressValue

<api-docs name="NgpProgressValue"></api-docs>

<api-reference-props name="NgpProgressValue"></api-reference-props>

<api-reference-attributes>
  <api-attribute name="data-progressing" description="Indicates that the progress is in progress." />
  <api-attribute name="data-indeterminate" description="Indicates that the progress is indeterminate." />
  <api-attribute name="data-complete" description="Indicates that the progress is complete." />
</api-reference-attributes>

## Accessibility

Adheres to the [WAI-ARIA Progressbar](https://www.w3.org/WAI/ARIA/apg/patterns/progressbar/) pattern.

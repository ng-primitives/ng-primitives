---
name: 'Meter'
sourceUrl: 'https://github.com/ng-primitives/ng-primitives/tree/next/packages/ng-primitives/meter'
---

# Meter

A meter is a visual representation of a value within a range.

<docs-example name="meter"></docs-example>

## Import

Import the Meter primitives from `ng-primitives/meter`.

```ts
import {
  NgpMeter,
  NgpMeterValue,
  NgpMeterIndicator,
  NgpMeterTrack,
  NgpMeterLabel,
} from 'ng-primitives/meter';
```

## Usage

Assemble the meter directives in your template.

```html
<div ngpMeter>
  <span ngpMeterLabel>Label</span>
  <span ngpMeterValue>Value</span>
  <div ngpMeterTrack>
    <div ngpMeterIndicator></div>
  </div>
</div>
```

## Reusable Component

Create a reusable component that uses the `NgpMeter` directive.

<docs-snippet name="meter"></docs-snippet>

## Schematics

Generate a reusable meter component using the Angular CLI.

```bash npm
ng g ng-primitives:primitive meter
```

### Options

- `path`: The path at which to create the component file.
- `prefix`: The prefix to apply to the generated component selector.
- `component-suffix`: The suffix to apply to the generated component class name.
- `file-suffix`: The suffix to apply to the generated component file name. Defaults to `component`.
- `example-styles`: Whether to include example styles in the generated component file. Defaults to `true`.

## API Reference

The following directives are available to import from the `ng-primitives/meter` package:

### NgpMeter

<api-docs name="NgpMeter"></api-docs>

<api-reference-props name="NgpMeter"></api-reference-props>

### NgpMeterLabel

<api-docs name="NgpMeterLabel"></api-docs>

<api-reference-props name="NgpMeterLabel"></api-reference-props>

### NgpMeterValue

<api-docs name="NgpMeterValue"></api-docs>

<api-reference-props name="NgpMeterValue"></api-reference-props>

### NgpMeterTrack

<api-docs name="NgpMeterTrack"></api-docs>

<api-reference-props name="NgpMeterTrack"></api-reference-props>

### NgpMeterIndicator

<api-docs name="NgpMeterIndicator"></api-docs>

<api-reference-props name="NgpMeterIndicator"></api-reference-props>

## Accessibility

Adheres to the [Meter Accessibility](https://www.w3.org/WAI/ARIA/apg/patterns/meter/) guidelines.

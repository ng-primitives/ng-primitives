---
name: 'Meter'
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
- `componentSuffix`: The suffix to apply to the generated component class name.
- `fileSuffix`: The suffix to apply to the generated component file name. Defaults to `component`.
- `exampleStyles`: Whether to include example styles in the generated component file. Defaults to `true`.

## API Reference

The following directives are available to import from the `ng-primitives/meter` package:

### NgpMeter

<api-docs name="NgpMeter" />

### NgpMeterLabel

<api-docs name="NgpMeterLabel" />

### NgpMeterValue

<api-docs name="NgpMeterValue" />

### NgpMeterTrack

<api-docs name="NgpMeterTrack" />

### NgpMeterIndicator

<api-docs name="NgpMeterIndicator" />

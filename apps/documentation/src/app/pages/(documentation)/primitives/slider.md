---
name: 'Slider'
sourceUrl: 'https://github.com/ng-primitives/ng-primitives/tree/next/packages/ng-primitives/slider'
---

# Slider

Select a value within a range.

<docs-example name="slider"></docs-example>

## Import

Import the Slider primitives from `ng-primitives/slider`.

```ts
import { NgpSlider, NgpSliderTrack, NgpSliderRange, NgpSliderThumb } from 'ng-primitives/slider';
```

## Usage

Assemble the slider directives in your template.

```html
<div ngpSlider>
  <div ngpSliderTrack>
    <div ngpSliderRange></div>
  </div>
  <div ngpSliderThumb></div>
</div>
```

## Reusable Component

Create a reusable component that uses the slider directives.

<docs-snippet name="slider"></docs-snippet>

## Schematics

Generate a reusable slider component using the Angular CLI.

```bash npm
ng g ng-primitives:primitive slider
```

### Options

- `path`: The path at which to create the component file.
- `prefix`: The prefix to apply to the generated component selector.
- `component-suffix`: The suffix to apply to the generated component class name.
- `file-suffix`: The suffix to apply to the generated component file name. Defaults to `component`.
- `example-styles`: Whether to include example styles in the generated component file. Defaults to `true`.

## Examples

Here are some additional examples of how to use the Slider primitives.

### Vertical Slider

Display the slider in a vertical orientation by setting `ngpSliderOrientation="vertical"`.

<docs-example name="slider-vertical"></docs-example>

### Slider Thumb Tooltip

Display the current value in a tooltip that follows the slider thumb. Use `ngpTooltipTriggerTrackPosition` to enable smooth position updates during drag.

<docs-example name="slider-tooltip"></docs-example>

### Slider Track Tooltip

Display a preview tooltip as you hover over the track, showing what value would be selected at that position. The tooltip also appears on the thumb during drag. Uses `ngpTooltipTriggerPosition` for programmatic positioning.

<docs-example name="slider-track-tooltip"></docs-example>

### Slider Form Field

The slider automatically integrates with the form field primitives.

<docs-example name="slider-form-field"></docs-example>

## API Reference

The following directives are available to import from the `ng-primitives/slider` package:

### NgpSlider

<api-docs name="NgpSlider"></api-docs>

<api-reference-props name="NgpSlider"></api-reference-props>

<api-reference-attributes>
  <api-attribute name="data-disabled" description="Applied when the slider is disabled." />
  <api-attribute name="data-orientation" description="The orientation of the slider." value="horizontal | vertical" />
</api-reference-attributes>

### NgpSliderTrack

<api-docs name="NgpSliderTrack"></api-docs>

<api-reference-props name="NgpSliderTrack"></api-reference-props>

<api-reference-attributes>
  <api-attribute name="data-disabled" description="Applied when the slider is disabled." />
  <api-attribute name="data-orientation" description="The orientation of the slider." value="horizontal | vertical" />
</api-reference-attributes>

### NgpSliderRange

<api-docs name="NgpSliderRange"></api-docs>

<api-reference-props name="NgpSliderRange"></api-reference-props>

<api-reference-attributes>
  <api-attribute name="data-disabled" description="Applied when the slider is disabled." />
  <api-attribute name="data-orientation" description="The orientation of the slider." value="horizontal | vertical" />
</api-reference-attributes>

### NgpSliderThumb

<api-docs name="NgpSliderThumb"></api-docs>

<api-reference-props name="NgpSliderThumb"></api-reference-props>

<api-reference-attributes>
  <api-attribute name="data-orientation" description="The orientation of the slider." value="horizontal | vertical" />
  <api-attribute name="data-disabled" description="Applied when the slider is disabled." />
  <api-attribute name="data-hover" description="Applied when the slider thumb is hovered." />
  <api-attribute name="data-focus-visible" description="Applied when the slider thumb is focused." />
  <api-attribute name="data-press" description="Applied when the slider thumb is pressed." />
</api-reference-attributes>

## Accessibility

Adheres to the [Slider WAI-ARIA design pattern](https://www.w3.org/WAI/ARIA/apg/patterns/slider-multithumb).

### Keyboard Interactions

- <kbd>Left Arrow</kbd> or <kbd>Down Arrow</kbd>: Decrease the value by the step.
- <kbd>Right Arrow</kbd> or <kbd>Up Arrow</kbd>: Increase the value by the step.
- <kbd>Left Arrow</kbd> or <kbd>Down Arrow</kbd> + <kbd>Shift</kbd>: Decrease the value by the step by a larger amount.
- <kbd>Right Arrow</kbd> or <kbd>Up Arrow</kbd> + <kbd>Shift</kbd>: Increase the value by the step by a larger amount.
- <kbd>Home</kbd>: Set the value to the minimum.
- <kbd>End</kbd>: Set the value to the maximum.

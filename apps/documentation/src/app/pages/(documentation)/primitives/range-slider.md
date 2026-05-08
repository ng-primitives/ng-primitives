---
name: 'Range Slider'
sourceUrl: 'https://github.com/ng-primitives/ng-primitives/tree/next/packages/ng-primitives/range-slider'
---

# Range Slider

Select a range of values within a defined range.

<docs-example name="range-slider"></docs-example>

## Import

Import the Range Slider primitives from `ng-primitives/slider`.

```ts
import {
  NgpRangeSlider,
  NgpRangeSliderTrack,
  NgpRangeSliderRange,
  NgpRangeSliderThumb,
} from 'ng-primitives/slider';
```

## Usage

Assemble the range slider directives in your template.

```html
<div ngpRangeSlider>
  <div ngpRangeSliderTrack>
    <div ngpRangeSliderRange></div>
  </div>
  <div ngpRangeSliderThumb></div>
  <div ngpRangeSliderThumb></div>
</div>
```

## Examples

Here are some additional examples of how to use the Range Slider primitives.

### Vertical Range Slider

Display the range slider in a vertical orientation by setting `ngpRangeSliderOrientation="vertical"`.

<docs-example name="range-slider-vertical"></docs-example>

## API Reference

The following directives are available to import from the `ng-primitives/slider` package:

### NgpRangeSlider

<api-docs name="NgpRangeSlider"></api-docs>

<api-reference-props name="NgpRangeSlider"></api-reference-props>

<api-reference-attributes>
  <api-attribute name="data-disabled" description="Applied when the range slider is disabled." />
  <api-attribute name="data-orientation" description="The orientation of the range slider." value="horizontal | vertical" />
</api-reference-attributes>

### NgpRangeSliderTrack

<api-docs name="NgpRangeSliderTrack"></api-docs>

<api-reference-props name="NgpRangeSliderTrack"></api-reference-props>

<api-reference-attributes>
  <api-attribute name="data-disabled" description="Applied when the range slider is disabled." />
  <api-attribute name="data-orientation" description="The orientation of the range slider." value="horizontal | vertical" />
</api-reference-attributes>

### NgpRangeSliderRange

<api-docs name="NgpRangeSliderRange"></api-docs>

<api-reference-props name="NgpRangeSliderRange"></api-reference-props>

<api-reference-attributes>
  <api-attribute name="data-disabled" description="Applied when the range slider is disabled." />
  <api-attribute name="data-orientation" description="The orientation of the range slider." value="horizontal | vertical" />
</api-reference-attributes>

### NgpRangeSliderThumb

<api-docs name="NgpRangeSliderThumb"></api-docs>

<api-reference-props name="NgpRangeSliderThumb"></api-reference-props>

<api-reference-attributes>
  <api-attribute name="data-orientation" description="The orientation of the range slider." value="horizontal | vertical" />
  <api-attribute name="data-disabled" description="Applied when the range slider is disabled." />
  <api-attribute name="data-hover" description="Applied when the slider thumb is hovered." />
  <api-attribute name="data-focus-visible" description="Applied when the slider thumb is focused." />
  <api-attribute name="data-press" description="Applied when the slider thumb is pressed." />
  <api-attribute name="data-thumb" description="Indicates which value this thumb controls." value="low | high" />
</api-reference-attributes>

## Accessibility

Adheres to the [Multi-Thumb Slider WAI-ARIA design pattern](https://www.w3.org/WAI/ARIA/apg/patterns/slider-multithumb).

### Keyboard Interactions

Each thumb can be focused and controlled independently:

- <kbd>Left Arrow</kbd> or <kbd>Down Arrow</kbd>: Decrease the value by the step.
- <kbd>Right Arrow</kbd> or <kbd>Up Arrow</kbd>: Increase the value by the step.
- <kbd>Left Arrow</kbd> or <kbd>Down Arrow</kbd> + <kbd>Shift</kbd>: Decrease the value by the step by a larger amount.
- <kbd>Right Arrow</kbd> or <kbd>Up Arrow</kbd> + <kbd>Shift</kbd>: Increase the value by the step by a larger amount.
- <kbd>Home</kbd>: Set the value to the minimum.
- <kbd>End</kbd>: Set the value to the maximum.

### Mouse Interactions

- Clicking on the track moves the closest thumb to that position.
- Dragging a thumb updates its corresponding value while respecting the boundaries (low ≤ high).

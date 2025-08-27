---
name: 'Range Slider'
---

# Range Slider

Select a range of values within a defined range.

<!-- <docs-example name="range-slider-vertical"></docs-example> -->

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

## API Reference

The following directives are available to import from the `ng-primitives/slider` package:

### NgpRangeSlider

<api-docs name="NgpRangeSlider"></api-docs>

#### Data Attributes

The following data attributes are available to style the range slider:

| Attribute          | Description                                | Value                      |
| ------------------ | ------------------------------------------ | -------------------------- |
| `data-disabled`    | Applied when the range slider is disabled. | `-`                        |
| `data-orientation` | The orientation of the range slider.       | `horizontal` \| `vertical` |

### NgpRangeSliderTrack

<api-docs name="NgpRangeSliderTrack"></api-docs>

#### Data Attributes

The following data attributes are available to style the slider track:

| Attribute          | Description                                | Value                      |
| ------------------ | ------------------------------------------ | -------------------------- |
| `data-disabled`    | Applied when the range slider is disabled. | `-`                        |
| `data-orientation` | The orientation of the range slider.       | `horizontal` \| `vertical` |

### NgpRangeSliderRange

<api-docs name="NgpRangeSliderRange"></api-docs>

#### Data Attributes

The following data attributes are available to style the slider range:

| Attribute          | Description                                | Value                      |
| ------------------ | ------------------------------------------ | -------------------------- |
| `data-disabled`    | Applied when the range slider is disabled. | `-`                        |
| `data-orientation` | The orientation of the range slider.       | `horizontal` \| `vertical` |

### NgpRangeSliderThumb

<api-docs name="NgpRangeSliderThumb"></api-docs>

#### Data Attributes

The following data attributes are available to style the thumb:

| Attribute            | Description                                | Value                      |
| -------------------- | ------------------------------------------ | -------------------------- |
| `data-orientation`   | The orientation of the range slider.       | `horizontal` \| `vertical` |
| `data-disabled`      | Applied when the range slider is disabled. | `-`                        |
| `data-hover`         | Applied when the slider thumb is hovered.  | `-`                        |
| `data-focus-visible` | Applied when the slider thumb is focused.  | `-`                        |
| `data-press`         | Applied when the slider thumb is pressed.  | `-`                        |
| `data-thumb`         | Indicates which value this thumb controls. | `low` \| `high`            |

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

---
name: 'Slider'
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

## Examples

Here are some additional examples of how to use the Slider primitives.

### Slider Form Field

The slider automatically integrates with the form field primitives.

<docs-example name="slider-form-field"></docs-example>

## API Reference

The following directives are available to import from the `ng-primitives/slider` package:

### NgpSlider

Apply the `ngpSlider` directive to an element that represents the slider and contains the track, range, and thumb.

- Selector: `[ngpSlider]`
- Exported As: `ngpSlider`
- Host Directives: [NgpFormControl](/primitives/form-field)

<response-field name="ngpSliderValue" type="number">
  Define the selected value.
</response-field>

<response-field name="ngpSliderMin" type="number" default="0">
  Define the minimum value.
</response-field>

<response-field name="ngpSliderMax" type="number" default="100">
  Define the maximum value.
</response-field>

<response-field name="ngpSliderStep" type="number" default="1">
  Define the step value.
</response-field>

<response-field name="ngpSliderOrientation" type="'horizontal' | 'vertical'" default="horizontal">
  Define the orientation.
</response-field>

#### Data Attributes

The following data attributes are available to style the slider:

| Attribute          | Description                       | Value                      |
| ------------------ | --------------------------------- | -------------------------- |
| `data-disabled`    | The disabled state of the slider. | `true` \| `false`          |
| `data-orientation` | The orientation of the slider.    | `horizontal` \| `vertical` |

### NgpSliderTrack

Apply the `ngpSliderTrack` directive to an element that represents the track of the slider.

- Selector: `[ngpSliderTrack]`
- Exported As: `ngpSliderTrack`

#### Data Attributes

The following data attributes are available to style the slider track:

| Attribute          | Description                       | Value                      |
| ------------------ | --------------------------------- | -------------------------- |
| `data-disabled`    | The disabled state of the slider. | `true` \| `false`          |
| `data-orientation` | The orientation of the slider.    | `horizontal` \| `vertical` |

### NgpSliderRange

Apply the `ngpSliderRange` directive to an element that represents the range of the slider.

- Selector: `[ngpSliderRange]`
- Exported As: `ngpSliderRange`

#### Data Attributes

The following data attributes are available to style the slider range:

| Attribute          | Description                       | Value                      |
| ------------------ | --------------------------------- | -------------------------- |
| `data-disabled`    | The disabled state of the slider. | `true` \| `false`          |
| `data-orientation` | The orientation of the slider.    | `horizontal` \| `vertical` |

### NgpSliderThumb

Apply the `ngpSliderThumb` directive to an element that represents the thumb of the slider.

- Selector: `[ngpSliderThumb]`
- Exported As: `ngpSliderThumb`
- Host Directives: [NgpHover](/interactions/hover), [NgpFocusVisible](/interactions/focus-visible), [NgpPress](/interactions/press)

#### Data Attributes

The following data attributes are available to style the thumb:

| Attribute            | Description                            | Value                      |
| -------------------- | -------------------------------------- | -------------------------- |
| `data-orientation`   | The orientation of the slider.         | `horizontal` \| `vertical` |
| `data-disabled`      | The disabled state of the slider.      | `true` \| `false`          |
| `data-hover`         | The hover state of the slider thumb.   | `true` \| `false`          |
| `data-focus-visible` | The focus state of the slider thumb.   | `true` \| `false`          |
| `data-press`         | The pressed state of the slider thumb. | `true` \| `false`          |

## Accessibility

Adheres to the [Slider WAI-ARIA design pattern](https://www.w3.org/WAI/ARIA/apg/patterns/slider-multithumb).

### Keyboard Interactions

- <kbd>Left Arrow</kbd> or <kbd>Down Arrow</kbd>: Decrease the value by the step.
- <kbd>Right Arrow</kbd> or <kbd>Up Arrow</kbd>: Increase the value by the step.
- <kbd>Left Arrow</kbd> or <kbd>Down Arrow</kbd> + <kbd>Shift</kbd>: Decrease the value by the step by a larger amount.
- <kbd>Right Arrow</kbd> or <kbd>Up Arrow</kbd> + <kbd>Shift</kbd>: Increase the value by the step by a larger amount.
- <kbd>Home</kbd>: Set the value to the minimum.
- <kbd>End</kbd>: Set the value to the maximum.

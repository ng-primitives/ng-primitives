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
- `componentSuffix`: The suffix to apply to the generated component class name.
- `fileSuffix`: The suffix to apply to the generated component file name. Defaults to `component`.
- `exampleStyles`: Whether to include example styles in the generated component file. Defaults to `true`.

## Examples

Here are some additional examples of how to use the Slider primitives.

### Slider with Tooltip

Display the current value in a tooltip that follows the slider thumb. Use `ngpTooltipTriggerTrackPosition` to enable smooth position updates during drag.

<docs-example name="slider-tooltip"></docs-example>

### Slider Form Field

The slider automatically integrates with the form field primitives.

<docs-example name="slider-form-field"></docs-example>

## API Reference

The following directives are available to import from the `ng-primitives/slider` package:

### NgpSlider

<api-docs name="NgpSlider"></api-docs>

#### Data Attributes

The following data attributes are available to style the slider:

| Attribute          | Description                          | Value                      |
| ------------------ | ------------------------------------ | -------------------------- |
| `data-disabled`    | Applied when the slider is disabled. | `-`                        |
| `data-orientation` | The orientation of the slider.       | `horizontal` \| `vertical` |

### NgpSliderTrack

<api-docs name="NgpSliderTrack"></api-docs>

#### Data Attributes

The following data attributes are available to style the slider track:

| Attribute          | Description                          | Value                      |
| ------------------ | ------------------------------------ | -------------------------- |
| `data-disabled`    | Applied when the slider is disabled. | `-`                        |
| `data-orientation` | The orientation of the slider.       | `horizontal` \| `vertical` |

### NgpSliderRange

<api-docs name="NgpSliderRange"></api-docs>

#### Data Attributes

The following data attributes are available to style the slider range:

| Attribute          | Description                          | Value                      |
| ------------------ | ------------------------------------ | -------------------------- |
| `data-disabled`    | Applied when the slider is disabled. | `-`                        |
| `data-orientation` | The orientation of the slider.       | `horizontal` \| `vertical` |

### NgpSliderThumb

<api-docs name="NgpSliderThumb"></api-docs>

#### Data Attributes

The following data attributes are available to style the thumb:

| Attribute            | Description                               | Value                      |
| -------------------- | ----------------------------------------- | -------------------------- |
| `data-orientation`   | The orientation of the slider.            | `horizontal` \| `vertical` |
| `data-disabled`      | Applied when the slider is disabled.      | `-`                        |
| `data-hover`         | Applied when the slider thumb is hovered. | `-`                        |
| `data-focus-visible` | Applied when the slider thumb is focused. | `-`                        |
| `data-press`         | Applied when the slider thumb is pressed. | `-`                        |

## API Reference

The following directives are available to import from the `ng-primitives/slider` package:

## Accessibility

Adheres to the [Slider WAI-ARIA design pattern](https://www.w3.org/WAI/ARIA/apg/patterns/slider-multithumb).

### Keyboard Interactions

- <kbd>Left Arrow</kbd> or <kbd>Down Arrow</kbd>: Decrease the value by the step.
- <kbd>Right Arrow</kbd> or <kbd>Up Arrow</kbd>: Increase the value by the step.
- <kbd>Left Arrow</kbd> or <kbd>Down Arrow</kbd> + <kbd>Shift</kbd>: Decrease the value by the step by a larger amount.
- <kbd>Right Arrow</kbd> or <kbd>Up Arrow</kbd> + <kbd>Shift</kbd>: Increase the value by the step by a larger amount.
- <kbd>Home</kbd>: Set the value to the minimum.
- <kbd>End</kbd>: Set the value to the maximum.

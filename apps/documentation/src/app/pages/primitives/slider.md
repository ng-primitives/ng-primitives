---
title: 'Slider'
---

# Slider

Select a value within a range.

<docs-example name="slider"></docs-example>

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

## API Reference

The following directives are available to import from the `@ng-primitives/ng-primitives/slider` package:

### NgpSlider

Apply the `ngpSlider` directive to an element that represents the slider and contains the track, range, and thumb.

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

### NgpSliderTrack

Apply the `ngpSliderTrack` directive to an element that represents the track of the slider.

### NgpSliderRange

Apply the `ngpSliderRange` directive to an element that represents the range of the slider.

### NgpSliderThumb

Apply the `ngpSliderThumb` directive to an element that represents the thumb of the slider.

#### Data Attributes

The following data attributes are available to style the thumb:

| Attribute          | Description                       | Value                      |
| ------------------ | --------------------------------- | -------------------------- |
| `data-orientation` | The orientation of the slider.    | `horizontal` \| `vertical` |
| `data-disabled`    | The disabled state of the slider. | `true` \| `false`          |

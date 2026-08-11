---
title: Color Picker | Angular Primitives
name: 'Color Picker'
sourceUrl: 'https://github.com/ng-primitives/ng-primitives/tree/next/packages/ng-primitives/color'
---

# Color Picker

A composable, accessible color picker: a 2D area, channel sliders and hex/channel fields that share one color value.

**Note:** The color primitives are currently experimental. The API may change in future releases.

<docs-example name="color-picker"></docs-example>

## Import

Import the color primitives from `ng-primitives/color`.

```ts
import {
  Color,
  NgpColorPicker,
  NgpColorArea,
  NgpColorAreaThumb,
  NgpColorSlider,
  NgpColorSliderTrack,
  NgpColorSliderThumb,
  NgpColorField,
} from 'ng-primitives/color';
```

## Usage

`NgpColorPicker` is an optional coordinator: it holds a single color value and shares it with any color
components nested inside it. Each color component also works standalone with its own `value`/`valueChange`.

```html
<div [(ngpColorPickerValue)]="color" ngpColorPicker>
  <!-- adjust two channels on a 2D surface -->
  <div ngpColorArea ngpColorAreaXChannel="saturation" ngpColorAreaYChannel="brightness">
    <div ngpColorAreaThumb></div>
  </div>

  <!-- adjust the hue -->
  <div ngpColorSlider ngpColorSliderChannel="hue">
    <div ngpColorSliderTrack></div>
    <div ngpColorSliderThumb></div>
  </div>

  <!-- edit the hex value -->
  <input ngpColorField />
</div>
```

## Color values

Color values are represented by an immutable `Color` object. Parse one from any CSS color string with
`Color.parse`, and read it back in any format with the `to*` methods.

```ts
import { Color } from 'ng-primitives/color';

const color = Color.parse('#f01e2b'); // hex, rgb(a), hsl(a) and hsb(a) are all supported
color.toHex(); // '#f01e2b'
color.toRgb(); // 'rgb(240, 30, 43)'
color.toHsl(); // 'hsl(356, 88%, 53%)'
color.getRed(); // 240  (or color.getChannelValue('red'))
color.withRed(0); // a new Color, original unchanged
color.withAlpha(0.5).toRgba(); // 'rgba(240, 30, 43, 0.5)'
```

Reads and derivations auto-convert across spaces, so `color.getHue()` and `color.withHue(200)`
(or the generic `getChannelValue`/`withChannelValue`) work regardless of the color's current space
(ambiguous channels resolve to hsb).

The `value` inputs and `valueChange` outputs are always a `Color`, so bind `[(ngpColorPickerValue)]` to a
`Color` (use `Color.parse('#f01e2b')` to create one from a string).

## Gradients

The area and sliders compute their functional gradient and expose it as a CSS custom property, which you opt
into as a background:

- `NgpColorArea` sets `--ngp-color-area-background`.
- `NgpColorSlider` sets `--ngp-color-slider-background` (it inherits down to the track).

```css
[ngpColorArea] {
  background: var(--ngp-color-area-background);
}
[ngpColorSliderTrack] {
  background: var(--ngp-color-slider-background);
}
```

The area background is tuned for the default `saturation` × `brightness` pairing. If you set different
`xChannel`/`yChannel` values, provide your own `background` for the area rather than relying on the var.

## Examples

Here are some additional examples of how to use the color primitives.

### Standalone Slider

A color slider works on its own, without a color picker, adjusting a single channel of its own value.

<docs-example name="color-slider"></docs-example>

### Alpha Slider

Set the channel to `alpha` and layer the gradient over a checkerboard to edit transparency.

<docs-example name="color-slider-alpha"></docs-example>

### Channel Fields

Give `NgpColorField` a channel to edit that channel as a number. Nested in a picker, the fields stay in sync.

<docs-example name="color-field"></docs-example>

### Color Wheel

`NgpColorWheel` is a circular alternative to a hue slider. Position the thumb with the `--ngp-color-wheel-hue` angle.

<docs-example name="color-wheel"></docs-example>

### Swatch Picker

`NgpColorSwatchPicker` presents a set of predefined colors as a keyboard-navigable, single-select list.

<docs-example name="color-swatch-picker"></docs-example>

### Popover

Pair the picker with a [popover](/primitives/popover) so a swatch button opens the full picker on demand.

<docs-example name="color-picker-popover"></docs-example>

## API Reference

The following directives are available to import from the `ng-primitives/color` package:

### NgpColorPicker

<api-docs name="NgpColorPicker"></api-docs>

<api-reference-props name="NgpColorPicker"></api-reference-props>

### NgpColorArea

<api-docs name="NgpColorArea"></api-docs>

<api-reference-props name="NgpColorArea"></api-reference-props>

<api-reference-attributes>
  <api-attribute name="data-disabled" description="Applied when the area is disabled." />
</api-reference-attributes>

### NgpColorAreaThumb

<api-docs name="NgpColorAreaThumb"></api-docs>

<api-reference-props name="NgpColorAreaThumb"></api-reference-props>

<api-reference-attributes>
  <api-attribute name="data-disabled" description="Applied when the area is disabled." />
  <api-attribute name="data-hover" description="Applied when the thumb is hovered." />
  <api-attribute name="data-focus-visible" description="Applied when the thumb is focused via the keyboard." />
  <api-attribute name="data-press" description="Applied when the thumb is pressed." />
</api-reference-attributes>

### NgpColorSlider

<api-docs name="NgpColorSlider"></api-docs>

<api-reference-props name="NgpColorSlider"></api-reference-props>

<api-reference-attributes>
  <api-attribute name="data-disabled" description="Applied when the slider is disabled." />
  <api-attribute name="data-orientation" description="The orientation of the slider." value="horizontal | vertical" />
</api-reference-attributes>

### NgpColorSliderTrack

<api-docs name="NgpColorSliderTrack"></api-docs>

<api-reference-props name="NgpColorSliderTrack"></api-reference-props>

### NgpColorSliderThumb

<api-docs name="NgpColorSliderThumb"></api-docs>

<api-reference-props name="NgpColorSliderThumb"></api-reference-props>

<api-reference-attributes>
  <api-attribute name="data-disabled" description="Applied when the slider is disabled." />
  <api-attribute name="data-orientation" description="The orientation of the slider." value="horizontal | vertical" />
  <api-attribute name="data-hover" description="Applied when the thumb is hovered." />
  <api-attribute name="data-focus-visible" description="Applied when the thumb is focused via the keyboard." />
  <api-attribute name="data-press" description="Applied when the thumb is pressed." />
</api-reference-attributes>

### NgpColorField

<api-docs name="NgpColorField"></api-docs>

<api-reference-props name="NgpColorField"></api-reference-props>

### NgpColorWheel

A circular control adjusting the hue channel. Set its background to `var(--ngp-color-wheel-background)`.

<api-docs name="NgpColorWheel"></api-docs>

<api-reference-props name="NgpColorWheel"></api-reference-props>

<api-reference-attributes>
  <api-attribute name="data-disabled" description="Applied when the wheel is disabled." />
</api-reference-attributes>

### NgpColorWheelThumb

The draggable thumb within a color wheel. Position it with the `--ngp-color-wheel-hue` custom property.

<api-docs name="NgpColorWheelThumb"></api-docs>

<api-reference-props name="NgpColorWheelThumb"></api-reference-props>

<api-reference-attributes>
  <api-attribute name="data-disabled" description="Applied when the wheel is disabled." />
  <api-attribute name="data-hover" description="Applied when the thumb is hovered." />
  <api-attribute name="data-focus-visible" description="Applied when the thumb is focused via the keyboard." />
  <api-attribute name="data-press" description="Applied when the thumb is pressed." />
</api-reference-attributes>

### NgpColorSwatch

A non-interactive preview of a color. Set its background to `var(--ngp-color-swatch-color)`.

<api-docs name="NgpColorSwatch"></api-docs>

<api-reference-props name="NgpColorSwatch"></api-reference-props>

### NgpColorSwatchPicker

A single-select list of color swatches with roving-focus keyboard navigation.

<api-docs name="NgpColorSwatchPicker"></api-docs>

<api-reference-props name="NgpColorSwatchPicker"></api-reference-props>

<api-reference-attributes>
  <api-attribute name="data-orientation" description="The orientation of the swatch list." value="horizontal | vertical" />
  <api-attribute name="data-disabled" description="Applied when the swatch picker is disabled." />
</api-reference-attributes>

### NgpColorSwatchPickerItem

A selectable swatch within a swatch picker. Set its background to `var(--ngp-color-swatch-color)`.

<api-docs name="NgpColorSwatchPickerItem"></api-docs>

<api-reference-props name="NgpColorSwatchPickerItem"></api-reference-props>

<api-reference-attributes>
  <api-attribute name="data-selected" description="Applied when the swatch is the selected color." />
  <api-attribute name="data-disabled" description="Applied when the swatch is disabled." />
  <api-attribute name="data-hover" description="Applied when the swatch is hovered." />
  <api-attribute name="data-focus-visible" description="Applied when the swatch is focused via the keyboard." />
  <api-attribute name="data-press" description="Applied when the swatch is pressed." />
</api-reference-attributes>

## Accessibility

Adheres to the [Slider WAI-ARIA design pattern](https://www.w3.org/WAI/ARIA/apg/patterns/slider/).

The area, sliders and wheel each expose a `slider` role. The color area is a two-dimensional control, so
its thumb additionally exposes an `aria-valuetext` describing both channels (for example
`saturation 50, brightness 70`). The swatch picker uses a `listbox` role with selectable `option` swatches.

### Keyboard Interactions

On a slider or the wheel, all four arrows adjust its single channel:

- <kbd>Left Arrow</kbd> / <kbd>Down Arrow</kbd>: Decrease the channel by the step.
- <kbd>Right Arrow</kbd> / <kbd>Up Arrow</kbd>: Increase the channel by the step.
- <kbd>Home</kbd> / <kbd>End</kbd>: Set the channel to its minimum / maximum.

On the color area, the horizontal and vertical arrows adjust separate channels:

- <kbd>Left Arrow</kbd> / <kbd>Right Arrow</kbd>: Decrease / increase the x channel.
- <kbd>Down Arrow</kbd> / <kbd>Up Arrow</kbd>: Decrease / increase the y channel.

For all of the above:

- <kbd>Shift</kbd> + arrow: Adjust by a larger amount.
- <kbd>Enter</kbd> / <kbd>Space</kbd>: Select the focused swatch (swatch picker).

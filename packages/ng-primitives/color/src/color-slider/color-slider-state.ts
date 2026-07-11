import { FocusOrigin } from '@angular/cdk/a11y';
import { computed, Signal, signal, WritableSignal } from '@angular/core';
import { NgpOrientation } from 'ng-primitives/common';
import { injectElementRef } from 'ng-primitives/internal';
import { ngpSlider } from 'ng-primitives/slider';
import {
  controlled,
  createPrimitive,
  emitter,
  SetterOptions,
  styleBinding,
} from 'ng-primitives/state';
import { uniqueId } from 'ng-primitives/utils';
import { Observable } from 'rxjs';
import { injectColorPickerState } from '../color-picker/color-picker-state';
import { Color, ColorChannel, ColorChannelRange, ColorSpace } from '../color/color';

/**
 * Public state surface for the Color Slider primitive.
 *
 * A color slider composes the underlying {@link ngpSlider} primitive, mapping a single
 * color channel to a numeric slider value. The slider parts (track, thumb) are the
 * standard slider parts and read the composed slider state directly.
 */
export interface NgpColorSliderState {
  /** The id of the slider. */
  readonly id: Signal<string>;
  /** The current color value (the parent picker's value when inside one). */
  readonly value: Signal<Color>;
  /** The channel this slider adjusts. */
  readonly channel: Signal<ColorChannel>;
  /** The color space the slider operates in (resolved from the channel/value if not set). */
  readonly colorSpace: Signal<ColorSpace>;
  /** The current value of the adjusted channel. */
  readonly channelValue: Signal<number>;
  /** The range (min/max/step) of the adjusted channel. */
  readonly channelRange: Signal<ColorChannelRange>;
  /** The thumb position as a percentage (0-100). */
  readonly percentage: Signal<number>;
  /** A CSS gradient representing the channel across its range. */
  readonly gradient: Signal<string>;
  /** The slider orientation. */
  readonly orientation: WritableSignal<NgpOrientation>;
  /** Whether the slider is disabled (includes form control state). */
  readonly disabled: WritableSignal<boolean>;
  /** Emits when the value changes. */
  readonly valueChange: Observable<Color>;
  /** Set the full color value. */
  setValue(value: Color, options?: SetterOptions): void;
  /** Focus the thumb element. */
  focusThumb(origin: FocusOrigin): void;
  /** Set the disabled state. */
  setDisabled(disabled: boolean): void;
  /** Set the orientation. */
  setOrientation(orientation: NgpOrientation): void;
}

/**
 * Inputs for configuring the Color Slider primitive.
 */
export interface NgpColorSliderProps {
  readonly id?: Signal<string>;
  readonly value?: Signal<Color>;
  readonly channel?: Signal<ColorChannel>;
  readonly colorSpace?: Signal<ColorSpace | undefined>;
  readonly orientation?: Signal<NgpOrientation>;
  readonly disabled?: Signal<boolean>;
  readonly onValueChange?: (value: Color) => void;
}

/** Resolve the color space to operate in from the channel, an explicit override, and the value's own space. */
function resolveColorSpace(
  channel: ColorChannel,
  explicit: ColorSpace | undefined,
  valueSpace: ColorSpace,
): ColorSpace {
  if (explicit) {
    return explicit;
  }
  switch (channel) {
    case 'red':
    case 'green':
    case 'blue':
      return 'rgb';
    case 'lightness':
      return 'hsl';
    case 'brightness':
      return 'hsb';
    case 'hue':
    case 'saturation':
      return valueSpace === 'hsl' ? 'hsl' : 'hsb';
    case 'alpha':
      return valueSpace;
  }
}

export const [
  NgpColorSliderStateToken,
  ngpColorSlider,
  injectColorSliderState,
  provideColorSliderState,
] = createPrimitive(
  'NgpColorSlider',
  ({
    id = signal(uniqueId('ngp-color-slider')),
    value: _value = signal(Color.parse('#ff0000')),
    channel = signal<ColorChannel>('hue'),
    colorSpace: _colorSpace = signal<ColorSpace | undefined>(undefined),
    orientation = signal<NgpOrientation>('horizontal'),
    disabled = signal(false),
    onValueChange,
  }: NgpColorSliderProps): NgpColorSliderState => {
    const element = injectElementRef();
    // Bind to a parent color picker when present, otherwise own the value locally.
    const picker = injectColorPickerState({ optional: true });
    const local = controlled(_value);
    const value = computed(() => picker()?.value() ?? local());
    const valueChange = emitter<Color>();

    const colorSpace = computed(() =>
      resolveColorSpace(channel(), _colorSpace(), value().getColorSpace()),
    );
    // the value converted into the space we operate in, so the channel is readable/writable
    const converted = computed(() => value().toFormat(colorSpace()));
    const channelRange = computed(() => converted().getChannelRange(channel()));
    const channelValue = computed(() => converted().getChannelValue(channel()));

    // Compose the numeric slider: it owns percentage, clamping/stepping, track/thumb
    // registration, keyboard, drag, focus, orientation and form-control state. We only
    // translate the adjusted channel to and from a Color value.
    const slider = ngpSlider({
      id,
      value: channelValue,
      min: computed(() => channelRange().min),
      max: computed(() => channelRange().max),
      step: computed(() => channelRange().step),
      orientation,
      disabled,
      onValueChange: channelNumber =>
        setValue(converted().withChannelValue(channel(), channelNumber)),
    });

    const gradient = computed(() =>
      channelGradient(converted(), channel(), channelRange(), slider.orientation()),
    );

    // Expose the channel gradient as a custom property; it inherits down to the track.
    styleBinding(element, '--ngp-color-slider-background', gradient);

    function setValue(newValue: Color, options?: SetterOptions): void {
      const parent = picker();
      if (parent) {
        parent.setValue(newValue, options);
      } else {
        local.set(newValue);
      }
      if (options?.emit !== false) {
        onValueChange?.(newValue);
        valueChange.emit(newValue);
      }
    }

    return {
      id,
      value,
      channel,
      colorSpace,
      channelValue,
      channelRange,
      percentage: slider.percentage,
      gradient,
      orientation: slider.orientation,
      disabled: slider.disabled,
      valueChange: valueChange.asObservable(),
      setValue,
      focusThumb: slider.focusThumb,
      setDisabled: slider.setDisabled,
      setOrientation: slider.setOrientation,
    } satisfies NgpColorSliderState;
  },
);

/** Build a CSS `linear-gradient` sampling `channel` across its range, holding the other channels. */
function channelGradient(
  color: Color,
  channel: ColorChannel,
  range: ColorChannelRange,
  orientation: NgpOrientation,
): string {
  // ponytail: fixed stop counts — hue needs many samples to render the spectrum,
  // lightness needs a midpoint (black→color→white), the rest read fine as endpoints.
  const stops = channel === 'hue' ? 12 : channel === 'lightness' ? 2 : 1;
  const direction = orientation === 'horizontal' ? 'to right' : 'to top';
  const parts: string[] = [];
  for (let i = 0; i <= stops; i++) {
    const channelValue = range.min + ((range.max - range.min) * i) / stops;
    parts.push(color.withChannelValue(channel, channelValue).toRgba());
  }
  return `linear-gradient(${direction}, ${parts.join(', ')})`;
}

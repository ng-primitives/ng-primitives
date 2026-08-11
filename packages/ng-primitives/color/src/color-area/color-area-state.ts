import { FocusMonitor, FocusOrigin } from '@angular/cdk/a11y';
import { DOCUMENT } from '@angular/common';
import {
  computed,
  ElementRef,
  inject,
  Injector,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import { ngpFormControl } from 'ng-primitives/form-field';
import { injectElementRef } from 'ng-primitives/internal';
import {
  attrBinding,
  controlled,
  controlledState,
  createPrimitive,
  dataBinding,
  emitter,
  listener,
  SetterOptions,
  styleBinding,
} from 'ng-primitives/state';
import { uniqueId } from 'ng-primitives/utils';
import { Observable } from 'rxjs';
import { injectColorPickerState } from '../color-picker/color-picker-state';
import { Color, ColorChannel, ColorChannelRange, ColorSpace } from '../color/color';

/**
 * Public state surface for the Color Area primitive - a 2D surface adjusting two channels
 * of a color value against a gradient background.
 */
export interface NgpColorAreaState {
  /** The id of the area. */
  readonly id: Signal<string>;
  /** The current color value (the parent picker's value when inside one). */
  readonly value: Signal<Color>;
  /** The channel mapped to the horizontal axis. */
  readonly xChannel: Signal<ColorChannel>;
  /** The channel mapped to the vertical axis. */
  readonly yChannel: Signal<ColorChannel>;
  /** The color space the area operates in. */
  readonly colorSpace: Signal<ColorSpace>;
  /** The current value of the x channel. */
  readonly xValue: Signal<number>;
  /** The current value of the y channel. */
  readonly yValue: Signal<number>;
  /** The range of the x channel. */
  readonly xRange: Signal<ColorChannelRange>;
  /** The range of the y channel. */
  readonly yRange: Signal<ColorChannelRange>;
  /** The thumb horizontal position as a percentage (0-100). */
  readonly xPercentage: Signal<number>;
  /** The thumb vertical position as a percentage (0-100, 0 = top). */
  readonly yPercentage: Signal<number>;
  /** A CSS background representing the 2D gradient. */
  readonly gradient: Signal<string>;
  /** Whether the area is disabled (includes form control state). */
  readonly disabled: WritableSignal<boolean>;
  /** @internal The thumb element reference. */
  readonly thumb: Signal<ElementRef<HTMLElement> | undefined>;
  /** Emits when the value changes. */
  readonly valueChange: Observable<Color>;
  /** Set the full color value. */
  setValue(value: Color, options?: SetterOptions): void;
  /** Set both channels to values (clamped + stepped). */
  setChannels(xValue: number, yValue: number, options?: SetterOptions): void;
  /** Adjust a single channel by a delta (clamped + stepped). */
  adjustChannel(channel: ColorChannel, delta: number, options?: SetterOptions): void;
  /** @internal Register the thumb element. */
  setThumb(thumb: ElementRef<HTMLElement> | undefined): void;
  /** Focus the thumb element. */
  focusThumb(origin: FocusOrigin): void;
  /** Set the disabled state. */
  setDisabled(disabled: boolean): void;

  /** Set the default value used in uncontrolled mode. */
  setDefaultValue(value: Color): void;
}

/**
 * Inputs for configuring the Color Area primitive.
 */
export interface NgpColorAreaProps {
  readonly id?: Signal<string>;
  readonly value?: Signal<Color | undefined>;
  /** The default color value for uncontrolled usage. */
  readonly defaultValue?: Signal<Color>;
  readonly xChannel?: Signal<ColorChannel>;
  readonly yChannel?: Signal<ColorChannel>;
  readonly colorSpace?: Signal<ColorSpace | undefined>;
  readonly disabled?: Signal<boolean>;
  readonly onValueChange?: (value: Color) => void;
}

const spaceOfChannel: Record<ColorChannel, ColorSpace | undefined> = {
  red: 'rgb',
  green: 'rgb',
  blue: 'rgb',
  lightness: 'hsl',
  brightness: 'hsb',
  hue: undefined,
  saturation: undefined,
  alpha: undefined,
};

/** Resolve the working space from the two channels, an explicit override, and the value's space. */
function resolveColorSpace(
  xChannel: ColorChannel,
  yChannel: ColorChannel,
  explicit: ColorSpace | undefined,
  valueSpace: ColorSpace,
): ColorSpace {
  return explicit ?? spaceOfChannel[xChannel] ?? spaceOfChannel[yChannel] ?? valueSpace;
}

function clampStep(value: number, { min, max, step }: ColorChannelRange): number {
  const clamped = Math.min(max, Math.max(min, value));
  const stepped = Math.round((clamped - min) / step) * step + min;
  return Math.min(max, Math.max(min, stepped));
}

function percentage(value: number, { min, max }: ColorChannelRange): number {
  const range = max - min;
  return range <= 0 ? 0 : Math.min(100, Math.max(0, ((value - min) / range) * 100));
}

export const [NgpColorAreaStateToken, ngpColorArea, injectColorAreaState, provideColorAreaState] =
  createPrimitive(
    'NgpColorArea',
    ({
      id = signal(uniqueId('ngp-color-area')),
      value: _value = signal<Color | undefined>(undefined),
      defaultValue: _defaultValue,
      xChannel = signal<ColorChannel>('saturation'),
      yChannel = signal<ColorChannel>('brightness'),
      colorSpace: _colorSpace = signal<ColorSpace | undefined>(undefined),
      disabled: _disabled = signal(false),
      onValueChange,
    }: NgpColorAreaProps): NgpColorAreaState => {
      const element = injectElementRef<HTMLElement>();
      const focusMonitor = inject(FocusMonitor);
      const injector = inject(Injector);
      const document = inject(DOCUMENT);
      // Bind to a parent color picker when present, otherwise own the value locally.
      const picker = injectColorPickerState({ optional: true });
      const defaultValue = controlled(_defaultValue, Color.parse('hsb(0, 100%, 100%)'));
      const [local, setLocal] = controlledState<Color>({ value: _value, defaultValue });
      const value = computed(() => picker()?.value() ?? local());
      const disabled = controlled(_disabled);
      const valueChange = emitter<Color>();
      const thumb = signal<ElementRef<HTMLElement> | undefined>(undefined);

      const status = ngpFormControl({ id, disabled });

      const colorSpace = computed(() =>
        resolveColorSpace(xChannel(), yChannel(), _colorSpace(), value().getColorSpace()),
      );
      const converted = computed(() => value().toFormat(colorSpace()));
      const xRange = computed(() => converted().getChannelRange(xChannel()));
      const yRange = computed(() => converted().getChannelRange(yChannel()));
      const xValue = computed(() => converted().getChannelValue(xChannel()));
      const yValue = computed(() => converted().getChannelValue(yChannel()));
      const xPercentage = computed(() => percentage(xValue(), xRange()));
      const yPercentage = computed(() => percentage(yValue(), yRange()));

      const gradient = computed(() =>
        areaGradient(converted(), xChannel(), yChannel(), xRange(), yRange()),
      );

      // Host bindings
      attrBinding(element, 'id', id);
      dataBinding(element, 'data-disabled', () => status().disabled);
      styleBinding(element, '--ngp-color-area-background', gradient);

      let dragging = false;
      let activePointerId: number | null = null;
      let cleanup: (() => void)[] = [];

      // Pointer down anywhere on the surface positions the thumb and begins a drag.
      listener(element, 'pointerdown', (event: PointerEvent) => {
        if (status().disabled) {
          return;
        }
        event.preventDefault();
        dragging = true;
        activePointerId = event.pointerId;
        setFromPointer(event);
        focusThumb(event.pointerType === 'touch' ? 'touch' : 'mouse');

        cleanup.forEach(fn => fn());
        cleanup = [
          listener(document, 'pointermove', onPointerMove, { config: false, injector }),
          listener(document, 'pointerup', onPointerEnd, { config: false, injector }),
          listener(document, 'pointercancel', onPointerEnd, { config: false, injector }),
        ];
      });

      function onPointerMove(event: PointerEvent): void {
        if (status().disabled || !dragging || event.pointerId !== activePointerId) {
          return;
        }
        setFromPointer(event);
      }

      function onPointerEnd(event: PointerEvent): void {
        if (event.pointerId !== activePointerId) {
          return;
        }
        dragging = false;
        activePointerId = null;
        cleanup.forEach(fn => fn());
        cleanup = [];
      }

      function setFromPointer(event: PointerEvent): void {
        const rect = element.nativeElement.getBoundingClientRect();
        const xPct = rect.width === 0 ? 0 : (event.clientX - rect.left) / rect.width;
        // invert y so the top of the surface is the channel maximum
        const yPct = rect.height === 0 ? 0 : 1 - (event.clientY - rect.top) / rect.height;
        const x = xRange().min + (xRange().max - xRange().min) * Math.max(0, Math.min(1, xPct));
        const y = yRange().min + (yRange().max - yRange().min) * Math.max(0, Math.min(1, yPct));
        setChannels(x, y);
      }

      function setValue(newValue: Color, options?: SetterOptions): void {
        const parent = picker();
        if (parent) {
          parent.setValue(newValue, options);
        } else {
          setLocal(newValue, { emit: false });
        }
        if (options?.emit !== false) {
          onValueChange?.(newValue);
          valueChange.emit(newValue);
        }
      }

      function setChannels(x: number, y: number, options?: SetterOptions): void {
        const newColor = converted()
          .withChannelValue(xChannel(), clampStep(x, xRange()))
          .withChannelValue(yChannel(), clampStep(y, yRange()));
        setValue(newColor, options);
      }

      function adjustChannel(channel: ColorChannel, delta: number, options?: SetterOptions): void {
        const range = channel === xChannel() ? xRange() : yRange();
        const current = channel === xChannel() ? xValue() : yValue();
        setValue(converted().withChannelValue(channel, clampStep(current + delta, range)), options);
      }

      function setThumb(newThumb: ElementRef<HTMLElement> | undefined): void {
        thumb.set(newThumb);
      }

      function focusThumb(origin: FocusOrigin): void {
        const el = thumb();
        if (el) {
          focusMonitor.focusVia(el, origin, { preventScroll: true });
        }
      }

      function setDisabled(isDisabled: boolean): void {
        disabled.set(isDisabled);
      }

      return {
        id,
        value,
        xChannel,
        yChannel,
        colorSpace,
        xValue,
        yValue,
        xRange,
        yRange,
        xPercentage,
        yPercentage,
        gradient,
        disabled,
        thumb,
        valueChange: valueChange.asObservable(),
        setValue,
        setDefaultValue: defaultValue.set,
        setChannels,
        adjustChannel,
        setThumb,
        focusThumb,
        setDisabled,
      } satisfies NgpColorAreaState;
    },
  );

/**
 * Build a CSS background for the 2D area.
 * ponytail: tuned for the default saturation(x)×brightness(y) square (the overwhelmingly common
 * pairing) — a white→transparent horizontal layer and a transparent→black vertical layer over the
 * full-strength base color. Consumers can override `--ngp-color-area-background` for other pairings.
 */
function areaGradient(
  color: Color,
  xChannel: ColorChannel,
  yChannel: ColorChannel,
  xRange: ColorChannelRange,
  yRange: ColorChannelRange,
): string {
  const base = color
    .withChannelValue(xChannel, xRange.max)
    .withChannelValue(yChannel, yRange.max)
    .toRgb();
  return `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, transparent), ${base}`;
}

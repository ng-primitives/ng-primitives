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
import { Color, ColorSpace } from '../color/color';

/**
 * Public state surface for the Color Wheel primitive - a circular control adjusting the hue channel.
 */
export interface NgpColorWheelState {
  /** The id of the wheel. */
  readonly id: Signal<string>;
  /** The current color value (the parent picker's value when inside one). */
  readonly value: Signal<Color>;
  /** The color space the wheel operates in. */
  readonly colorSpace: Signal<ColorSpace>;
  /** The current hue in degrees (0-360). */
  readonly hue: Signal<number>;
  /** A conic-gradient of the full hue spectrum. */
  readonly gradient: Signal<string>;
  /** Whether the wheel is disabled (includes form control state). */
  readonly disabled: WritableSignal<boolean>;
  /** @internal The thumb element reference. */
  readonly thumb: Signal<ElementRef<HTMLElement> | undefined>;
  /** Emits when the value changes. */
  readonly valueChange: Observable<Color>;
  /** Set the full color value. */
  setValue(value: Color, options?: SetterOptions): void;
  /** Set the hue to a value in degrees (clamped 0-360). */
  setHue(hue: number, options?: SetterOptions): void;
  /** @internal Register the thumb element. */
  setThumb(thumb: ElementRef<HTMLElement> | undefined): void;
  /** Focus the thumb element. */
  focusThumb(origin: FocusOrigin): void;
  /** Set the disabled state. */
  setDisabled(disabled: boolean): void;
}

/**
 * Inputs for configuring the Color Wheel primitive.
 */
export interface NgpColorWheelProps {
  readonly id?: Signal<string>;
  readonly value?: Signal<Color>;
  readonly colorSpace?: Signal<ColorSpace>;
  readonly disabled?: Signal<boolean>;
  readonly onValueChange?: (value: Color) => void;
}

/** Angle from the top of the circle, measured clockwise, in degrees (0-360). Matches CSS conic-gradient. */
function angleFromCenter(dx: number, dy: number): number {
  const deg = (Math.atan2(dx, -dy) * 180) / Math.PI;
  return (deg + 360) % 360;
}

export const [
  NgpColorWheelStateToken,
  ngpColorWheel,
  injectColorWheelState,
  provideColorWheelState,
] = createPrimitive(
  'NgpColorWheel',
  ({
    id = signal(uniqueId('ngp-color-wheel')),
    value: _value = signal(Color.parse('hsl(0, 100%, 50%)')),
    colorSpace = signal<ColorSpace>('hsl'),
    disabled: _disabled = signal(false),
    onValueChange,
  }: NgpColorWheelProps): NgpColorWheelState => {
    const element = injectElementRef<HTMLElement>();
    const focusMonitor = inject(FocusMonitor);
    const injector = inject(Injector);
    const document = inject(DOCUMENT);
    const picker = injectColorPickerState({ optional: true });
    const local = controlled(_value);
    const value = computed(() => picker()?.value() ?? local());
    const disabled = controlled(_disabled);
    const valueChange = emitter<Color>();
    const thumb = signal<ElementRef<HTMLElement> | undefined>(undefined);

    const status = ngpFormControl({ id, disabled });

    const converted = computed(() => value().toFormat(colorSpace()));
    const hue = computed(() => converted().getChannelValue('hue'));

    const gradient = computed(() => hueGradient(converted()));

    // Host bindings
    attrBinding(element, 'id', id);
    dataBinding(element, 'data-disabled', () => status().disabled);
    styleBinding(element, '--ngp-color-wheel-background', gradient);
    // the hue angle, for positioning the thumb: transform: rotate(var(--ngp-color-wheel-hue)) ...
    styleBinding(element, '--ngp-color-wheel-hue', () => `${hue()}deg`);

    let dragging = false;
    let activePointerId: number | null = null;
    let cleanup: (() => void)[] = [];

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
      const dx = event.clientX - (rect.left + rect.width / 2);
      const dy = event.clientY - (rect.top + rect.height / 2);
      setHue(angleFromCenter(dx, dy));
    }

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

    function setHue(newHue: number, options?: SetterOptions): void {
      const clamped = Math.min(360, Math.max(0, Math.round(newHue)));
      setValue(converted().withChannelValue('hue', clamped), options);
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
      colorSpace,
      hue,
      gradient,
      disabled,
      thumb,
      valueChange: valueChange.asObservable(),
      setValue,
      setHue,
      setThumb,
      focusThumb,
      setDisabled,
    } satisfies NgpColorWheelState;
  },
);

/** A conic-gradient of the full hue spectrum (red at top, clockwise), matching the thumb angle. */
function hueGradient(color: Color): string {
  const stops: string[] = [];
  for (let hue = 0; hue <= 360; hue += 60) {
    stops.push(color.withChannelValue('hue', hue).toRgb());
  }
  return `conic-gradient(${stops.join(', ')})`;
}

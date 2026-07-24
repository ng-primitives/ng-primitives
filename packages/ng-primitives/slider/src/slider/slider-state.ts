import { FocusMonitor, FocusOrigin } from '@angular/cdk/a11y';
import { computed, ElementRef, inject, Signal, signal, WritableSignal } from '@angular/core';
import { NgpOrientation } from 'ng-primitives/common';
import { ngpFormControl } from 'ng-primitives/form-field';
import { injectElementRef } from 'ng-primitives/internal';
import {
  attrBinding,
  controlled,
  controlledState,
  createPrimitive,
  dataBinding,
  deprecatedSetter,
  SetterOptions,
} from 'ng-primitives/state';
import { uniqueId } from 'ng-primitives/utils';
import { Observable } from 'rxjs';

/**
 * Public state surface for the Slider primitive.
 */
export interface NgpSliderState {
  /**
   * The id of the slider.
   */
  readonly id: Signal<string>;
  /**
   * The slider value.
   */
  readonly value: WritableSignal<number>;
  /**
   * The slider orientation.
   */
  readonly orientation: WritableSignal<NgpOrientation>;
  /**
   * Whether the slider is disabled (includes form control state).
   */
  readonly disabled: WritableSignal<boolean>;
  /**
   * The percentage position of the thumb.
   */
  readonly percentage: Signal<number>;
  /**
   * The minimum value of the slider.
   */
  readonly min: Signal<number>;
  /**
   * The maximum value of the slider.
   */
  readonly max: Signal<number>;
  /**
   * The step value of the slider.
   */
  readonly step: Signal<number>;
  /**
   * @internal The track element reference.
   */
  readonly track: Signal<ElementRef<HTMLElement> | undefined>;
  /**
   * @internal The thumb element reference.
   */
  readonly thumb: Signal<ElementRef<HTMLElement> | undefined>;
  /**
   * Emit when the value changes.
   */
  readonly valueChange: Observable<number>;
  /**
   * Set the current value (clamped).
   */
  setValue(value: number, options?: SetterOptions): void;
  /**
   * Set the default value used in uncontrolled mode.
   */
  setDefaultValue(value: number): void;
  /**
   * Register the track element.
   */
  setTrack(track: ElementRef<HTMLElement> | undefined): void;
  /**
   * Register the thumb element.
   */
  setThumb(thumb: ElementRef<HTMLElement> | undefined): void;
  /**
   * Focus the thumb element.
   */
  focusThumb(origin: FocusOrigin): void;
  /**
   * Set the disabled state.
   */
  setDisabled(disabled: boolean): void;
  /**
   * Set the orientation.
   */
  setOrientation(orientation: NgpOrientation): void;
}

/**
 * Inputs for configuring the Slider primitive.
 */
export interface NgpSliderProps {
  /**
   * The id of the slider.
   */
  readonly id?: Signal<string>;
  /**
   * The slider value. When defined the slider is controlled.
   */
  readonly value?: Signal<number | undefined>;
  /**
   * The default value for uncontrolled usage.
   */
  readonly defaultValue?: Signal<number>;
  /**
   * The minimum value.
   */
  readonly min?: Signal<number>;
  /**
   * The maximum value.
   */
  readonly max?: Signal<number>;
  /**
   * The step value.
   */
  readonly step?: Signal<number>;
  /**
   * The slider orientation.
   */
  readonly orientation?: Signal<NgpOrientation>;
  /**
   * Whether the slider is disabled.
   */
  readonly disabled?: Signal<boolean>;
  /**
   * Callback fired when the value changes.
   */
  readonly onValueChange?: (value: number) => void;
}

export const [NgpSliderStateToken, ngpSlider, injectSliderState, provideSliderState] =
  createPrimitive(
    'NgpSlider',
    ({
      id = signal(uniqueId('ngp-slider')),
      value: _value = signal<number | undefined>(undefined),
      defaultValue: _defaultValue,
      min = signal(0),
      max = signal(100),
      step = signal(1),
      orientation: _orientation = signal<NgpOrientation>('horizontal'),
      disabled: _disabled = signal(false),
      onValueChange,
    }: NgpSliderProps): NgpSliderState => {
      const element = injectElementRef();
      const focusMonitor = inject(FocusMonitor);
      const defaultValue = controlled(_defaultValue, 0);
      const [value, setValueInternal, valueChange] = controlledState<number>({
        value: _value,
        defaultValue,
        onChange: onValueChange,
      });
      const disabled = controlled(_disabled);
      const orientation = controlled(_orientation);

      const track = signal<ElementRef<HTMLElement> | undefined>(undefined);
      const thumb = signal<ElementRef<HTMLElement> | undefined>(undefined);

      // Form control integration
      const status = ngpFormControl({ id, disabled });

      const percentage = computed(() => {
        const range = max() - min();
        if (range <= 0) {
          return 0;
        }
        const pct = ((value() - min()) / range) * 100;
        return Math.min(100, Math.max(0, pct));
      });

      // Host bindings
      attrBinding(element, 'id', id);
      dataBinding(element, 'data-orientation', orientation);
      dataBinding(element, 'data-disabled', () => status().disabled);

      function setTrack(newTrack: ElementRef<HTMLElement> | undefined): void {
        track.set(newTrack);
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

      function setValue(newValue: number, options?: SetterOptions): void {
        const clamped = Math.min(max(), Math.max(min(), newValue));
        const stepped = Math.round((clamped - min()) / step()) * step() + min();
        const finalValue = Math.min(max(), Math.max(min(), stepped));
        setValueInternal(finalValue, options);
      }

      function setDisabled(isDisabled: boolean): void {
        disabled.set(isDisabled);
      }

      function setOrientation(newOrientation: NgpOrientation): void {
        orientation.set(newOrientation);
      }

      return {
        id,
        value: deprecatedSetter(value, 'setValue', setValue),
        min,
        max,
        step,
        orientation: deprecatedSetter(orientation, 'setOrientation'),
        disabled: deprecatedSetter(disabled, 'setDisabled'),
        valueChange,
        percentage,
        track,
        thumb,
        setValue,
        setDefaultValue: defaultValue.set,
        setTrack,
        setThumb,
        focusThumb,
        setDisabled,
        setOrientation,
      } satisfies NgpSliderState;
    },
  );

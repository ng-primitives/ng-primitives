import { computed, ElementRef, Signal, signal, WritableSignal } from '@angular/core';
import { NgpOrientation } from 'ng-primitives/common';
import { ngpFormControl } from 'ng-primitives/form-field';
import { injectElementRef } from 'ng-primitives/internal';
import {
  attrBinding,
  controlled,
  createPrimitive,
  dataBinding,
  deprecatedSetter,
  emitter,
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
   * Emit when the value changes.
   */
  readonly valueChange: Observable<number>;
  /**
   * Set the current value (clamped).
   */
  setValue(value: number): void;
  /**
   * Register the track element.
   */
  setTrack(track: ElementRef<HTMLElement> | undefined): void;
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
   * The slider value.
   */
  readonly value?: Signal<number>;
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
      value: _value = signal(0),
      min = signal(0),
      max = signal(100),
      step = signal(1),
      orientation: _orientation = signal<NgpOrientation>('horizontal'),
      disabled: _disabled = signal(false),
      onValueChange,
    }: NgpSliderProps): NgpSliderState => {
      const element = injectElementRef();
      const value = controlled(_value);
      const disabled = controlled(_disabled);
      const orientation = controlled(_orientation);

      const valueChange = emitter<number>();
      const track = signal<ElementRef<HTMLElement> | undefined>(undefined);

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

      function setValue(newValue: number): void {
        const clamped = Math.min(max(), Math.max(min(), newValue));
        value.set(clamped);
        onValueChange?.(clamped);
        valueChange.emit(clamped);
      }

      function setDisabled(isDisabled: boolean): void {
        disabled.set(isDisabled);
      }

      function setOrientation(newOrientation: NgpOrientation): void {
        orientation.set(newOrientation);
      }

      return {
        id,
        value,
        min,
        max,
        step,
        orientation: deprecatedSetter(orientation, 'setOrientation'),
        disabled: deprecatedSetter(disabled, 'setDisabled'),
        valueChange: valueChange.asObservable(),
        percentage,
        track,
        setValue,
        setTrack,
        setDisabled,
        setOrientation,
      };
    },
  );

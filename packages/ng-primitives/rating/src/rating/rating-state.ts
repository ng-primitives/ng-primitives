import { Signal, WritableSignal, computed, signal } from '@angular/core';
import { ngpFormControl } from 'ng-primitives/form-field';
import { injectElementRef } from 'ng-primitives/internal';
import {
  SetterOptions,
  attrBinding,
  controlled,
  controlledState,
  createPrimitive,
  dataBinding,
  deprecatedSetter,
  listener,
} from 'ng-primitives/state';
import { uniqueId } from 'ng-primitives/utils';
import { Observable } from 'rxjs';

/**
 * The derived render state for a single rating item (star).
 */
export interface NgpRatingItemState {
  /** The 1-based position of the item. */
  readonly index: number;
  /** Whether the item is fully filled. */
  readonly checked: boolean;
  /** Whether the item is half filled (only when `allowHalf`). */
  readonly half: boolean;
  /** The fill amount of the item, 0-1 (for fractional/readonly averages). */
  readonly fraction: number;
  /** Whether the item is part of the current hover preview. */
  readonly highlighted: boolean;
}

/**
 * Public state surface for the Rating primitive.
 */
export interface NgpRatingState {
  /** The id of the rating. */
  readonly id: Signal<string>;
  /** The committed rating value. */
  readonly value: WritableSignal<number>;
  /** The number of items. */
  readonly count: Signal<number>;
  /** Whether half values are allowed. */
  readonly allowHalf: Signal<boolean>;
  /** Whether the rating is disabled (includes form control state). */
  readonly disabled: Signal<boolean>;
  /** Whether the rating is read-only. */
  readonly readonly: Signal<boolean>;
  /** Emits when the committed value changes. */
  readonly valueChange: Observable<number>;
  /** Set the committed value (clamped to `[0, count]`). */
  setValue(value: number, options?: SetterOptions): void;
  /** Set the default value used in uncontrolled mode. */
  setDefaultValue(value: number): void;
  /** Set the disabled state (merged with any form control disabled state). */
  setDisabled(disabled: boolean): void;
  /**
   * @internal Commit an interactive value, clearing to 0 when re-selecting the
   * current value.
   */
  commit(value: number): void;
  /**
   * @internal Set the hover preview value.
   */
  preview(value: number): void;
  /**
   * @internal Derive the render state for the item at `index` (1-based).
   */
  itemState(index: number): NgpRatingItemState;
}

/**
 * Inputs for configuring the Rating primitive.
 */
export interface NgpRatingProps {
  /** The id of the rating. */
  readonly id?: Signal<string>;
  /** The committed rating value. When defined the rating is controlled. */
  readonly value?: Signal<number | undefined>;
  /** The default rating value for uncontrolled usage. */
  readonly defaultValue?: Signal<number>;
  /** The number of items. */
  readonly count?: Signal<number>;
  /** Whether half values are allowed. */
  readonly allowHalf?: Signal<boolean>;
  /** Whether the rating is disabled. */
  readonly disabled?: Signal<boolean>;
  /** Whether the rating is read-only. */
  readonly readonly?: Signal<boolean>;
  /** Whether re-selecting the current value clears the rating to 0. */
  readonly clearable?: Signal<boolean>;
  /** Produce the `aria-valuetext` string. */
  readonly valueText?: Signal<(value: number, count: number) => string>;
  /** Callback fired when the committed value changes. */
  readonly onValueChange?: (value: number) => void;
}

export const [NgpRatingStateToken, ngpRating, injectRatingState, provideRatingState] =
  createPrimitive(
    'NgpRating',
    ({
      id = signal(uniqueId('ngp-rating')),
      value: _value = signal<number | undefined>(undefined),
      defaultValue: _defaultValue,
      count = signal(5),
      allowHalf = signal(false),
      disabled: _disabled = signal(false),
      readonly = signal(false),
      clearable = signal(false),
      valueText = signal<(value: number, count: number) => string>(
        (value, count) => `${value} out of ${count}`,
      ),
      onValueChange,
    }: NgpRatingProps): NgpRatingState => {
      const element = injectElementRef<HTMLElement>();
      const defaultValue = controlled(_defaultValue, 0);
      const [value, setValueInternal, valueChange] = controlledState<number>({
        value: _value,
        defaultValue,
        onChange: onValueChange,
      });
      const disabledInput = controlled(_disabled);
      const hovered = signal<number | null>(null);

      // Merge the input disabled state with the form control (NgControl) state.
      const status = ngpFormControl({ id, disabled: disabledInput });
      const disabled = computed(() => status().disabled ?? false);

      const displayValue = computed(() => {
        const preview = hovered();
        return preview !== null ? preview : value();
      });

      function itemState(index: number): NgpRatingItemState {
        const fraction = Math.min(1, Math.max(0, displayValue() - (index - 1)));
        return {
          index,
          checked: fraction >= 1,
          half: allowHalf() && fraction >= 0.5 && fraction < 1,
          fraction,
          highlighted: hovered() !== null && fraction > 0,
        };
      }

      function setValue(newValue: number, options?: SetterOptions): void {
        const clamped = Math.min(count(), Math.max(0, newValue));
        setValueInternal(clamped, options);
      }

      function setDisabled(isDisabled: boolean): void {
        disabledInput.set(isDisabled);
      }

      function isInteractive(): boolean {
        return !disabled() && !readonly();
      }

      function commit(newValue: number): void {
        if (!isInteractive()) {
          return;
        }
        // Re-selecting the current value clears the rating, when clearable.
        if (newValue === value()) {
          if (clearable()) {
            setValue(0);
          }
          return;
        }
        setValue(newValue);
      }

      function preview(newValue: number): void {
        if (!isInteractive()) {
          return;
        }
        hovered.set(newValue);
      }

      function clearPreview(): void {
        hovered.set(null);
      }

      function onKeydown(event: KeyboardEvent): void {
        if (!isInteractive()) {
          return;
        }

        const step = allowHalf() ? 0.5 : 1;
        const isRTL = getComputedStyle(element.nativeElement).direction === 'rtl';
        const current = value();
        let next = current;

        switch (event.key) {
          case 'ArrowUp':
            next = current + step;
            break;
          case 'ArrowDown':
            next = current - step;
            break;
          case 'ArrowRight':
            next = isRTL ? current - step : current + step;
            break;
          case 'ArrowLeft':
            next = isRTL ? current + step : current - step;
            break;
          case 'Home':
            next = 0;
            break;
          case 'End':
            next = count();
            break;
          default:
            return;
        }

        event.preventDefault();
        // When not clearable, an existing rating can't be decreased to 0.
        const floor = !clearable() && current > 0 ? 1 : 0;
        next = Math.min(count(), Math.max(floor, next));
        if (next !== current) {
          setValue(next);
        }
      }

      // Host bindings
      attrBinding(element, 'role', 'slider');
      attrBinding(element, 'id', id);
      attrBinding(element, 'tabindex', () => (disabled() ? '-1' : '0'));
      attrBinding(element, 'aria-valuemin', '0');
      attrBinding(element, 'aria-valuemax', () => String(count()));
      attrBinding(element, 'aria-valuenow', () => String(value()));
      attrBinding(element, 'aria-valuetext', () => valueText()(value(), count()));
      attrBinding(element, 'aria-readonly', () => (readonly() ? 'true' : null));
      attrBinding(element, 'aria-disabled', () => (disabled() ? 'true' : null));
      dataBinding(element, 'data-readonly', readonly);
      dataBinding(element, 'data-hovered', () => hovered() !== null);

      // Listeners
      listener(element, 'keydown', onKeydown);
      listener(element, 'pointerleave', clearPreview);

      return {
        id,
        value: deprecatedSetter(value, 'setValue', setValue),
        count,
        allowHalf,
        disabled,
        readonly,
        valueChange,
        setValue,
        setDefaultValue: defaultValue.set,
        setDisabled,
        commit,
        preview,
        itemState,
      } satisfies NgpRatingState;
    },
  );

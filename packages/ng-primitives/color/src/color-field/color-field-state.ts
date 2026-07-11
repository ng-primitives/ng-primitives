import { computed, effect, Signal, signal, WritableSignal } from '@angular/core';
import { ngpInput } from 'ng-primitives/input';
import { injectElementRef } from 'ng-primitives/internal';
import {
  attrBinding,
  controlled,
  createPrimitive,
  emitter,
  listener,
  SetterOptions,
} from 'ng-primitives/state';
import { uniqueId } from 'ng-primitives/utils';
import { Observable } from 'rxjs';
import { injectColorPickerState } from '../color-picker/color-picker-state';
import { Color, ColorChannel, ColorChannelRange, ColorSpace } from '../color/color';

export type NgpColorFieldMode = 'hex' | 'channel';

/**
 * Public state surface for the Color Field primitive - a text input that edits a color as a hex
 * string, or a single channel as a number.
 */
export interface NgpColorFieldState {
  /** The id of the field. */
  readonly id: Signal<string>;
  /** The current color value (the parent picker's value when inside one). */
  readonly value: Signal<Color>;
  /** The editing mode - `hex` (whole color) or `channel` (single channel number). */
  readonly mode: Signal<NgpColorFieldMode>;
  /** The channel being edited, when in channel mode. */
  readonly channel: Signal<ColorChannel | undefined>;
  /** Whether the field is disabled. */
  readonly disabled: WritableSignal<boolean>;
  /** Emits when the value changes. */
  readonly valueChange: Observable<Color>;
  /** Set the full color value. */
  setValue(value: Color, options?: SetterOptions): void;
  /** Set the disabled state. */
  setDisabled(disabled: boolean): void;
}

/**
 * Inputs for configuring the Color Field primitive.
 */
export interface NgpColorFieldProps {
  readonly id?: Signal<string>;
  readonly value?: Signal<Color>;
  readonly channel?: Signal<ColorChannel | undefined>;
  readonly colorSpace?: Signal<ColorSpace | undefined>;
  readonly disabled?: Signal<boolean>;
  readonly onValueChange?: (value: Color) => void;
}

function spaceForChannel(channel: ColorChannel, valueSpace: ColorSpace): ColorSpace {
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

function clampStep(value: number, { min, max, step }: ColorChannelRange): number {
  const clamped = Math.min(max, Math.max(min, value));
  const stepped = Math.round((clamped - min) / step) * step + min;
  return Math.min(max, Math.max(min, stepped));
}

export const [
  NgpColorFieldStateToken,
  ngpColorField,
  injectColorFieldState,
  provideColorFieldState,
] = createPrimitive(
  'NgpColorField',
  ({
    id = signal(uniqueId('ngp-color-field')),
    value: _value = signal(Color.parse('#ff0000')),
    channel = signal<ColorChannel | undefined>(undefined),
    colorSpace: _colorSpace = signal<ColorSpace | undefined>(undefined),
    disabled = signal(false),
    onValueChange,
  }: NgpColorFieldProps): NgpColorFieldState => {
    const element = injectElementRef<HTMLInputElement>();
    // Bind to a parent color picker when present, otherwise own the value locally.
    const picker = injectColorPickerState({ optional: true });
    const local = controlled(_value);
    const value = computed(() => picker()?.value() ?? local());
    const valueChange = emitter<Color>();

    // Compose the base input primitive (form control, interactions, disabled binding).
    const input = ngpInput({ id, disabled });

    const mode = computed<NgpColorFieldMode>(() => (channel() ? 'channel' : 'hex'));

    // channel-mode derivations (only read while in channel mode)
    const colorSpace = computed(
      () => _colorSpace() ?? spaceForChannel(channel()!, value().getColorSpace()),
    );
    const converted = computed(() => value().toFormat(colorSpace()));
    const channelRange = computed(() => converted().getChannelRange(channel()!));
    const channelValue = computed(() => converted().getChannelValue(channel()!));

    const displayValue = computed(() => {
      if (mode() === 'hex') {
        const color = value();
        return color.getChannelValue('alpha') < 1 ? color.toHexa() : color.toHex();
      }
      // integer channels round to whole numbers; the fractional alpha channel (step 0.01) keeps 2dp
      return Number.isInteger(channelRange().step)
        ? String(Math.round(channelValue()))
        : String(Math.round(channelValue() * 100) / 100);
    });

    // Native input has no ARIA role of its own to add; hint the keyboard/autocomplete.
    attrBinding(element, 'inputmode', () => (mode() === 'channel' ? 'numeric' : 'text'));
    attrBinding(element, 'autocomplete', 'off');
    attrBinding(element, 'spellcheck', 'false');

    let focused = false;

    function render(): void {
      element.nativeElement.value = displayValue();
    }

    // Reflect external value changes into the input while the user is not editing.
    effect(() => {
      displayValue();
      if (!focused) {
        render();
      }
    });

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

    function parseInput(raw: string): Color | null {
      const text = raw.trim();
      if (mode() === 'hex') {
        try {
          return Color.parse(text.startsWith('#') ? text : `#${text}`);
        } catch {
          return null;
        }
      }
      if (text === '' || Number.isNaN(Number(text))) {
        return null;
      }
      return converted().withChannelValue(channel()!, clampStep(Number(text), channelRange()));
    }

    function commit(): void {
      const parsed = parseInput(element.nativeElement.value);
      if (parsed) {
        setValue(parsed);
      }
      // reformat to the canonical representation (also reverts invalid input)
      render();
    }

    // Restrict typed characters to the current mode.
    listener(element, 'input', () => {
      const current = element.nativeElement.value;
      const cleaned =
        mode() === 'hex' ? current.replace(/[^#0-9a-fA-F]/g, '') : current.replace(/[^0-9.]/g, '');
      // ponytail: naive sanitize resets the caret to the end — fine for these short fields.
      if (cleaned !== current) {
        element.nativeElement.value = cleaned;
      }
    });

    listener(element, 'keydown', (event: KeyboardEvent) => {
      if (input.disabled()) {
        return;
      }
      if (mode() === 'channel' && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) {
        event.preventDefault();
        const delta =
          (event.key === 'ArrowUp' ? 1 : -1) * channelRange().step * (event.shiftKey ? 10 : 1);
        setValue(
          converted().withChannelValue(
            channel()!,
            clampStep(channelValue() + delta, channelRange()),
          ),
        );
        render();
        return;
      }
      if (event.key === 'Enter') {
        commit();
      }
    });

    listener(element, 'focus', () => {
      focused = true;
      element.nativeElement.select();
    });

    listener(element, 'blur', () => {
      focused = false;
      commit();
    });

    function setDisabled(isDisabled: boolean): void {
      input.setDisabled(isDisabled);
    }

    return {
      id,
      value,
      mode,
      channel,
      disabled: input.disabled,
      valueChange: valueChange.asObservable(),
      setValue,
      setDisabled,
    } satisfies NgpColorFieldState;
  },
);

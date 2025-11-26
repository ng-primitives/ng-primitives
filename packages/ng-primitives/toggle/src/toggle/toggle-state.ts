import { computed, Signal, signal, WritableSignal } from '@angular/core';
import { ngpInteractions } from 'ng-primitives/interactions';
import { injectElementRef } from 'ng-primitives/internal';
import {
  attrBinding,
  controlled,
  createPrimitive,
  dataBinding,
  deprecatedSetter,
  listener,
} from 'ng-primitives/state';
import { Subject } from 'rxjs';

/**
 * Public state surface for the Toggle primitive.
 */
export interface NgpToggleState {
  /**
   * Whether the toggle is selected.
   */
  readonly selected: WritableSignal<boolean>;
  /**
   * Whether the toggle is disabled.
   */
  readonly disabled: WritableSignal<boolean>;
  /**
   * Emits when the selected state changes.
   */
  readonly selectedChange: Subject<boolean>;
  /**
   * Toggle the selected state.
   */
  toggle(event?: Event): void;
  /**
   * Set the selected state.
   */
  setSelected(value: boolean): void;
  /**
   * Set the disabled state.
   */
  setDisabled(value: boolean): void;
}

/**
 * Inputs for configuring the Toggle primitive.
 */
export interface NgpToggleProps {
  /**
   * Whether the toggle is selected.
   */
  readonly selected?: Signal<boolean>;
  /**
   * Whether the toggle is disabled.
   */
  readonly disabled?: Signal<boolean>;
  /**
   * Callback fired when the selected state changes.
   */
  readonly onSelectedChange?: (selected: boolean) => void;
}

export const [NgpToggleStateToken, ngpToggle, injectToggleState, provideToggleState] =
  createPrimitive(
    'NgpToggle',
    ({
      selected: _selected = signal(false),
      disabled: _disabled = signal(false),
      onSelectedChange,
    }: NgpToggleProps): NgpToggleState => {
      const element = injectElementRef<HTMLElement>();
      const selected = controlled(_selected);
      const disabled = controlled(_disabled);
      const isButton = element.nativeElement.tagName.toLowerCase() === 'button';

      const selectedChange = new Subject<boolean>();

      ngpInteractions({
        hover: true,
        press: true,
        focusVisible: true,
        disabled,
      });

      const tabindex = computed(() => (disabled() ? -1 : 0));

      // Host bindings
      attrBinding(element, 'type', () => (isButton ? 'button' : null));
      attrBinding(element, 'aria-pressed', selected);
      dataBinding(element, 'data-selected', selected);
      dataBinding(element, 'data-disabled', disabled);
      attrBinding(element, 'aria-disabled', disabled);
      attrBinding(element, 'tabindex', () => tabindex().toString());

      // Listeners
      listener(element, 'click', event => toggle(event));
      listener(element, 'keydown', (event: KeyboardEvent) => {
        if (event.key === ' ' || event.key === 'Spacebar') {
          if (!isButton && element.nativeElement.tagName !== 'a') {
            event.preventDefault();
            toggle(event);
          }
        }
      });

      function toggle(event?: Event): void {
        if (disabled()) {
          return;
        }

        event?.preventDefault?.();
        setSelected(!selected());
      }

      function setSelected(value: boolean): void {
        selected.set(value);
        onSelectedChange?.(value);
        selectedChange.next(value);
      }

      function setDisabled(value: boolean): void {
        disabled.set(value);
      }

      return {
        selected: deprecatedSetter(selected, 'setSelected'),
        disabled: deprecatedSetter(disabled, 'setDisabled'),
        selectedChange,
        toggle,
        setSelected,
        setDisabled,
      };
    },
  );

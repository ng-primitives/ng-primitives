import { HOST_TAG_NAME, Signal, computed, inject, signal } from '@angular/core';
import { ngpInteractions } from 'ng-primitives/interactions';
import { injectElementRef } from 'ng-primitives/internal';
import {
  attrBinding,
  createPrimitive,
  dataBinding,
  listener,
  onDestroy,
  onMount,
} from 'ng-primitives/state';
import { injectTabsetState } from '../tabset/tabset-state';

/**
 * The state for the NgpTabButton directive.
 */
export interface NgpTabButtonState {
  /**
   * The unique id for the tab button.
   */
  readonly id: Signal<string>;

  /**
   * Whether the tab is active.
   */
  readonly active: Signal<boolean>;

  /**
   * Select the tab this trigger controls.
   */
  select(): void;

  /**
   * Register this tab with the tabset.
   */
  register(): void;
}

/**
 * The props for the NgpTabButton state.
 */
export interface NgpTabButtonProps {
  /**
   * The value of the tab this trigger controls.
   */
  readonly value: Signal<string>;

  /**
   * Whether the tab is disabled.
   */
  readonly disabled?: Signal<boolean>;

  /**
   * The id of the tab button.
   */
  readonly id?: Signal<string | undefined>;
}

export const [NgpTabButtonStateToken, ngpTabButton, injectTabButtonState, provideTabButtonState] =
  createPrimitive('NgpTabButton', ({ value, disabled = signal(false), id }: NgpTabButtonProps) => {
    const element = injectElementRef();
    const tagName = inject(HOST_TAG_NAME);
    const tabset = injectTabsetState();

    // Computed properties
    const buttonId = computed(() => id?.() ?? `${tabset().id()}-button-${value()}`);
    const ariaControls = computed(() => `${tabset().id()}-panel-${value()}`);
    const active = computed(() => tabset().selectedTab() === value());

    // Host bindings
    attrBinding(element, 'role', 'tab');
    attrBinding(element, 'id', buttonId);
    attrBinding(element, 'aria-controls', ariaControls);
    dataBinding(element, 'data-active', () => (active() ? '' : null));
    dataBinding(element, 'data-disabled', () => (disabled?.() ? '' : null));
    attrBinding(element, 'disabled', () => (tagName === 'button' && disabled() ? '' : null));
    dataBinding(element, 'data-orientation', tabset().orientation);

    // Event listeners
    listener(element, 'click', select);
    listener(element, 'focus', activateOnFocus);

    // Setup interactions
    ngpInteractions({
      hover: true,
      press: true,
      focusVisible: true,
      disabled,
    });

    function select(): void {
      if (disabled?.() === false) {
        tabset().select(value());
      }
    }

    function activateOnFocus(): void {
      if (tabset().activateOnFocus()) {
        select();
      }
    }

    onMount(() => {
      // we can't use a required input for value as it is used in a computed property before the input is set
      if (value() === undefined) {
        throw new Error('ngpTabButton: value is required');
      }

      // Register with tabset now that inputs are available
      tabset().registerTab(value(), disabled);
    });

    // Unregister on destroy
    onDestroy(() => {
      tabset().unregisterTab(value());
    });

    return {
      id: buttonId,
      active,
      select,
    };
  });

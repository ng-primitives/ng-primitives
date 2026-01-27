import { Signal, computed, signal } from '@angular/core';
import { ngpButton } from 'ng-primitives/button';
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
    const tabset = injectTabsetState();

    // Computed properties
    const buttonId = computed(() => id?.() ?? `${tabset().id()}-button-${value()}`);
    const ariaControls = computed(() => `${tabset().id()}-panel-${value()}`);
    const active = computed(() => tabset().selectedTab() === value());

    ngpButton({ disabled, role: 'tab', type: 'button' });

    // Host bindings
    attrBinding(element, 'id', buttonId);
    attrBinding(element, 'aria-controls', ariaControls);
    attrBinding(element, 'aria-selected', active);
    dataBinding(element, 'data-active', active);
    dataBinding(element, 'data-orientation', () => tabset().orientation());

    // Event listeners
    listener(element, 'click', () => tabset().select(value()));
    listener(element, 'focus', activateOnFocus);

    function activateOnFocus(): void {
      if (tabset().activateOnFocus()) {
        element.nativeElement.click();
      }
    }

    onMount(() => {
      // we can't use a required input for value as it is used in a computed property before the input is set
      if (value() === undefined) {
        throw new Error('ngpTabButton: value is required');
      }

      // Register with tabset now that inputs are available
      tabset().registerTab({ value, disabled });
    });

    // Unregister on destroy
    onDestroy(() => {
      tabset().unregisterTab(value());
    });

    return {
      id: buttonId,
      active,
      select: () => element.nativeElement.click(),
    } satisfies NgpTabButtonState;
  });

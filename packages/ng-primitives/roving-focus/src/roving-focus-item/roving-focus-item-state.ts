import { FocusMonitor, FocusOrigin } from '@angular/cdk/a11y';
import { computed, ElementRef, inject, signal, Signal } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { attrBinding, createPrimitive, listener, onDestroy } from 'ng-primitives/state';
import { uniqueId } from 'ng-primitives/utils';
import { injectRovingFocusGroupState } from '../roving-focus-group/roving-focus-group-state';

/**
 * The state interface for the RovingFocusItem pattern.
 */
export interface NgpRovingFocusItemState {
  /**
   * The unique id of the roving focus item.
   */
  readonly id: Signal<string>;
  /**
   * Whether the item is disabled.
   */
  readonly disabled: Signal<boolean>;
  /**
   * The tabindex of the roving focus item.
   */
  readonly tabindex: Signal<number>;
  /**
   * The element reference of the roving focus item.
   */
  readonly element: ElementRef<HTMLElement>;
  /**
   * Focus the roving focus item.
   * @param origin The focus origin
   */
  focus(origin: FocusOrigin): void;
}

/**
 * The props interface for the RovingFocusItem pattern.
 */
export interface NgpRovingFocusItemProps {
  /**
   * Whether the item is disabled.
   */
  readonly disabled: Signal<boolean>;
}

export const [
  NgpRovingFocusItemStateToken,
  ngpRovingFocusItem,
  injectRovingFocusItemState,
  provideRovingFocusItemState,
] = createPrimitive(
  'NgpRovingFocusItem',
  ({ disabled = signal(false) }: NgpRovingFocusItemProps) => {
    const element = injectElementRef();
    const group = injectRovingFocusGroupState();
    const focusMonitor = inject(FocusMonitor);

    // genertate a unique id for the roving focus item - this is not a DOM id but an internal identifier
    const id = uniqueId('ngp-roving-focus-item');

    /**
     * Derive the tabindex of the roving focus item.
     */
    const tabindex = computed(() =>
      !group()?.disabled() && group()?.activeItem() === id ? 0 : -1,
    );

    // Setup host attribute bindings
    attrBinding(element, 'tabindex', () => tabindex().toString());

    // Setup keyboard event listener
    listener(element, 'keydown', (event: KeyboardEvent) => {
      if (disabled()) {
        return;
      }
      group()?.onKeydown(event);
    });

    // Setup click event listener
    listener(element, 'click', () => {
      if (disabled()) {
        return;
      }
      group()?.setActiveItem(id, 'mouse');
    });

    function focus(origin: FocusOrigin): void {
      focusMonitor.focusVia(element, origin);
    }

    const state: NgpRovingFocusItemState = {
      id: signal(id),
      disabled,
      tabindex,
      focus,
      element,
    };

    // Register the item when created
    group()?.register(state);

    // Unregister the item when destroyed
    onDestroy(() => group()?.unregister(state));

    return state;
  },
);
